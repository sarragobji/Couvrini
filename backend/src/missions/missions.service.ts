import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MissionStatus, ShiftStatus, UserRole } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMissionStatusDto } from './dto/update-mission-status.dto';

@Injectable()
export class MissionsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureCompanyParticipant(userId: number, companyId: number) {
    const membership = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    if (
      !membership ||
      (membership.role !== UserRole.EMPLOYEE && membership.role !== UserRole.MANAGER)
    ) {
      throw new ForbiddenException('You are not responsible for this company mission');
    }
  }

  async getMissionById(user: { id: number; role: UserRole }, missionId: number) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        shift: true,
        company: true,
        worker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        application: true,
      },
    });

    if (!mission) throw new NotFoundException('Mission not found');

    if (user.role !== UserRole.ADMIN && mission.workerId !== user.id) {
      await this.ensureCompanyParticipant(user.id, mission.companyId);
    }

    return mission;
  }

  async getMyMissions(user: { id: number; role: UserRole }) {
    let where: { workerId?: number; companyId?: { in: number[] } };

    if (user.role === UserRole.WORKER) {
      where = { workerId: user.id };
    } else if (user.role === UserRole.ADMIN) {
      where = {};
    } else {
      const memberships = await this.prisma.companyMember.findMany({
        where: {
          userId: user.id,
          role: { in: [UserRole.EMPLOYEE, UserRole.MANAGER] },
        },
        select: { companyId: true },
      });

      where = { companyId: { in: memberships.map((item) => item.companyId) } };
    }

    return this.prisma.mission.findMany({
      where,
      include: {
        shift: true,
        company: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateMissionStatus(
    user: { id: number; role: UserRole },
    missionId: number,
    dto: UpdateMissionStatusDto,
  ) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: { shift: true },
    });

    if (!mission) throw new NotFoundException('Mission not found');

    if (user.role !== UserRole.ADMIN && mission.workerId !== user.id) {
      await this.ensureCompanyParticipant(user.id, mission.companyId);
    }

    if (dto.status === mission.status) {
      return mission;
    }

    const allowedTransitions: Record<MissionStatus, MissionStatus[]> = {
      [MissionStatus.ASSIGNED]: [MissionStatus.IN_PROGRESS, MissionStatus.CANCELLED],
      [MissionStatus.IN_PROGRESS]: [MissionStatus.COMPLETED, MissionStatus.CANCELLED],
      [MissionStatus.COMPLETED]: [],
      [MissionStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[mission.status].includes(dto.status)) {
      throw new BadRequestException(
        `Invalid mission status transition from ${mission.status} to ${dto.status}`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedMission = await tx.mission.update({
        where: { id: missionId },
        data: {
          status: dto.status,
          startedAt: dto.status === MissionStatus.IN_PROGRESS ? new Date() : undefined,
          completedAt: dto.status === MissionStatus.COMPLETED ? new Date() : undefined,
        },
        include: { shift: true, company: true, worker: true },
      });

      if (dto.status === MissionStatus.COMPLETED) {
        await tx.shift.update({
          where: { id: mission.shiftId },
          data: { status: ShiftStatus.COMPLETED },
        });
      }

      return updatedMission;
    });
  }
}
