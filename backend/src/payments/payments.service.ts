import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PaymentStatus, UserRole } from '../../generated/prisma/enums'

import { PrismaService } from '../prisma/prisma.service'
import { CreatePaymentDto } from './dto/create-payment.dto'

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPayment(userId: number, dto: CreatePaymentDto) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: dto.missionId },
      include: {
        shift: true,
      },
    })

    if (!mission) {
      throw new NotFoundException('Mission not found')
    }

    // Payment should only be created after the mission is completed
    if (mission.status !== 'COMPLETED') {
      throw new BadRequestException(
        'Payment can only be created for a completed mission',
      )
    }

    // Make sure the current user belongs to the company
    const membership = await this.prisma.companyMember.findUnique({
      where: {
        userId_companyId: {
          userId,
          companyId: mission.companyId,
        },
      },
    })

    if (
      !membership ||
      (membership.role !== UserRole.MANAGER &&
        membership.role !== UserRole.EMPLOYEE)
    ) {
      throw new ForbiddenException(
        'Only a company manager or employee can create this payment',
      )
    }

    const existing = await this.prisma.payment.findUnique({
      where: {
        missionId: dto.missionId,
      },
    })

    if (existing) {
      throw new BadRequestException(
        'Payment already exists for this mission',
      )
    }

    return this.prisma.payment.create({
      data: {
        missionId: mission.id,

        // The person creating the payment is the payer
        payerId: userId,

        // The mission already tells us who should receive payment
        recipientId: mission.workerId,

        // The shift already contains the agreed payment amount
        amount: mission.shift.paymentAmount,

        currency: dto.currency ?? mission.shift.paymentCurrency,

        status: PaymentStatus.PENDING,
      },
    })
  }

  async getPayments(userId: number) {
    return this.prisma.payment.findMany({
      where: {
        OR: [
          { payerId: userId },
          { recipientId: userId },
        ],
      },
      include: {
        mission: {
          include: {
            shift: true,
            company: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  }

  async getPaymentById(userId: number, paymentId: number) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
      include: {
        mission: {
          include: {
            shift: true,
            company: true,
          },
        },
      },
    })

    if (!payment) {
      throw new NotFoundException('Payment not found')
    }

    if (
      payment.payerId !== userId &&
      payment.recipientId !== userId
    ) {
      throw new ForbiddenException(
        'You cannot access this payment',
      )
    }

    return payment
  }

  async updatePaymentStatus(
    userId: number,
    paymentId: number,
    status: PaymentStatus,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: {
        id: paymentId,
      },
    })

    if (!payment) {
      throw new NotFoundException('Payment not found')
    }

    if (payment.payerId !== userId) {
      throw new ForbiddenException(
        'Only the payer can update payment status',
      )
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Completed payment cannot be modified',
      )
    }

    const allowedStatuses = [
      PaymentStatus.PENDING,
      PaymentStatus.COMPLETED,
      PaymentStatus.FAILED,
      PaymentStatus.REFUNDED,
    ]

    if (!allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid payment status')
    }

    return this.prisma.payment.update({
      where: {
        id: paymentId,
      },
      data: {
        status,

        ...(status === PaymentStatus.COMPLETED
          ? { paymentDate: new Date() }
          : {}),
      },
    })
  }
}