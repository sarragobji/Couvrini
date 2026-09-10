import { IsInt, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  missionId!: number;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  currency?: string;
}
