import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { UserRole } from '../../generated/prisma/enums';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';
import { QueryShiftDto } from './dto/query-shift.dto';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  async createShift(@Req() req: any, @Body() dto: CreateShiftDto) {
    return this.shiftsService.createShift(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getShifts(@Req() req: any, @Query() query: QueryShiftDto) {
    return this.shiftsService.getShifts(req.user, query);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getShiftById(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.getShiftById(req.user, id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  async updateShift(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateShiftDto,
  ) {
    return this.shiftsService.updateShift(req.user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  async deleteShift(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.shiftsService.deleteShift(req.user.id, id);
  }
}
