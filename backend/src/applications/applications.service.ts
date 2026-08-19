import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ApplicationStatus, ShiftStatus, UserRole } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureShiftOpenForApplication(shiftId: number) {
    const shift = await this.prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.status !== ShiftStatus.OPEN) {
      throw new BadRequestException('This shift is not accepting applications');
    }

    return shift;
  }

  async createApplication(userId: number, dto: CreateApplicationDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.WORKER) {
      throw new ForbiddenException('Only workers can apply');
    }

    const shift = await this.ensureShiftOpenForApplication(dto.shiftId);

    if (shift.createdByUserId === userId) {
      throw new ForbiddenException('You cannot apply to your own shift');
    }

    const existingApplication = await this.prisma.application.findUnique({
      where: { shiftId_workerId: { shiftId: dto.shiftId, workerId: userId } },
    });

    if (existingApplication) {
      throw new ConflictException('You already applied to this shift');
    }

    const workerProfile = await this.prisma.workerProfile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
      },
    });

    if (!workerProfile) {
      throw new BadRequestException('Complete your worker profile before applying');
    }

    const requiredSkills = await this.prisma.shiftRequiredSkill.findMany({
      where: { shiftId: shift.id },
      select: { skillId: true },
    });

    if (requiredSkills.length > 0) {
      const workerSkillIds = new Set(workerProfile.skills.map((item) => item.skillId));
      const missingSkills = requiredSkills.filter(
        (requiredSkill) => !workerSkillIds.has(requiredSkill.skillId),
      );

      if (missingSkills.length > 0) {
        throw new BadRequestException(
          'You do not meet the required skills for this shift',
        );
      }
    }

    return this.prisma.application.create({
      data: {
        shiftId: dto.shiftId,
        workerId: userId,
        message: dto.message ?? undefined,
        status: ApplicationStatus.PENDING,
      },
      include: {
        shift: true,
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async getApplications(userId?: number, viewerRole?: UserRole) {
    const where: any = {};

    if (viewerRole === UserRole.WORKER && userId !== undefined) {
      where.workerId = userId;
    }

    return this.prisma.application.findMany({
      where,
      include: {
        shift: true,
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async getApplicationById(
    user: { id: number; role: UserRole },
    applicationId: number,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        shift: true,
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (user.role === UserRole.ADMIN || application.workerId === user.id) {
      return application;
    }

    const membership = await this.prisma.companyMember.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: application.shift.companyId,
        },
      },
    });

    if (
      !membership ||
      (membership.role !== UserRole.EMPLOYEE && membership.role !== UserRole.MANAGER)
    ) {
      throw new ForbiddenException('You cannot access this application');
    }

    return application;
  }

  async getMyApplications(userId: number) {
    return this.prisma.application.findMany({
      where: { workerId: userId },
      include: {
        shift: true,
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async getShiftApplications(user: { id: number; role: UserRole }, shiftId: number) {
    const shift = await this.prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (user.role === UserRole.ADMIN) {
      return this.prisma.application.findMany({
        where: { shiftId },
        include: {
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
          shift: true,
        },
        orderBy: { appliedAt: 'desc' },
      });
    }

    const membership = await this.prisma.companyMember.findUnique({
      where: {
        userId_companyId: {
          userId: user.id,
          companyId: shift.companyId,
        },
      },
    });

    if (
      !membership ||
      (membership.role !== UserRole.EMPLOYEE && membership.role !== UserRole.MANAGER)
    ) {
      throw new ForbiddenException('You cannot view applications for this shift');
    }

    return this.prisma.application.findMany({
      where: { shiftId },
      include: {
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        shift: true,
      },
      orderBy: { appliedAt: 'desc' },
    });
  }

  async updateApplicationStatus(
    user: { id: number; role: UserRole },
    applicationId: number,
    dto: UpdateApplicationStatusDto,
  ) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { shift: true },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (user.role !== UserRole.ADMIN) {
      const membership = await this.prisma.companyMember.findUnique({
        where: {
          userId_companyId: {
            userId: user.id,
            companyId: application.shift.companyId,
          },
        },
      });

      if (
        !membership ||
        (membership.role !== UserRole.EMPLOYEE && membership.role !== UserRole.MANAGER)
      ) {
        throw new ForbiddenException('You cannot manage this application');
      }
    }

    if (dto.status === ApplicationStatus.PENDING) {
      if (application.status === ApplicationStatus.PENDING) {
        return application;
      }

      throw new BadRequestException(
        'Only a pending application can be set back to PENDING',
      );
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Only pending applications can be accepted or rejected');
    }

    if (dto.status === ApplicationStatus.ACCEPTED) {
      const updatedApplication = await this.prisma.$transaction(async (tx) => {
        const acceptedApplication = await tx.application.findFirst({
          where: {
            shiftId: application.shiftId,
            status: ApplicationStatus.ACCEPTED,
            id: { not: applicationId },
          },
          select: { id: true },
        });

        if (acceptedApplication) {
          throw new ConflictException(
            'Another application has already been accepted for this shift',
          );
        }

        await tx.application.update({
          where: { id: applicationId },
          data: {
            status: ApplicationStatus.ACCEPTED,
            reviewedAt: new Date(),
          },
        });

        await tx.application.updateMany({
          where: {
            shiftId: application.shiftId,
            status: ApplicationStatus.PENDING,
            id: { not: applicationId },
          },
          data: {
            status: ApplicationStatus.REJECTED,
            reviewedAt: new Date(),
          },
        });

        await tx.shift.update({
          where: { id: application.shiftId },
          data: { status: ShiftStatus.ASSIGNED },
        });

        return tx.application.findUnique({
          where: { id: applicationId },
          include: {
            shift: true,
            worker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        });
      });

      return updatedApplication;
    }

    if (dto.status === ApplicationStatus.REJECTED) {
      const updatedApplication = await this.prisma.application.update({
        where: { id: applicationId },
        data: {
          status: ApplicationStatus.REJECTED,
          reviewedAt: new Date(),
        },
        include: {
          shift: true,
          worker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      });

      return updatedApplication;
    }

    throw new BadRequestException('Invalid application status');
  }

  async withdrawApplication(userId: number, applicationId: number) {
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (application.workerId !== userId) {
      throw new ForbiddenException("You cannot withdraw another worker's application");
    }

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException('Only pending applications can be withdrawn');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'WITHDRAWN',
      },
    });
  }
}
