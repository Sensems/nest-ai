import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class NotStreamChatDto {
  @ApiProperty({ description: '文本', example: '你好' })
  @IsString()
  text: string;
}
