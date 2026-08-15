import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement review methods
  // - createReview
  // - getReviews
  // - getReviewById
  // - updateReview
  // - deleteReview
  // - getUserReviews
  // - getMissionReviews
}
