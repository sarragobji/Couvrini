import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkersService } from './workers.service';
import { CreateWorkerProfileDto } from './dto/create-worker-profile.dto';
import { UpdateWorkerProfileDto } from './dto/update-worker-profile.dto';
import { AddWorkerSkillDto } from './dto/add-worker-skill.dto';
import { AddWorkerCategoryDto } from './dto/add-worker-category.dto';
import { CreateWorkerAvailabilityDto } from './dto/create-worker-availability.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('workers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('WORKER')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  // ========== Profile Endpoints ==========

  @Post('profile')
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @Req() req: any,
    @Body() createProfileDto: CreateWorkerProfileDto,
  ) {
    return this.workersService.createProfile(req.user.id, createProfileDto);
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.workersService.getProfile(req.user.id);
  }

  @Put('profile')
  async updateProfile(
    @Req() req: any,
    @Body() updateProfileDto: UpdateWorkerProfileDto,
  ) {
    return this.workersService.updateProfile(req.user.id, updateProfileDto);
  }

  @Delete('profile')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteProfile(@Req() req: any) {
    await this.workersService.deleteProfile(req.user.id);
  }

  // ========== Skills Endpoints ==========

  @Post('skills')
  @HttpCode(HttpStatus.CREATED)
  async addSkill(@Req() req: any, @Body() addSkillDto: AddWorkerSkillDto) {
    return this.workersService.addSkill(req.user.id, addSkillDto);
  }

  @Delete('skills/:skillId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeSkill(@Req() req: any, @Param('skillId') skillId: string) {
    await this.workersService.removeSkill(req.user.id, parseInt(skillId, 10));
  }

  // ========== Categories Endpoints ==========

  @Post('categories')
  @HttpCode(HttpStatus.CREATED)
  async addCategory(
    @Req() req: any,
    @Body() addCategoryDto: AddWorkerCategoryDto,
  ) {
    return this.workersService.addCategory(req.user.id, addCategoryDto);
  }

  @Delete('categories/:categoryId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeCategory(
    @Req() req: any,
    @Param('categoryId') categoryId: string,
  ) {
    await this.workersService.removeCategory(req.user.id, parseInt(categoryId, 10));
  }

  // ========== Availability Endpoints ==========

  @Post('availability')
  @HttpCode(HttpStatus.CREATED)
  async createOrUpdateAvailability(
    @Req() req: any,
    @Body() availabilityDto: CreateWorkerAvailabilityDto,
  ) {
    return this.workersService.createOrUpdateAvailability(
      req.user.id,
      availabilityDto,
    );
  }

  @Get('availability')
  async getAvailability(@Req() req: any) {
    return this.workersService.getAvailability(req.user.id);
  }
}
