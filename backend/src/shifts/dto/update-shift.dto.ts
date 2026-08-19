import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ShiftStatus } from '../../../generated/prisma/enums';

export class UpdateShiftDto {
  @IsInt()
  @IsOptional()
  companyId?: number;

  @IsInt()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  @IsOptional()
  shiftDate?: string;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  paymentAmount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  paymentCurrency?: string;

  @IsEnum(ShiftStatus)
  @IsOptional()
  status?: ShiftStatus;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  requiredSkillIds?: number[];
}
