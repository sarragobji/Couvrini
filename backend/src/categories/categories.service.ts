import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name.trim() },
    });

    if (existing) {
      throw new ConflictException('Category already exists');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
      },
    });
  }

  async getCategories() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getCategoryById(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        shifts: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        workerCategories: {
          select: {
            id: true,
            workerProfileId: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.name) {
      const existing = await this.prisma.category.findUnique({
        where: { name: dto.name.trim() },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Category name already exists');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description !== undefined ? dto.description.trim() : undefined,
      },
    });
  }

  async deleteCategory(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const shifts = await this.prisma.shift.count({ where: { categoryId: id } });
    const workerCategories = await this.prisma.workerCategory.count({
      where: { categoryId: id },
    });

    if (shifts > 0 || workerCategories > 0) {
      throw new BadRequestException(
        'Category is in use and cannot be deleted safely.',
      );
    }

    await this.prisma.category.delete({ where: { id } });
    return { deleted: true };
  }
}
