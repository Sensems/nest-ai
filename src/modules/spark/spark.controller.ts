import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  Param,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { SparkService } from './spark.service';
import { MessagesService } from '../messages/messages.service';
import { AiRequestDto } from './dto/ai-request.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('spark 对话')
@UseGuards(JwtAuthGuard)
@Controller('spark')
export class SparkController {
  constructor(
    private readonly sparkService: SparkService,
    private readonly messagesService: MessagesService,
  ) {}

  @Post('/notSteamChat')
  @ApiOperation({ summary: '非流式对话' })
  async notSteamcCat(@Body() aiRequestDto: AiRequestDto) {
    const response = await firstValueFrom(this.sparkService.chat(aiRequestDto));
    return response;
  }

  // 新增：流式响应端点
  @Post('conversations/:conversationId/spark/steamChat')
  @ApiOperation({ summary: '流式对话' })
  async steamChat(
    @Request() req,
    @Res() response: Response,
    @Param('conversationId') conversationId: string,
    @Body() aiRequestDto: AiRequestDto,
  ) {
    // 设置 SSE 响应头
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    // 首先保存用户的消息
    const userMessage = aiRequestDto.messages[aiRequestDto.messages.length - 1];
    await this.messagesService.create(conversationId, req.user._id, {
      content: userMessage.content,
      role: 'user',
    });

    let assistantMessage = '';
    // 订阅流式响应
    const subscription = this.sparkService.streamChat(aiRequestDto).subscribe({
      next: (data) => {
        // 提取文本内容
        const content = data.content || '';
        assistantMessage += content;
        if (content) {
          response.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      },
      error: (err) => {
        console.error('Error processing AI response:', err);
        response.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        response.end();
      },
      complete: () => {
        response.write('data: [DONE]\n\n');
        response.end();

        this.messagesService
          .create(conversationId, req.user._id, {
            content: assistantMessage,
            role: 'assistant',
          })
          .catch((error) => {
            console.error('Error saving assistant message:', error);
          });
      },
    });

    response.on('close', () => {
      // 取消订阅以停止响应
      subscription.unsubscribe();
    });
  }
}
