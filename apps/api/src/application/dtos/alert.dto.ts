import { ApiProperty } from '@nestjs/swagger';
import { AlertType, AlertSeverity } from '../../domain/types';

export class AlertResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ['BUDGET_WARNING', 'BUDGET_CRITICAL', 'BUDGET_NEGATIVE', 'DAILY_LIMIT_EXCEEDED'] })
  type: AlertType;

  @ApiProperty()
  message: string;

  @ApiProperty({ enum: ['INFO', 'WARNING', 'CRITICAL'] })
  severity: AlertSeverity;

  @ApiProperty()
  read: boolean;

  @ApiProperty()
  createdAt: Date;
}

export class MarkAlertReadDto {
  @ApiProperty()
  alertIds: string[];
}
