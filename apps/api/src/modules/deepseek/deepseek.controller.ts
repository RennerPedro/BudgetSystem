import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { CurrentUser } from '../../infrastructure/auth/current-user.decorator';
import { AuthenticatedUser } from '../../infrastructure/auth/authenticated-user.interface';
import { SetApiKeyDto, DeepSeekKeyStatusDto } from './dto/set-api-key.dto';
import { DeepSeekService } from './services/deepseek.service';
import {
  CategorizeExpenseDto,
  PredictBudgetDto,
} from './dto/budget-prediction.dto';
import { BudgetPredictionService } from './services/budget-prediction.service';
import { ChatAssistantService } from './services/chat-assistant.service';
import { ChatMessageDto, ChatMessageResponseDto } from './dto/chat-message.dto';
import { CategorizationService } from './services/categorization.service';

@ApiTags('ai')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('deepseek')
export class DeepSeekController {
  constructor(
    private deepseekService: DeepSeekService,
    private budgetPredictionService: BudgetPredictionService,
    private chatAssistantService: ChatAssistantService,
    private categorizationService: CategorizationService,
  ) {}

  @Get('key/status')
  @ApiOperation({ summary: 'Get DeepSeek key setup status' })
  @ApiResponse({ status: 200, type: DeepSeekKeyStatusDto })
  getKeyStatus(@CurrentUser() user: AuthenticatedUser): Promise<DeepSeekKeyStatusDto> {
    return this.deepseekService.getKeyStatus(user.userId);
  }

  @Post('key')
  @ApiOperation({ summary: 'Set and validate DeepSeek API key' })
  async setApiKey(@CurrentUser() user: AuthenticatedUser, @Body() dto: SetApiKeyDto): Promise<{ success: boolean }> {
    await this.deepseekService.setApiKey(user.userId, dto.apiKey, dto.autoEnable ?? true);
    return { success: true };
  }

  @Post('predict-budget')
  @ApiOperation({ summary: 'Generate AI budget prediction' })
  async predictBudget(@CurrentUser() user: AuthenticatedUser, @Body() dto: PredictBudgetDto) {
    const prediction = await this.budgetPredictionService.predictBudget(user.userId, dto);
    return {
      prediction,
      fallbackToHeuristic: !prediction,
    };
  }

  @Post('chat')
  @ApiOperation({ summary: 'Ask AI budget assistant' })
  @ApiResponse({ status: 200, type: ChatMessageResponseDto })
  async chat(@CurrentUser() user: AuthenticatedUser, @Body() dto: ChatMessageDto): Promise<ChatMessageResponseDto> {
    const response = await this.chatAssistantService.ask(user.userId, dto.message);
    return { response };
  }

  @Get('chat/history')
  @ApiOperation({ summary: 'Get AI chat history' })
  getHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.chatAssistantService.getHistory(user.userId);
  }

  @Post('categorize-expense')
  @ApiOperation({ summary: 'Suggest expense category with AI' })
  async categorizeExpense(@CurrentUser() user: AuthenticatedUser, @Body() dto: CategorizeExpenseDto) {
    return this.categorizationService.suggestCategory(user.userId, dto.description, dto.amount);
  }
}
