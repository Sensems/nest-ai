import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConversationDto {
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: '对话标题',
    example: '标题',
  })
  title: string;
}
