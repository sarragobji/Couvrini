import { IsEnum } from 'class-validator';
import { MissionStatus } from '../../../generated/prisma/enums';

export class UpdateMissionStatusDto {
  @IsEnum(MissionStatus)
  status!: MissionStatus;
}
