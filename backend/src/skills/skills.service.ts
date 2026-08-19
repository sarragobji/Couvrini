import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSkill(dto: CreateSkillDto) {
    const existing = await this.prisma.skill.findUnique({
      where: { name: dto.name.trim() },
    });

    if (existing) {
      throw new ConflictException('Skill already exists');
    }

    return this.prisma.skill.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
      },
    });
  }

  async getSkills() {
    return this.prisma.skill.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async getSkillById(id: number) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        workerSkills: {
          select: {
            id: true,
            workerProfileId: true,
          },
        },
        shiftRequiredSkills: {
          select: {
            id: true,
            shiftId: true,
          },
        },
      },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    return skill;
  }

  async updateSkill(id: number, dto: UpdateSkillDto) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    if (dto.name) {
      const existing = await this.prisma.skill.findUnique({
        where: { name: dto.name.trim() },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Skill name already exists');
      }
    }

    return this.prisma.skill.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        description: dto.description !== undefined ? dto.description.trim() : undefined,
      },
    });
  }

  async deleteSkill(id: number) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const workerSkills = await this.prisma.workerSkill.count({
      where: { skillId: id },
    });
    const shiftRequiredSkills = await this.prisma.shiftRequiredSkill.count({
      where: { skillId: id },
    });

    if (workerSkills > 0 || shiftRequiredSkills > 0) {
      throw new BadRequestException(
        'Skill is in use and cannot be deleted safely.',
      );
    }

    await this.prisma.skill.delete({ where: { id } });
    return { deleted: true };
  }
}
