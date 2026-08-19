import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReviewRating, UserRole } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: number, dto: CreateReviewDto) {
    const mission = await this.prisma.mission.findUnique({
      where: { id: dto.missionId },
      include: {
        shift: true,
        worker: { select: { id: true, role: true } },
      },
    });

    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    if (mission.status !== 'COMPLETED') {
      throw new BadRequestException('Reviews are only allowed for completed missions');
    }

    const reviewerIsWorker = mission.workerId === userId;
    const reviewerIsResponsibleUser = mission.shift.createdByUserId === userId;

    if (!reviewerIsWorker && !reviewerIsResponsibleUser) {
      throw new ForbiddenException('Only mission participants can leave a review');
    }

    const expectedReviewedUserId = reviewerIsWorker
      ? mission.shift.createdByUserId
      : mission.workerId;

    if (dto.reviewedUserId !== expectedReviewedUserId) {
      throw new ForbiddenException('You can only review the other mission participant');
    }

    if (dto.reviewedUserId === userId) {
      throw new BadRequestException('You cannot review yourself');
    }

    if (mission.worker.role !== UserRole.WORKER) {
      throw new BadRequestException('The mission worker is not a worker account');
    }

    const existing = await this.prisma.review.findUnique({
      where: { missionId_reviewerId: { missionId: dto.missionId, reviewerId: userId } },
    });
    if (existing) throw new ConflictException('You already reviewed this mission');

    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
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
              role: true,
            },
          },
        },
      });

      if (mission.workerId === dto.reviewedUserId) {
        const reviews = await tx.review.findMany({
          where: { reviewedUserId: dto.reviewedUserId },
          select: { rating: true },
        });
        const ratingValues: Record<ReviewRating, number> = {
          [ReviewRating.ONE]: 1,
          [ReviewRating.TWO]: 2,
          [ReviewRating.THREE]: 3,
          [ReviewRating.FOUR]: 4,
          [ReviewRating.FIVE]: 5,
        };
        const average =
          reviews.reduce((sum, item) => sum + ratingValues[item.rating], 0) /
          reviews.length;

        await tx.workerProfile.updateMany({
          where: { userId: dto.reviewedUserId },
          data: {
            averageRating: average,
            totalReviews: reviews.length,
          },
        });
      }

      return review;
    });
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
