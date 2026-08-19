import { IsEnum, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';
import { VerificationStatus } from '../../../generated/prisma/enums';

export class CreateVerificationDto {
  @IsString()
  verificationType!: string;

  @IsInt()
  @IsOptional()
  userId?: number;

  @IsInt()
  @IsOptional()
  companyId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  documentUrl?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  reference?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  notes?: string;
}
