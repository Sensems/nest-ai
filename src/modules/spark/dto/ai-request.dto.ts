import { IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class AiRequestDto {
  @IsArray()
  @IsNotEmpty()
  @ApiProperty({
    type: Array,
    description: '消息列表上下文',
    example: [
      {
        role: 'user',
        content: 'Hello',
      },
    ],
  })
  messages: Array<{
    role: string;
    content: string;
  }>;
}
