import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { WorkersModule } from './workers/workers.module';
import { CompaniesModule } from './companies/companies.module';
import { CategoriesModule } from './categories/categories.module';
import { SkillsModule } from './skills/skills.module';
import { ShiftsModule } from './shifts/shifts.module';
import { ApplicationsModule } from './applications/applications.module';
import { MissionsModule } from './missions/missions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { VerificationsModule } from './verifications/verifications.module';
import { PaymentsModule } from './payments/payments.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MatchingModule } from './matching/matching.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    UsersModule,
    WorkersModule,
    CompaniesModule,
    CategoriesModule,
    SkillsModule,
    ShiftsModule,
    ApplicationsModule,
    MissionsModule,
    ReviewsModule,
    VerificationsModule,
    PaymentsModule,
    NotificationsModule,
    MatchingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}