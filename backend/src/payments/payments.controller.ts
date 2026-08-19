import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentStatus } from '../../generated/prisma/enums';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPayment(@Req() req: any, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(req.user.id, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPaymentById(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.paymentsService.getPaymentById(req.user.id, id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updatePaymentStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: PaymentStatus,
  ) {
    return this.paymentsService.updatePaymentStatus(req.user.id, id, status);
  }
}
