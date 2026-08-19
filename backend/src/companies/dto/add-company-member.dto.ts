import { IsEnum, IsInt } from 'class-validator';
import { UserRole } from '../../../generated/prisma/enums';

export class AddCompanyMemberDto {
  @IsInt()
  userId!: number;

  @IsEnum(UserRole)
  role!: UserRole;
}
