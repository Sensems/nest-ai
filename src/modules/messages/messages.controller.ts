import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('messages 消息')
@UseGuards(JwtAuthGuard)
@Controller('conversations/:conversationId/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @ApiOperation({ summary: '创建消息' })
  async create(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const message = await this.messagesService.create(
      conversationId,
      req.user._id,
      createMessageDto,
    );
    return message;
  }

  @Get()
  @ApiOperation({ summary: '获取对话的所有消息' })
  async findAll(
    @Request() req,
    @Param('conversationId') conversationId: string,
  ) {
    const messages = await this.messagesService.findAllByConversationId(
      conversationId,
      req.user._id,
    );
    return messages;
  }
}
