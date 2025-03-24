import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('create')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return {
      id: user._id,
      username: user.username,
      email: user.email,
    };
  }

  @Get('profile')
  getProfile(@Request() req) {
    return {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
    };
  }
}
