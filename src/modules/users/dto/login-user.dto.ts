import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({
    required: true,
    description: '邮箱',
    example: '邮箱',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    required: true,
    description: '密码',
    example: '密码',
  })
  password: string;
}
