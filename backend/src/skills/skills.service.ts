import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SkillsService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement skill methods
  // - createSkill
  // - getSkills
  // - getSkillById
  // - updateSkill
  // - deleteSkill
}
