import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VerificationsService } from './verifications.service';
import { VerificationsController } from './verifications.controller';

@Module({
  imports: [PrismaModule],
  controllers: [VerificationsController],
  providers: [VerificationsService],
  exports: [VerificationsService],
})
export class VerificationsModule {}
