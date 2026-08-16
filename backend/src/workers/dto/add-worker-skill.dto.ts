import { IsInt } from 'class-validator';

export class AddWorkerSkillDto {
  @IsInt()
    skillId!: number;
}
