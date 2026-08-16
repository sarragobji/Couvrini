import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkerProfileDto } from './dto/create-worker-profile.dto';
import { UpdateWorkerProfileDto } from './dto/update-worker-profile.dto';
import { AddWorkerSkillDto } from './dto/add-worker-skill.dto';
import { AddWorkerCategoryDto } from './dto/add-worker-category.dto';
import { CreateWorkerAvailabilityDto } from './dto/create-worker-availability.dto';

@Injectable()
export class WorkersService {
  constructor(private readonly prisma: PrismaService) {}

  // ========== Worker Profile Methods ==========

  async createProfile(userId: number, createDto: CreateWorkerProfileDto) {
    const existingProfile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('Worker profile already exists for this user');
    }

    return this.prisma.workerProfile.create({
      data: {
        userId,
        bio: createDto.bio,
        resumeUrl: createDto.resumeUrl,
        yearsOfExperience: createDto.yearsOfExperience ?? 0,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        availability: true,
      },
    });
  }

  async getProfile(userId: number) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        availability: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    return profile;
  }

  async updateProfile(userId: number, updateDto: UpdateWorkerProfileDto) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    return this.prisma.workerProfile.update({
      where: { userId },
      data: {
        bio: updateDto.bio ?? profile.bio,
        resumeUrl: updateDto.resumeUrl ?? profile.resumeUrl,
        yearsOfExperience:
          updateDto.yearsOfExperience ?? profile.yearsOfExperience,
      },
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        availability: true,
      },
    });
  }

  async deleteProfile(userId: number) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    return this.prisma.workerProfile.delete({
      where: { userId },
    });
  }

  // ========== Worker Skills Methods ==========

  async addSkill(userId: number, addSkillDto: AddWorkerSkillDto) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    const skill = await this.prisma.skill.findUnique({
      where: { id: addSkillDto.skillId },
    });

    if (!skill) {
      throw new NotFoundException('Skill not found');
    }

    const existingSkill = await this.prisma.workerSkill.findUnique({
      where: {
        workerProfileId_skillId: {
          workerProfileId: profile.id,
          skillId: addSkillDto.skillId,
        },
      },
    });

    if (existingSkill) {
      throw new ConflictException('Worker already has this skill');
    }

    return this.prisma.workerSkill.create({
      data: {
        workerProfileId: profile.id,
        skillId: addSkillDto.skillId,
        proficiencyLevel: 'intermediate',
      },
      include: {
        skill: true,
      },
    });
  }

  async removeSkill(userId: number, skillId: number) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    const workerSkill = await this.prisma.workerSkill.findUnique({
      where: {
        workerProfileId_skillId: {
          workerProfileId: profile.id,
          skillId,
        },
      },
    });

    if (!workerSkill) {
      throw new NotFoundException('Worker skill relationship not found');
    }

    return this.prisma.workerSkill.delete({
      where: {
        workerProfileId_skillId: {
          workerProfileId: profile.id,
          skillId,
        },
      },
    });
  }

  // ========== Worker Category Methods ==========

  async addCategory(userId: number, addCategoryDto: AddWorkerCategoryDto) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: addCategoryDto.categoryId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const existingCategory = await this.prisma.workerCategory.findUnique({
      where: {
        workerProfileId_categoryId: {
          workerProfileId: profile.id,
          categoryId: addCategoryDto.categoryId,
        },
      },
    });

    if (existingCategory) {
      throw new ConflictException('Worker already has this category preference');
    }

    return this.prisma.workerCategory.create({
      data: {
        workerProfileId: profile.id,
        categoryId: addCategoryDto.categoryId,
      },
      include: {
        category: true,
      },
    });
  }

  async removeCategory(userId: number, categoryId: number) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    const workerCategory = await this.prisma.workerCategory.findUnique({
      where: {
        workerProfileId_categoryId: {
          workerProfileId: profile.id,
          categoryId,
        },
      },
    });

    if (!workerCategory) {
      throw new NotFoundException('Worker category preference not found');
    }

    return this.prisma.workerCategory.delete({
      where: {
        workerProfileId_categoryId: {
          workerProfileId: profile.id,
          categoryId,
        },
      },
    });
  }

  // ========== Worker Availability Methods ==========

  async createOrUpdateAvailability(
    userId: number,
    availabilityDto: CreateWorkerAvailabilityDto,
  ) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    if (availabilityDto.dayOfWeek < 0 || availabilityDto.dayOfWeek > 6) {
      throw new BadRequestException('dayOfWeek must be between 0 and 6 (0=Sunday, 6=Saturday)');
    }

    const existingAvailability = await this.prisma.workerAvailability.findUnique({
      where: {
        workerProfileId_dayOfWeek: {
          workerProfileId: profile.id,
          dayOfWeek: availabilityDto.dayOfWeek,
        },
      },
    });

    if (existingAvailability) {
      return this.prisma.workerAvailability.update({
        where: {
          workerProfileId_dayOfWeek: {
            workerProfileId: profile.id,
            dayOfWeek: availabilityDto.dayOfWeek,
          },
        },
        data: {
          startTime: availabilityDto.startTime ?? existingAvailability.startTime,
          endTime: availabilityDto.endTime ?? existingAvailability.endTime,
          isAvailable: availabilityDto.isAvailable ?? existingAvailability.isAvailable,
        },
      });
    }

    return this.prisma.workerAvailability.create({
      data: {
        workerProfileId: profile.id,
        dayOfWeek: availabilityDto.dayOfWeek,
        startTime: availabilityDto.startTime,
        endTime: availabilityDto.endTime,
        isAvailable: availabilityDto.isAvailable ?? true,
      },
    });
  }

  async getAvailability(userId: number) {
    const profile = await this.prisma.workerProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Worker profile not found');
    }

    return this.prisma.workerAvailability.findMany({
      where: { workerProfileId: profile.id },
      orderBy: { dayOfWeek: 'asc' },
    });
  }
}
