import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AddCompanyMemberDto } from './dto/add-company-member.dto';
import { UserRole } from '../../generated/prisma/enums';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureCompanyMembership(companyId: number, userId: number) {
    const membership = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    if (!membership) {
      throw new ForbiddenException('You do not belong to this company');
    }

    return membership;
  }

  private async ensureCompanyManager(companyId: number, userId: number) {
    const membership = await this.ensureCompanyMembership(companyId, userId);

    if (membership.role !== UserRole.MANAGER && membership.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only managers can manage this company');
    }

    return membership;
  }

  async createCompany(userId: number, dto: CreateCompanyDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role !== UserRole.EMPLOYEE && user.role !== UserRole.MANAGER) {
      throw new ForbiddenException('Only employees or managers can create a company');
    }

    const company = await this.prisma.company.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim(),
        address: dto.address?.trim(),
        city: dto.city?.trim(),
        postalCode: dto.postalCode?.trim(),
        country: dto.country?.trim(),
        phone: dto.phone?.trim(),
        email: dto.email?.trim(),
        websiteUrl: dto.websiteUrl?.trim(),
      },
    });

    await this.prisma.companyMember.create({
      data: {
        userId,
        companyId: company.id,
        role: UserRole.MANAGER,
      },
    });

    return company;
  }

  async getCompanyById(id: number) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        members: {
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
          },
        },
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async getMyCompanies(userId: number) {
    return this.prisma.companyMember.findMany({
      where: { userId },
      include: {
        company: true,
      },
      orderBy: { company: { name: 'asc' } },
    });
  }

  async updateCompany(userId: number, companyId: number, dto: UpdateCompanyDto) {
    await this.ensureCompanyManager(companyId, userId);

    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (dto.name) {
      const existing = await this.prisma.company.findFirst({
        where: { name: dto.name.trim(), id: { not: companyId } },
      });

      if (existing) {
        throw new ConflictException('Company name already exists');
      }
    }

    return this.prisma.company.update({
      where: { id: companyId },
      data: {
        name: dto.name?.trim(),
        description: dto.description !== undefined ? dto.description.trim() : undefined,
        address: dto.address !== undefined ? dto.address.trim() : undefined,
        city: dto.city !== undefined ? dto.city.trim() : undefined,
        postalCode: dto.postalCode !== undefined ? dto.postalCode.trim() : undefined,
        country: dto.country !== undefined ? dto.country.trim() : undefined,
        phone: dto.phone !== undefined ? dto.phone.trim() : undefined,
        email: dto.email !== undefined ? dto.email.trim() : undefined,
        websiteUrl: dto.websiteUrl !== undefined ? dto.websiteUrl.trim() : undefined,
      },
    });
  }

  async deleteCompany(userId: number, companyId: number) {
    await this.ensureCompanyManager(companyId, userId);

    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const memberCount = await this.prisma.companyMember.count({
      where: { companyId },
    });
    if (memberCount > 1) {
      throw new BadRequestException(
        'Company cannot be deleted while members still exist. Remove members first.',
      );
    }

    await this.prisma.company.delete({ where: { id: companyId } });
    return { deleted: true };
  }

  async getCompanyMembers(companyId: number, userId: number) {
    await this.ensureCompanyMembership(companyId, userId);

    return this.prisma.companyMember.findMany({
      where: { companyId },
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
      },
      orderBy: { joinedAt: 'asc' },
    });
  }

  async addCompanyMember(userId: number, companyId: number, dto: AddCompanyMemberDto) {
    await this.ensureCompanyManager(companyId, userId);

    const targetUser = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!targetUser) {
      throw new NotFoundException('Target user not found');
    }

    const existing = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId: dto.userId, companyId } },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this company');
    }

    return this.prisma.companyMember.create({
      data: {
        userId: dto.userId,
        companyId,
        role: dto.role,
      },
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
      },
    });
  }

  async removeCompanyMember(userId: number, companyId: number, targetUserId: number) {
    await this.ensureCompanyManager(companyId, userId);

    if (targetUserId === userId) {
      throw new BadRequestException('You cannot remove yourself from the company');
    }

    const membership = await this.prisma.companyMember.findUnique({
      where: { userId_companyId: { userId: targetUserId, companyId } },
    });

    if (!membership) {
      throw new NotFoundException('Company membership not found');
    }

    await this.prisma.companyMember.delete({
      where: { userId_companyId: { userId: targetUserId, companyId } },
    });

    return { removed: true };
  }
}
