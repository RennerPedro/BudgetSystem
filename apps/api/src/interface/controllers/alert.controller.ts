import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AlertService } from '../../application/services/alert.service';
import { AlertResponseDto } from '../../application/dtos';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { AuthenticatedUser } from '../../infrastructure/auth/authenticated-user.interface';

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertController {
  constructor(private alertService: AlertService) {}

  @Get()
  @ApiOperation({ summary: 'Get user alerts' })
  @ApiQuery({ name: 'unreadOnly', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of alerts', type: [AlertResponseDto] })
  async getAlerts(
    @CurrentUser() user: AuthenticatedUser,
    @Query('unreadOnly') unreadOnly?: boolean,
  ): Promise<AlertResponseDto[]> {
    return this.alertService.getUserAlerts(user.userId, unreadOnly === true);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread alerts count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@CurrentUser() user: AuthenticatedUser): Promise<{ count: number }> {
    const count = await this.alertService.getUnreadCount(user.userId);
    return { count };
  }

  @Post('mark-read')
  @ApiOperation({ summary: 'Mark alerts as read' })
  @ApiResponse({ status: 200, description: 'Alerts marked as read' })
  async markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { alertIds: string[] },
  ): Promise<{ message: string }> {
    await this.alertService.markAsRead(user.userId, body.alertIds);
    return { message: 'Alerts marked as read' };
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: 'Mark all alerts as read' })
  @ApiResponse({ status: 200, description: 'All alerts marked as read' })
  async markAllAsRead(@CurrentUser() user: AuthenticatedUser): Promise<{ message: string }> {
    await this.alertService.markAllAsRead(user.userId);
    return { message: 'All alerts marked as read' };
  }
}
