import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('conversations')
  @UseGuards(JwtAuthGuard)
  async getConversations(@Request() req) {
    return this.chatService.getUserConversations(req.user.id);
  }

  @Post('conversations/individual')
  @UseGuards(JwtAuthGuard)
  async createIndividualConversation(
    @Body() body: { userId: string },
    @Request() req,
  ) {
    return this.chatService.createIndividualConversation(req.user.id, body.userId);
  }

  @Post('conversations/group')
  @UseGuards(JwtAuthGuard)
  async createGroupConversation(
    @Body() body: { name: string; participantIds: string[] },
    @Request() req,
  ) {
    return this.chatService.createGroupConversation(req.user.id, body.name, body.participantIds);
  }

  @Get('conversations/:conversationId/messages')
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @Param('conversationId') conversationId: string,
    @Query('cursor') cursor: string,
    @Query('limit') limit: string,
    @Request() req,
  ) {
    return this.chatService.getMessages(
      conversationId,
      req.user.id,
      cursor,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Post('conversations/:conversationId/read')
  @UseGuards(JwtAuthGuard)
  async markAsRead(@Param('conversationId') conversationId: string, @Request() req) {
    await this.chatService.markAsRead(conversationId, req.user.id);
    return { success: true };
  }
}

