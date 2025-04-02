import {
  Controller,
  Post,
  Request,
  Body,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('conversations 对话')
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('/create')
  @ApiOperation({ summary: '创建对话' })
  async create(
    @Request() req,
    @Body() createConversationDto: CreateConversationDto,
  ) {
    const conversation = await this.conversationsService.create(
      req.user._id,
      createConversationDto,
    );
    return conversation;
  }

  @Post('findAll')
  @ApiOperation({ summary: '获取所有对话' })
  async findAll(@Request() req, @Body() body) {
    const result = await this.conversationsService.findAll(req.user._id, body);
    return result;
  }

  @Get('find/:id')
  @ApiOperation({ summary: '获取单个对话' })
  async findOne(@Request() req, @Param('id') id: string) {
    const conversation = await this.conversationsService.findOne(
      id,
      req.user._id,
    );
    return conversation;
  }

  @Post('update/:id')
  @ApiOperation({ summary: '更新对话' })
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    const conversation = await this.conversationsService.update(
      req.user._id,
      id,
      updateConversationDto,
    );
    return conversation;
  }

  @Post('delete/:id')
  @ApiOperation({ summary: '删除对话' })
  async remove(@Request() req, @Param('id') id: string) {
    await this.conversationsService.remove(id, req.user._id);
    return null;
  }
}
