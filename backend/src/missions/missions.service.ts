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

  async getMissionById(userId: number, missionId: number) {
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

    const isParticipant = mission.workerId === userId;
    const isCompanyMember = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId: mission.companyId } },
    });

    if (!isParticipant && !isCompanyMember) {
      throw new ForbiddenException('You cannot access this mission');
    }

    return mission;
  }

  async getMyMissions(userId: number) {
    return this.prisma.mission.findMany({
      where: { workerId: userId },
      include: {
        shift: true,
        company: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateMissionStatus(userId: number, missionId: number, dto: UpdateMissionStatusDto) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
      include: { shift: true },
    });

    if (!mission) throw new NotFoundException('Mission not found');

    const isWorker = mission.workerId === userId;
    const isManager = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId: mission.companyId } },
    });

    if (!isWorker && !(isManager && isManager.role === UserRole.MANAGER)) {
      throw new ForbiddenException('You cannot update this mission');
    }

    if (dto.status === MissionStatus.COMPLETED) {
      if (mission.status !== MissionStatus.IN_PROGRESS && mission.status !== MissionStatus.ASSIGNED) {
        throw new BadRequestException('Mission must be in progress before completing');
      }

      await this.prisma.mission.update({
        where: { id: missionId },
        data: {
          status: MissionStatus.COMPLETED,
          completedAt: new Date(),
        },
      });

      await this.prisma.shift.update({
        where: { id: mission.shiftId },
        data: { status: ShiftStatus.COMPLETED },
      });

      await this.prisma.notification.create({
        data: {
          userId: mission.companyId ? mission.workerId : mission.workerId,
          type: 'MISSION_ASSIGNED',
          title: 'Mission completed',
          message: `Mission #${missionId} was completed.`,
          relatedMissionId: missionId,
        },
      });
    } else if (dto.status === MissionStatus.IN_PROGRESS) {
      if (mission.status !== MissionStatus.ASSIGNED) {
        throw new BadRequestException('Mission must be assigned before progressing');
      }

      await this.prisma.mission.update({
        where: { id: missionId },
        data: { status: MissionStatus.IN_PROGRESS, startedAt: new Date() },
      });
    } else if (dto.status === MissionStatus.CANCELLED) {
      await this.prisma.mission.update({
        where: { id: missionId },
        data: { status: MissionStatus.CANCELLED },
      });
    } else if (dto.status === MissionStatus.ASSIGNED) {
      await this.prisma.mission.update({
        where: { id: missionId },
        data: { status: MissionStatus.ASSIGNED },
      });
    }

    return this.prisma.mission.findUnique({
      where: { id: missionId },
      include: { shift: true, company: true, worker: true },
    });
  }
}
