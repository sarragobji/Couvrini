import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { ShiftStatus } from '../../../generated/prisma/enums';

export class CreateShiftDto {
  @IsInt()
  companyId!: number;

  @IsInt()
  categoryId!: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  title?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsDateString()
  shiftDate!: string;

  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @IsString()
  @IsNotEmpty()
  endTime!: string;

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
  paymentCurrency?: string = 'USD';

  @IsEnum(ShiftStatus)
  @IsOptional()
  status?: ShiftStatus = ShiftStatus.OPEN;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;

  @IsArray()
  @IsInt({ each: true })
  @IsOptional()
  requiredSkillIds?: number[];
}
