import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { ConversationsService } from '../conversations/conversations.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private conversationsService: ConversationsService,
  ) {}

  async create(
    conversationId: string,
    userId: string,
    createMessageDto: CreateMessageDto,
  ): Promise<Message> {
    console.log('createMessageDto', createMessageDto);
    // 验证对话存在且属于当前用户
    await this.conversationsService.findOne(conversationId, userId);

    const newMessage = new this.messageModel({
      conversationId: new Types.ObjectId(conversationId),
      ...createMessageDto,
    });

    return newMessage.save();
  }

  async findAllByConversationId(
    conversationId: string,
    userId: string,
  ): Promise<Message[]> {
    // 验证对话存在且属于当前用户
    await this.conversationsService.findOne(conversationId, userId);

    return this.messageModel
      .find({ conversationId: new Types.ObjectId(conversationId) })
      .sort({ createdAt: 1 })
      .exec();
  }

  async getConversationHistory(
    conversationId: string,
    userId: string,
  ): Promise<Array<{ role: string; content: string }>> {
    const messages = await this.findAllByConversationId(conversationId, userId);
    return messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
  }
}
