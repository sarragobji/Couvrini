import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MatchingService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement matching methods (for future AI service integration)
  // - storeMatchScore
  // - getMatchScores
  // - getMatchScoreById
  // - updateMatchScore
  // - deleteMatchScore
  // - getShiftMatches
  // - getWorkerMatches
  // - callAIMatchingService (will call external FastAPI service)
}
