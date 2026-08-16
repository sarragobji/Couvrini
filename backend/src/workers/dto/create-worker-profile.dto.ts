import { IsString, IsInt, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateWorkerProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string;

  @IsString()
  @IsOptional()
  resumeUrl?: string;

  @IsInt()
  @IsOptional()
  yearsOfExperience?: number;
}
