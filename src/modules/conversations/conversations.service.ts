import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Conversation,
  ConversationDocument,
} from './schemas/conversation.schema';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { PaginatedData } from '../../common/interfaces/response.interface';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectModel(Conversation.name)
    private conversationModel: Model<ConversationDocument>,
  ) {}

  async create(
    userId: string,
    createConversationDto: CreateConversationDto,
  ): Promise<Conversation> {
    const newConversation = new this.conversationModel({
      userId: new Types.ObjectId(userId),
      ...createConversationDto,
    });
    return newConversation.save();
  }

  async findAll(userId: string): Promise<Conversation[]> {
    return this.conversationModel.find({
      userId: new Types.ObjectId(userId),
    });
  }

  async findByPage(
    userId: string,
    query,
  ): Promise<PaginatedData<Conversation>> {
    // 获取分页参数，默认每页10条，第1页
    const page = parseInt(query?.page as string) || 1;
    const limit = parseInt(query?.pageSize as string) || 10;
    const skip = (page - 1) * limit;

    // 查询总数
    const total = await this.conversationModel.countDocuments({
      userId: new Types.ObjectId(userId),
    });

    // 查询数据
    const conversations = await this.conversationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      list: conversations,
      pagination: {
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, userId: string): Promise<Conversation> {
    const conversation = await this.conversationModel.findOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (!conversation) {
      throw new NotFoundException('对话不存在');
    }

    return conversation;
  }

  async update(
    userId: string,
    id: string,
    updateConversationDto: UpdateConversationDto,
  ): Promise<Conversation> {
    const conversation = await this.conversationModel.findOneAndUpdate(
      { _id: id, userId: new Types.ObjectId(userId) },
      updateConversationDto,
      { new: true },
    );

    if (!conversation) {
      throw new NotFoundException('对话不存在');
    }

    return conversation;
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.conversationModel.deleteOne({
      _id: id,
      userId: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('对话不存在');
    }
  }
}
