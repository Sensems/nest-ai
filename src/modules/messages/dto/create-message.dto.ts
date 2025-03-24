import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @IsNotEmpty()
  @ApiProperty({ required: true, description: '对话内容' })
  content: string;

  @IsEnum(['user', 'assistant'])
  @ApiProperty({
    required: true,
    description: '角色 user：用户 assistant:大模型',
  })
  role: string;
}
