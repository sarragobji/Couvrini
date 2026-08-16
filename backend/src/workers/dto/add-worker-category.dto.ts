import { IsInt } from 'class-validator';

export class AddWorkerCategoryDto {
  @IsInt()
  categoryId!: number;
}
