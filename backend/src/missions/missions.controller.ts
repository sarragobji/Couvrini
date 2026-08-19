import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MissionsService } from './missions.service';
import { UpdateMissionStatusDto } from './dto/update-mission-status.dto';

@Controller('missions')
export class MissionsController {
  constructor(private readonly missionsService: MissionsService) {}

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyMissions(@Req() req: any) {
    return this.missionsService.getMyMissions(req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getMissionById(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.missionsService.getMissionById(req.user, id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateMissionStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMissionStatusDto,
  ) {
    return this.missionsService.updateMissionStatus(req.user, id, dto);
  }
}
