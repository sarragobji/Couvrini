import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsInt()
  shiftId!: number;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  message?: string;
}
