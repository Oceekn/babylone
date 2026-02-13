import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { MessageType } from './entities/message.entity';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('ChatGateway');

  constructor(
    private chatService: ChatService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Chat Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Authentification JWT via token dans la query
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      // Vérifier le token
      const payload = this.jwtService.verify(token as string, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // Récupérer l'utilisateur
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        client.disconnect();
        return;
      }

      // Stocker l'ID utilisateur dans le socket
      client.data.userId = user.id;
      client.data.user = user;

      // Rejoindre la room de l'utilisateur
      await client.join(`user:${user.id}`);

      this.logger.log(`Client connected: ${client.id} (User: ${user.id})`);
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_conversation')
  async handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    // Vérifier que l'utilisateur est participant
    const isParticipant = await this.chatService.isParticipant(data.conversationId, userId);
    if (!isParticipant) {
      return { error: 'Not a participant' };
    }

    // Rejoindre la room de la conversation
    await client.join(`conversation:${data.conversationId}`);
    return { success: true, conversationId: data.conversationId };
  }

  @SubscribeMessage('leave_conversation')
  async handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    await client.leave(`conversation:${data.conversationId}`);
    return { success: true, conversationId: data.conversationId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string; type?: string },
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return { error: 'Unauthorized' };
    }

    try {
      // Créer le message
      const message = await this.chatService.createMessage({
        conversationId: data.conversationId,
        userId,
        content: data.content,
        type: data.type ? (data.type as MessageType) : MessageType.TEXT,
      });

      // Émettre le message à tous les participants de la conversation
      this.server.to(`conversation:${data.conversationId}`).emit('new_message', message);

      // Mettre à jour les compteurs de non lus
      await this.chatService.updateUnreadCounts(data.conversationId, userId);

      return { success: true, message };
    } catch (error) {
      this.logger.error(`Send message error: ${error.message}`);
      return { error: error.message };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return;
    }

    client.to(`conversation:${data.conversationId}`).emit('user_typing', {
      userId,
      conversationId: data.conversationId,
      isTyping: data.isTyping,
    });
  }

  // --- WebRTC Signaling ---

  @SubscribeMessage('call_offer')
  async handleCallOffer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: string; offer: any; callType: 'audio' | 'video' },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    this.server.to(`user:${data.targetUserId}`).emit('call_offer', {
      from: userId,
      fromUser: client.data.user,
      offer: data.offer,
      callType: data.callType,
    });
    return { success: true };
  }

  @SubscribeMessage('call_answer')
  async handleCallAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: string; answer: any },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    this.server.to(`user:${data.targetUserId}`).emit('call_answer', {
      from: userId,
      answer: data.answer,
    });
    return { success: true };
  }

  @SubscribeMessage('ice_candidate')
  async handleIceCandidate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: string; candidate: any },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    this.server.to(`user:${data.targetUserId}`).emit('ice_candidate', {
      from: userId,
      candidate: data.candidate,
    });
    return { success: true };
  }

  @SubscribeMessage('call_end')
  async handleCallEnd(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { targetUserId: string },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    this.server.to(`user:${data.targetUserId}`).emit('call_ended', {
      from: userId,
    });
    return { success: true };
  }
}
