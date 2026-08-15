import { Controller } from '@nestjs/common';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  // TODO: Implement matching endpoints
  // - GET /matching/shifts/:shiftId/matches (get AI-ranked workers for a shift)
  // - POST /matching/shifts/:shiftId/compute (trigger AI matching for a shift)
}
