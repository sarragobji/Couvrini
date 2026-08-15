import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MissionsService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement mission methods
  // - createMission
  // - getMissions
  // - getMissionById
  // - updateMissionStatus
  // - startMission
  // - completeMission
  // - getWorkerMissions
  // - getCompanyMissions
}
