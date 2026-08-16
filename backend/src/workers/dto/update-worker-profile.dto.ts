import { IsString, IsInt, IsOptional, MaxLength } from 'class-validator';

export class UpdateWorkerProfileDto {
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
