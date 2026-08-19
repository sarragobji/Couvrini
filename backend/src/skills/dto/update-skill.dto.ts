import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSkillDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
