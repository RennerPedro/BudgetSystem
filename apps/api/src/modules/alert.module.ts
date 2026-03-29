import { Module } from '@nestjs/common';
import { AlertController } from '../interface/controllers/alert.controller';
import { AlertService } from '../application/services/alert.service';
import { PrismaService } from '../infrastructure/database/prisma.service';

@Module({
  controllers: [AlertController],
  providers: [AlertService, PrismaService],
  exports: [AlertService],
})
export class AlertModule {}
