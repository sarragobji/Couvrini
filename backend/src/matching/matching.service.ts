import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComputeMatchDto } from './dto/compute-match.dto';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async getShiftMatches(shiftId: number) {
    const shift = await this.prisma.shift.findUnique({ where: { id: shiftId } });
    if (!shift) throw new NotFoundException('Shift not found');

    return this.prisma.workerMatchScore.findMany({
      where: { shiftId },
      include: {
        workerProfile: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [{ matchScore: 'desc' }, { ranking: 'asc' }],
    });
  }

  async computeShiftMatches(dto: ComputeMatchDto) {
    if (!dto.shiftId) {
      throw new BadRequestException('shiftId is required');
    }

    const shift = await this.prisma.shift.findUnique({
      where: { id: dto.shiftId },
      include: {
        category: true,
        requiredSkills: { include: { skill: true } },
      },
    });

    if (!shift) throw new NotFoundException('Shift not found');

    const workerProfiles = await this.prisma.workerProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        skills: { include: { skill: true } },
        categories: { include: { category: true } },
      },
    });

    const requiredSkillIds = shift.requiredSkills.map((item) => item.skillId);
    const results = workerProfiles
      .map((profile) => {
        let score = 0;
        const skillIds = profile.skills.map((item) => item.skillId);
        const categoryIds = profile.categories.map((item) => item.categoryId);

        if (profile.categories.some((item) => item.categoryId === shift.categoryId)) score += 30;
        if (profile.skills.some((item) => requiredSkillIds.includes(item.skillId))) score += 40;
        if (requiredSkillIds.length > 0) {
          const matchedCount = requiredSkillIds.filter((id) => skillIds.includes(id)).length;
          score += (matchedCount / requiredSkillIds.length) * 30;
        }
        if (profile.averageRating > 0) score += profile.averageRating * 10;
        if (profile.isVerified) score += 5;

        return {
          workerProfileId: profile.id,
          shiftId: shift.id,
          matchScore: Math.min(100, Math.max(0, score)),
          explanation: `Category + skill + rating match for ${shift.title ?? 'shift'}`,
        };
      })
      .filter((entry) => entry.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore)
      .map((entry, index) => ({ ...entry, ranking: index + 1 }));

    await this.prisma.workerMatchScore.deleteMany({ where: { shiftId: shift.id } });

    for (const result of results) {
      await this.prisma.workerMatchScore.upsert({
        where: {
          workerProfileId_shiftId: {
            workerProfileId: result.workerProfileId,
            shiftId: result.shiftId,
          },
        },
        update: {
          matchScore: result.matchScore,
          ranking: result.ranking,
          explanation: result.explanation,
        },
        create: {
          workerProfileId: result.workerProfileId,
          shiftId: result.shiftId,
          matchScore: result.matchScore,
          ranking: result.ranking,
          explanation: result.explanation,
        },
      });
    }

    return this.getShiftMatches(shift.id);
  }
}
