import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement company methods
  // - createCompany
  // - getCompany
  // - updateCompany
  // - deleteCompany
  // - addCompanyMember
  // - removeCompanyMember
  // - getCompanyMembers
}
