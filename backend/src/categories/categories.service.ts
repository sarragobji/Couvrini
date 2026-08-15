import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement category methods
  // - createCategory
  // - getCategories
  // - getCategoryById
  // - updateCategory
  // - deleteCategory
}
