import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VerificationsService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement verification methods
  // - submitVerification
  // - getVerifications
  // - getVerificationById
  // - approveVerification
  // - rejectVerification
  // - getUserVerifications
  // - getCompanyVerifications
}
