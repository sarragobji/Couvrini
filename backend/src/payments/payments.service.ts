import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaymentStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(userId: number, dto: CreatePaymentDto) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: dto.missionId },
      include: { shift: true },
    });

    if (!mission) throw new NotFoundException('Mission not found');

    if (mission.companyId !== userId && mission.workerId !== userId) {
      const companyMembership = await this.prisma.companyMember.findUnique({
        where: { userId_companyId: { userId, companyId: mission.companyId } },
      });
      if (!companyMembership) {
        throw new ForbiddenException('You cannot create this payment');
      }
    }

    const existing = await this.prisma.payment.findUnique({
      where: { missionId: dto.missionId },
    });
    if (existing) {
      throw new BadRequestException('Payment already exists for this mission');
    }

    return this.prisma.payment.create({
      data: {
        missionId: dto.missionId,
        payerId: userId,
        recipientId: dto.recipientId,
        amount: dto.amount,
        currency: dto.currency ?? 'USD',
        status: PaymentStatus.PENDING,
      },
    });
  }

  async getPaymentById(userId: number, paymentId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: { mission: true },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.payerId !== userId && payment.recipientId !== userId) {
      throw new ForbiddenException('You cannot access this payment');
    }

    return payment;
  }

  async updatePaymentStatus(userId: number, paymentId: number, status: PaymentStatus) {
    const payment = await this.prisma.payment.findUnique({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.payerId !== userId) {
      throw new ForbiddenException('Only the payer can update payment status');
    }

    return this.prisma.payment.update({
      where: { id: paymentId },
      data: { status },
    });
  }
}
