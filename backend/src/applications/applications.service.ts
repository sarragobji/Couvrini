import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement application methods
  // - createApplication
  // - getApplications
  // - getApplicationById
  // - updateApplicationStatus
  // - withdrawApplication
  // - getWorkerApplications
  // - getShiftApplications
}
