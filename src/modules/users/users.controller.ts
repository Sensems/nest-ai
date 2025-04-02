import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('users')
@ApiTags('users 用户')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  @ApiOperation({ summary: '创建用户' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      id: user._id,
      username: user.username,
      email: user.email,
    };
  }

  @Get('profile')
  @ApiOperation({ summary: '获取用户信息' })
  getProfile(@Request() req) {
    return {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    };
  }
}
