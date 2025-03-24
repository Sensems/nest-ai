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

@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post('/create')
  create(@Request() req, @Body() createConversationDto: CreateConversationDto) {
    return this.conversationsService.create(
      req.user._id,
      createConversationDto,
    );
  }

  @Post('findAll')
  findAll(@Request() req, @Body() body) {
    return this.conversationsService.findAll(req.user._id, body);
  }

  @Get('find/:id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.conversationsService.findOne(id, req.user._id);
  }

  @Post('update/:id')
  update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateConversationDto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(
      req.user._id,
      id,
      updateConversationDto,
    );
  }

  @Post('delete/:id')
  remove(@Request() req, @Param('id') id: string) {
    return this.conversationsService.remove(id, req.user._id);
  }
}
