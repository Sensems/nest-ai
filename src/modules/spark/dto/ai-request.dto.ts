import { IsNotEmpty, IsArray } from 'class-validator';

export class AiRequestDto {
  @IsArray()
  @IsNotEmpty()
  messages: Array<{
    role: string;
    content: string;
  }>;
}
