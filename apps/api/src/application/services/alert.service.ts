import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { AlertResponseDto } from '../dtos';
import { AlertSeverity, AlertType } from '../../domain/types';

@Injectable()
export class AlertService {
  constructor(private prisma: PrismaService) {}

  async getUserAlerts(userId: string, unreadOnly = false): Promise<AlertResponseDto[]> {
    const where: any = { userId };

    if (unreadOnly) {
      where.read = false;
    }

    const alerts = await this.prisma.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return alerts.map((alert) => ({
      ...alert,
      type: alert.type as AlertType,
      severity: alert.severity as AlertSeverity,
    }));
  }

  async markAsRead(userId: string, alertIds: string[]): Promise<void> {
    await this.prisma.alert.updateMany({
      where: {
        id: { in: alertIds },
        userId,
      },
      data: {
        read: true,
      },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.alert.updateMany({
      where: { userId },
      data: { read: true },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.alert.count({
      where: {
        userId,
        read: false,
      },
    });
  }
}
