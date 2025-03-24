import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @MinLength(3)
  @ApiProperty({
    required: true,
    description: '用户名',
    example: '用户名',
  })
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: '邮箱',
    example: '邮箱',
  })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({
    required: true,
    description: '密码',
    example: '密码',
  })
  password: string;
}
