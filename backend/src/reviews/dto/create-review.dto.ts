import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min, Max } from 'class-validator';
import { ReviewRating } from '../../../generated/prisma/enums';

export class CreateReviewDto {
  @IsInt()
  missionId!: number;

  @IsInt()
  reviewedUserId!: number;

  @IsEnum(ReviewRating)
  rating!: ReviewRating;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  comment?: string;
}
