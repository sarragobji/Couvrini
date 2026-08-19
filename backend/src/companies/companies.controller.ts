import {
  Body,
  Controller,
  Delete,
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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AddCompanyMemberDto } from './dto/add-company-member.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.EMPLOYEE, UserRole.MANAGER)
  async createCompany(@Req() req: any, @Body() dto: CreateCompanyDto) {
    return this.companiesService.createCompany(req.user.id, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  async getMyCompanies(@Req() req: any) {
    return this.companiesService.getMyCompanies(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getCompanyById(@Param('id', ParseIntPipe) id: number) {
    return this.companiesService.getCompanyById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.EMPLOYEE)
  async updateCompany(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.companiesService.updateCompany(req.user.id, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async deleteCompany(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.companiesService.deleteCompany(req.user.id, id);
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  async getCompanyMembers(
    @Req() req: any,
    @Param('id', ParseIntPipe) companyId: number,
  ) {
    return this.companiesService.getCompanyMembers(companyId, req.user.id);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async addCompanyMember(
    @Req() req: any,
    @Param('id', ParseIntPipe) companyId: number,
    @Body() dto: AddCompanyMemberDto,
  ) {
    return this.companiesService.addCompanyMember(req.user.id, companyId, dto);
  }

  @Delete(':id/members/:userId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  async removeCompanyMember(
    @Req() req: any,
    @Param('id', ParseIntPipe) companyId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.companiesService.removeCompanyMember(req.user.id, companyId, userId);
  }
}
