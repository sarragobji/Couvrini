import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  // TODO: Implement notification methods
  // - createNotification
  // - getNotifications
  // - getNotificationById
  // - markAsRead
  // - markAllAsRead
  // - deleteNotification
  // - getUserNotifications
}
