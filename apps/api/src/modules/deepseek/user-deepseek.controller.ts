import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { AuthenticatedUser } from '../../infrastructure/auth/authenticated-user.interface';
import { DeepSeekService } from './services/deepseek.service';
import { DeepSeekKeyStatusDto, SetApiKeyDto } from './dto/set-api-key.dto';

@ApiTags('user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('user/deepseek-key')
export class UserDeepSeekController {
  constructor(private deepseekService: DeepSeekService) {}

  @Post()
  @ApiOperation({ summary: 'Set and validate DeepSeek key for user' })
  async setDeepSeekKey(@CurrentUser() user: AuthenticatedUser, @Body() dto: SetApiKeyDto): Promise<{ success: boolean }> {
    await this.deepseekService.setApiKey(user.userId, dto.apiKey, dto.autoEnable ?? true);
    return { success: true };
  }

  @Get('status')
  @ApiOperation({ summary: 'Get DeepSeek key status for user' })
  @ApiResponse({ status: 200, type: DeepSeekKeyStatusDto })
  getDeepSeekKeyStatus(@CurrentUser() user: AuthenticatedUser): Promise<DeepSeekKeyStatusDto> {
    return this.deepseekService.getKeyStatus(user.userId);
  }
}
