import { IsInt, IsOptional, IsString } from 'class-validator';

export class AddShiftRequiredSkillDto {
  @IsInt()
  skillId!: number;

  @IsString()
  @IsOptional()
  requiredLevel?: string;
}
