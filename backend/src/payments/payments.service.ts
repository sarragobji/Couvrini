import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement payment methods
  // - createPayment
  // - getPayments
  // - getPaymentById
  // - updatePaymentStatus
  // - completePayment
  // - refundPayment
  // - getPaymentsByMission
}
