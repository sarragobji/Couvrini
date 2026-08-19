import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ShiftStatus } from '../../../generated/prisma/enums';

export class QueryShiftDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  categoryId?: number;

  @IsOptional()
  @Transform(({ value }) => value)
  date?: string;

  @IsOptional()
  @IsEnum(ShiftStatus)
  status?: ShiftStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
