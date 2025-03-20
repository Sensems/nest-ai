import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { SparkService } from './spark.service';
import { AiRequestDto } from './dto/ai-request.dto';

@Controller('spark')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Post('/notSteamChat')
  notSteamcCat(@Body() aiRequestDto: AiRequestDto) {
    return this.sparkService.chat(aiRequestDto);
  }

  // 新增：流式响应端点
  @Post('/steamChat')
  steamChat(@Res() response: Response, @Body() aiRequestDto: AiRequestDto) {
    // 设置 SSE 响应头
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    // 订阅流式响应
    const subscription = this.sparkService.streamChat(aiRequestDto).subscribe({
      next: (data) => {
        // 提取文本内容
        const content = data.content || '';
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
      },
    });

    response.on('close', () => {
      // 取消订阅以停止响应
      subscription.unsubscribe();
    });
  }
}
