import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: '用户名',
    example: '用户名',
  })
  username: string;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: '密码',
    example: '密码',
  })
  password: string;
}
