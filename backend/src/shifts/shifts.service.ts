import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement shift methods
  // - createShift
  // - getShifts
  // - getShiftById
  // - updateShift
  // - deleteShift
  // - addRequiredSkill
  // - removeRequiredSkill
  // - getShiftApplications
}
