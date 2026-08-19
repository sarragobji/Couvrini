import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { VerificationStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVerificationDto } from './dto/create-verification.dto';

@Injectable()
export class VerificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async submitVerification(userId: number, dto: CreateVerificationDto) {
    if (!dto.userId && !dto.companyId) {
      throw new BadRequestException('Either userId or companyId is required');
    }

    if (dto.userId && dto.companyId) {
      throw new BadRequestException('Provide either a user or company, not both');
    }

    if (dto.userId && dto.userId !== userId) {
      throw new ForbiddenException('You cannot submit a verification for another user');
    }

    return this.prisma.verification.create({
      data: {
        userId: dto.userId ?? null,
        companyId: dto.companyId ?? null,
        verificationType: dto.verificationType,
        documentUrl: dto.documentUrl ?? undefined,
        reference: dto.reference ?? undefined,
        notes: dto.notes ?? undefined,
        status: VerificationStatus.PENDING,
      },
    });
  }

  async getVerifications() {
    return this.prisma.verification.findMany({
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        company: true,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async updateVerificationStatus(id: number, status: VerificationStatus) {
    const verification = await this.prisma.verification.findUnique({ where: { id } });
    if (!verification) throw new NotFoundException('Verification request not found');

    const updated = await this.prisma.verification.update({
      where: { id },
      data: {
        status,
        verifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null,
      },
      include: {
        user: true,
        company: true,
      },
    });

    if (updated.userId) {
      await this.prisma.workerProfile.upsert({
        where: { userId: updated.userId },
        create: {
          userId: updated.userId,
          isVerified: status === VerificationStatus.VERIFIED,
        },
        update: {
          isVerified: status === VerificationStatus.VERIFIED,
        },
      });
    }

    if (updated.companyId) {
      await this.prisma.company.update({
        where: { id: updated.companyId },
        data: { isVerified: status === VerificationStatus.VERIFIED },
      });
    }

    return updated;
  }
}
