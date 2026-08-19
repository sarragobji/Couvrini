import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewRating } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: number, dto: CreateReviewDto) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: dto.missionId },
      include: { shift: true },
    });

    if (!mission) throw new NotFoundException('Mission not found');
    if (mission.status !== 'COMPLETED') {
      throw new BadRequestException('Reviews are only allowed for completed missions');
    }
    if (mission.workerId !== userId && mission.companyId !== userId) {
      throw new ForbiddenException('Only mission participants can leave a review');
    }

    if (dto.reviewedUserId === userId) {
      throw new BadRequestException('You cannot review yourself');
    }

    const existing = await this.prisma.review.findUnique({
      where: { missionId_reviewerId: { missionId: dto.missionId, reviewerId: userId } },
    });
    if (existing) throw new ConflictException('You already reviewed this mission');

    const review = await this.prisma.review.create({
      data: {
        missionId: dto.missionId,
        reviewerId: userId,
        reviewedUserId: dto.reviewedUserId,
        rating: dto.rating,
        comment: dto.comment ?? undefined,
      },
      include: {
        reviewedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    const reviews = await this.prisma.review.findMany({
      where: { reviewedUserId: dto.reviewedUserId },
      select: { rating: true },
    });

    const average = reviews.reduce((sum, item) => sum + Number(item.rating), 0) / reviews.length;

    await this.prisma.workerProfile.upsert({
      where: { userId: dto.reviewedUserId },
      create: {
        userId: dto.reviewedUserId,
        averageRating: average,
        totalReviews: reviews.length,
      },
      update: {
        averageRating: average,
        totalReviews: reviews.length,
      },
    });

    return review;
  }

  async getUserReviews(userId: number) {
    return this.prisma.review.findMany({
      where: { reviewedUserId: userId },
      include: {
        reviewer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        mission: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
