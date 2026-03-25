import { Controller, Get, Param, Query, Patch, Post, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { SyncContactsDto } from './dto/sync-contacts.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Request() req) {
    const user = await this.usersService.findById(req.user.id);
    return this.usersService.toSafeUser(user);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    const updated = await this.usersService.update(req.user.id, updateUserDto);
    return this.usersService.toSafeUser(updated);
  }

  /** Import répertoire (numéros normalisés) — autorise les DM « numéro connu » sans follow */
  @Post('me/contacts')
  @UseGuards(JwtAuthGuard)
  async syncContacts(@Request() req, @Body() body: SyncContactsDto) {
    return this.usersService.syncContactPhones(req.user.id, Array.isArray(body?.phones) ? body.phones : []);
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
    const user = await this.usersService.findById(id);
    return this.usersService.toSafeUser(user);
  }
}
