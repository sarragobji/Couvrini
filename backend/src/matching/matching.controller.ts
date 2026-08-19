import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../../generated/prisma/enums';
import { MatchingService } from './matching.service';
import { ComputeMatchDto } from './dto/compute-match.dto';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('shifts/:shiftId')
  @UseGuards(JwtAuthGuard)
  async getShiftMatches(@Req() req: any, @Param('shiftId', ParseIntPipe) shiftId: number) {
    return this.matchingService.getShiftMatches(shiftId);
  }

  @Post('shifts/compute')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN)
  async computeShiftMatches(@Body() dto: ComputeMatchDto) {
    return this.matchingService.computeShiftMatches(dto);
  }
}
