import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../../generated/prisma/enums';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';

@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  async createApplication(@Req() req: any, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.createApplication(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN)
  async getApplications() {
    return this.applicationsService.getApplications();
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  async getMyApplications(@Req() req: any) {
    return this.applicationsService.getMyApplications(req.user.id);
  }

  @Get('shift/:shiftId')
  @UseGuards(JwtAuthGuard)
  async getShiftApplications(
    @Req() req: any,
    @Param('shiftId', ParseIntPipe) shiftId: number,
  ) {
    return this.applicationsService.getShiftApplications(req.user, shiftId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getApplicationById(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.getApplicationById(req.user, id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER, UserRole.ADMIN)
  async updateApplicationStatus(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateApplicationStatus(req.user, id, dto);
  }

  @Patch(':id/withdraw')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.WORKER)
  async withdrawApplication(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.applicationsService.withdrawApplication(req.user.id, id);
  }
}
