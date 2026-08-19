import { IsInt, IsOptional, IsString } from 'class-validator';

export class ComputeMatchDto {
  @IsInt()
  shiftId!: number;

  @IsString()
  @IsOptional()
  strategy?: string;
}
