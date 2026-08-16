import { IsInt, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateWorkerAvailabilityDto {
  @IsInt()
  dayOfWeek!: number;

  @IsString()
  @IsOptional()
  startTime?: string;

  @IsString()
  @IsOptional()
  endTime?: string;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean = true;
}
