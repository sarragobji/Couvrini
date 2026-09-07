import { IsEnum } from 'class-validator';
import { AccountStatus } from '../../../generated/prisma/enums';

export class UpdateUserStatusDto {
  @IsEnum(AccountStatus)
  accountStatus!: AccountStatus;
}
