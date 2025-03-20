import {
  Controller,
  Get,
  Post,
  Body,
  Header,
  Request,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { SparkService } from './spark.service';
import { NotStreamChatDto } from './dto/notSteamcChat.dto';
import { AiRequestDto } from './dto/ai-request.dto';

@Controller('spark')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Get('/time')
  getHello() {
    return this.sparkService.getHello();
  }

  @Post('/notSteamcChat')
  notSteamcCat(@Body() body: NotStreamChatDto) {
    console.log('body', body);
    return this.sparkService.chat({
      text: body.text,
      steam: false,
    });
  }

  // 新增：流式响应端点
  @Post('/steamChat')
  @Header('Content-Type', 'text/event-stream')
  @Header('Cache-Control', 'no-cache')
  @Header('Connection', 'keep-alive')
  steamChat(
    @Request() req,
    @Res() response: Response,
    @Body() aiRequestDto: AiRequestDto,
  ) {
    // 设置 SSE 响应头
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');
    response.flushHeaders();

    // let fullContent = '';

    // 订阅流式响应
    const subscription = this.sparkService.streamChat(aiRequestDto).subscribe({
      next: (chunk) => {
        // fullContent += chunk;
        // 将数据发送到客户端
        response.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        // 在Express中不需要显式调用flush，write会自动刷新缓冲区
      },
      error: (error) => {
        console.error('流式响应错误:', error);
        response.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
        response.end();
      },
      complete: () => {
        // 发送完成事件并结束响应
        response.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        response.end();
      },
    });

    response.on('close', () => {
      // 取消订阅以停止响应
      subscription.unsubscribe();
    });
  }
}
