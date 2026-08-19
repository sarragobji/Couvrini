import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { QueryShiftDto } from './dto/query-shift.dto';
import { ShiftStatus, UserRole } from '../../generated/prisma/enums';

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  private validateTimeWindow(startTime: string, endTime: string) {
    const toMinutes = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        throw new BadRequestException('Invalid time format. Use HH:mm.');
      }
      return hours * 60 + minutes;
    };

    const startMinutes = toMinutes(startTime);
    const endMinutes = toMinutes(endTime);

    if (endMinutes <= startMinutes) {
      throw new BadRequestException('endTime must be after startTime');
    }
  }

  private validateScheduledDateTime(date: string, startTime: string) {
    const scheduledAt = new Date(`${date}T${startTime}:00`);
    if (Number.isNaN(scheduledAt.getTime())) {
      throw new BadRequestException('Invalid shift date or time.');
    }

    const now = new Date();
    if (scheduledAt.getTime() < now.getTime()) {
      throw new BadRequestException('Shift date/time must be in the future.');
    }
  }

  private validateStatusTransition(currentStatus: ShiftStatus, nextStatus: ShiftStatus) {
    const allowedTransitions: Record<ShiftStatus, ShiftStatus[]> = {
      [ShiftStatus.OPEN]: [ShiftStatus.APPLICATIONS_REVIEW, ShiftStatus.ASSIGNED, ShiftStatus.CANCELLED],
      [ShiftStatus.APPLICATIONS_REVIEW]: [ShiftStatus.OPEN, ShiftStatus.ASSIGNED, ShiftStatus.CANCELLED],
      [ShiftStatus.ASSIGNED]: [ShiftStatus.IN_PROGRESS, ShiftStatus.CANCELLED],
      [ShiftStatus.IN_PROGRESS]: [ShiftStatus.COMPLETED, ShiftStatus.CANCELLED],
      [ShiftStatus.COMPLETED]: [],
      [ShiftStatus.CANCELLED]: [],
      [ShiftStatus.EXPIRED]: [],
    };

    if (nextStatus === currentStatus) {
      return;
    }

    const allowed = allowedTransitions[currentStatus] ?? [];
    if (!allowed.includes(nextStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${nextStatus}.`,
      );
    }
  }

  private async ensureCompanyAccess(companyId: number, userId: number) {
    const membership = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    if (!membership) {
      throw new ForbiddenException('You do not belong to this company');
    }
  }

  private async ensureShiftOwnershipOrManager(shiftId: number, userId: number) {
    const shift = await this.prisma.shift.findUnique({ where: { id: shiftId } });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (shift.createdByUserId !== userId) {
      const membership = await this.prisma.companyMember.findUnique({
        where: { userId_companyId: { userId, companyId: shift.companyId } },
      });

      if (!membership || membership.role !== UserRole.MANAGER) {
        throw new ForbiddenException('You cannot modify this shift');
      }
    }

    return shift;
  }

  async createShift(userId: number, dto: CreateShiftDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.EMPLOYEE && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only employees/managers can create shifts');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: dto.companyId },
    });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    await this.ensureCompanyAccess(dto.companyId, userId);

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    this.validateTimeWindow(dto.startTime, dto.endTime);
    this.validateScheduledDateTime(dto.shiftDate, dto.startTime);

    if (dto.requiredSkillIds && dto.requiredSkillIds.length > 0) {
      const skillIds = [...new Set(dto.requiredSkillIds)];
      const existingSkills = await this.prisma.skill.findMany({
        where: { id: { in: skillIds } },
        select: { id: true },
      });

      const validIds = new Set(existingSkills.map((skill) => skill.id));
      const invalidIds = skillIds.filter((id) => !validIds.has(id));
      if (invalidIds.length > 0) {
        throw new BadRequestException(
          `Required skill IDs not found: ${invalidIds.join(', ')}`,
        );
      }
    }

    const shift = await this.prisma.shift.create({
      data: {
        createdByUserId: userId,
        companyId: dto.companyId,
        categoryId: dto.categoryId,
        title: dto.title ?? undefined,
        description: dto.description ?? undefined,
        shiftDate: new Date(dto.shiftDate),
        startTime: dto.startTime,
        endTime: dto.endTime,
        location: dto.location ?? undefined,
        paymentAmount: dto.paymentAmount ?? 0,
        paymentCurrency: dto.paymentCurrency ?? 'USD',
        status: ShiftStatus.OPEN,
        notes: dto.notes ?? undefined,
      },
      include: {
        category: true,
        company: true,
        requiredSkills: {
          include: { skill: true },
        },
      },
    });

    if (dto.requiredSkillIds && dto.requiredSkillIds.length > 0) {
      await this.prisma.shiftRequiredSkill.createMany({
        data: [...new Set(dto.requiredSkillIds)].map((skillId) => ({
          shiftId: shift.id,
          skillId,
        })),
      });
    }

    return this.prisma.shift.findUnique({
      where: { id: shift.id },
      include: {
        category: true,
        company: true,
        requiredSkills: { include: { skill: true } },
      },
    });
  }

  async getShifts(user: { id: number; role: UserRole }, query: QueryShiftDto = {}) {
    const where: any = {};

    if (user.role === UserRole.WORKER) {
      where.status = ShiftStatus.OPEN;
    }

    if (user.role === UserRole.EMPLOYEE || user.role === UserRole.MANAGER) {
      const memberships = await this.prisma.companyMember.findMany({
        where: { userId: user.id },
        select: { companyId: true },
      });
      const companyIds = memberships.map((membership) => membership.companyId);

      if (companyIds.length === 0) {
        return [];
      }

      where.companyId = { in: companyIds };
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.date) {
      const dayStart = new Date(query.date);
      const dayEnd = new Date(query.date);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.shiftDate = {
        gte: dayStart,
        lt: dayEnd,
      };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.shift.findMany({
      where,
      include: {
        category: true,
        company: true,
        requiredSkills: { include: { skill: true } },
      },
      orderBy: { shiftDate: 'asc' },
    });
  }

  async getShiftById(user: { id: number; role: UserRole }, id: number) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: {
        category: true,
        company: true,
        requiredSkills: { include: { skill: true } },
        applications: {
          include: {
            worker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
              },
            },
          },
        },
      },
    });

    if (!shift) {
      throw new NotFoundException('Shift not found');
    }

    if (user.role === UserRole.WORKER && shift.status !== ShiftStatus.OPEN) {
      throw new ForbiddenException('Workers can only view open shifts');
    }

    if (user.role === UserRole.EMPLOYEE || user.role === UserRole.MANAGER) {
      const membership = await this.prisma.companyMember.findUnique({
        where: { userId_companyId: { userId: user.id, companyId: shift.companyId } },
      });

      if (!membership) {
        throw new ForbiddenException('You do not have access to this company shift');
      }
    }

    return shift;
  }

  async updateShift(userId: number, shiftId: number, dto: UpdateShiftDto) {
    const shift = await this.ensureShiftOwnershipOrManager(shiftId, userId);

    const nextDate = dto.shiftDate ? dto.shiftDate : new Date(shift.shiftDate).toISOString().slice(0, 10);
    const nextStartTime = dto.startTime ?? shift.startTime;
    const nextEndTime = dto.endTime ?? shift.endTime;

    if (dto.startTime || dto.endTime || dto.shiftDate) {
      this.validateTimeWindow(nextStartTime, nextEndTime);
      this.validateScheduledDateTime(nextDate, nextStartTime);
    }

    if (dto.status) {
      this.validateStatusTransition(shift.status, dto.status);
    }

    if (dto.companyId && dto.companyId !== shift.companyId) {
      await this.ensureCompanyAccess(dto.companyId, userId);
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
    }

    const updated = await this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        companyId: dto.companyId ?? shift.companyId,
        categoryId: dto.categoryId ?? shift.categoryId,
        title: dto.title ?? shift.title,
        description: dto.description ?? shift.description,
        shiftDate: dto.shiftDate ? new Date(dto.shiftDate) : shift.shiftDate,
        startTime: dto.startTime ?? shift.startTime,
        endTime: dto.endTime ?? shift.endTime,
        location: dto.location ?? shift.location,
        paymentAmount: dto.paymentAmount ?? shift.paymentAmount,
        paymentCurrency: dto.paymentCurrency ?? shift.paymentCurrency,
        status: dto.status ?? shift.status,
        notes: dto.notes ?? shift.notes,
      },
      include: {
        category: true,
        company: true,
        requiredSkills: { include: { skill: true } },
      },
    });

    if (dto.requiredSkillIds) {
      const existing = await this.prisma.shiftRequiredSkill.findMany({
        where: { shiftId },
        select: { skillId: true },
      });
      const existingIds = new Set(existing.map((item) => item.skillId));
      const nextIds = [...new Set(dto.requiredSkillIds)];

      const toRemove = [...existingIds].filter((id) => !nextIds.includes(id));
      const toAdd = nextIds.filter((id) => !existingIds.has(id));

      if (toRemove.length > 0) {
        await this.prisma.shiftRequiredSkill.deleteMany({
          where: { shiftId, skillId: { in: toRemove } },
        });
      }

      if (toAdd.length > 0) {
        const skills = await this.prisma.skill.findMany({
          where: { id: { in: toAdd } },
          select: { id: true },
        });
        const validIds = new Set(skills.map((skill) => skill.id));
        const invalidIds = toAdd.filter((id) => !validIds.has(id));
        if (invalidIds.length > 0) {
          throw new BadRequestException(
            `Required skill IDs not found: ${invalidIds.join(', ')}`,
          );
        }

        await this.prisma.shiftRequiredSkill.createMany({
          data: toAdd.map((skillId) => ({ shiftId, skillId })),
        });
      }
    }

    return this.prisma.shift.findUnique({
      where: { id: shiftId },
      include: {
        category: true,
        company: true,
        requiredSkills: { include: { skill: true } },
      },
    });
  }

  async deleteShift(userId: number, shiftId: number) {
    const shift = await this.ensureShiftOwnershipOrManager(shiftId, userId);

    if (shift.status === ShiftStatus.CANCELLED) {
      return {
        cancelled: true,
        shift,
      };
    }

    if (
      shift.status === ShiftStatus.ASSIGNED ||
      shift.status === ShiftStatus.IN_PROGRESS ||
      shift.status === ShiftStatus.COMPLETED
    ) {
      throw new BadRequestException('This shift cannot be cancelled while it is active or completed');
    }

    const cancelledShift = await this.prisma.shift.update({
      where: { id: shiftId },
      data: { status: ShiftStatus.CANCELLED },
      include: {
        category: true,
        company: true,
        requiredSkills: { include: { skill: true } },
      },
    });

    return {
      cancelled: true,
      shift: cancelledShift,
    };
  }
}
