import { Controller, Get, Param, Query, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.id, updateUserDto);
  }

  // Rechercher des utilisateurs (pour demarrer une conversation)
  @Get('search')
  @UseGuards(JwtAuthGuard)
  async search(@Request() req, @Query('q') query: string) {
    if (!query || query.trim().length < 2) {
      return [];
    }
    return this.usersService.searchUsers(query.trim(), req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
}
