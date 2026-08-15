import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement worker profile methods
  // - createWorkerProfile
  // - getWorkerProfile
  // - updateWorkerProfile
  // - deleteWorkerProfile
  // - addSkillToWorker
  // - removeSkillFromWorker
  // - addCategoryPreference
  // - removeCategoryPreference
  // - setAvailability
}
