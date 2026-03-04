import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { Conversation, ConversationType } from './entities/conversation.entity';
import { ConversationParticipant } from './entities/conversation-participant.entity';
import { Message, MessageType } from './entities/message.entity';

export interface ConversationWithDetails extends Conversation {
  last_message?: string | null;
  last_message_sender_name?: string | null;
  unread_count: number;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private participantsRepository: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    private dataSource: DataSource,
  ) {}

  // Créer une conversation individuelle
  async createIndividualConversation(userId1: string, userId2: string): Promise<Conversation> {
    if (!userId1 || !userId2) {
      throw new NotFoundException('userId requis');
    }
    if (userId1 === userId2) {
      throw new ForbiddenException('Impossible de créer une conversation avec vous-même');
    }

    // Vérifier si une conversation existe déjà (join sur l'entité pour respecter le schema)
    const existing = await this.conversationsRepository
      .createQueryBuilder('conversation')
      .innerJoin(ConversationParticipant, 'p1', 'p1.conversation_id = conversation.id')
      .innerJoin(ConversationParticipant, 'p2', 'p2.conversation_id = conversation.id')
      .where('p1.user_id = :userId1', { userId1 })
      .andWhere('p2.user_id = :userId2', { userId2 })
      .andWhere('conversation.type = :type', { type: ConversationType.INDIVIDUAL })
      .getOne();

    if (existing) {
      return existing;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Créer la conversation
      const conversation = this.conversationsRepository.create({
        type: ConversationType.INDIVIDUAL,
      });
      const savedConversation = await queryRunner.manager.save(Conversation, conversation);
      const conversationId = savedConversation?.id;
      if (!conversationId) {
        throw new Error('Conversation non créée');
      }

      // Ajouter les participants (insert explicite pour éviter null sur user_id)
      await queryRunner.manager.insert(ConversationParticipant, [
        { conversation_id: conversationId, user_id: userId1 },
        { conversation_id: conversationId, user_id: userId2 },
      ]);
      await queryRunner.commitTransaction();

      return savedConversation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Créer une conversation de groupe (sélection multiple type Telegram)
  async createGroupConversation(
    userId: string,
    name: string,
    participantIds: string[],
  ): Promise<Conversation> {
    const ids = Array.isArray(participantIds) ? participantIds.filter((id) => id && id !== userId) : [];
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const conversation = this.conversationsRepository.create({
        type: ConversationType.GROUP,
        name,
        created_by: userId,
      });
      const savedConversation = await queryRunner.manager.save(Conversation, conversation);
      const conversationId = savedConversation?.id;
      if (!conversationId) throw new Error('Conversation non créée');

      // Créateur + participants (insert explicite comme pour individuel)
      const rows: Array<{ conversation_id: string; user_id: string }> = [
        { conversation_id: conversationId, user_id: userId },
        ...ids.map((id) => ({ conversation_id: conversationId, user_id: id })),
      ];
      await queryRunner.manager.insert(ConversationParticipant, rows);
      await queryRunner.commitTransaction();

      return savedConversation;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Obtenir les conversations d'un utilisateur
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationsRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation_participants', 'participant', 'participant.conversation_id = conversation.id')
      .where('participant.user_id = :userId', { userId })
      .andWhere('participant.is_active = :isActive', { isActive: true })
      .orderBy('conversation.last_message_at', 'DESC')
      .addOrderBy('conversation.updated_at', 'DESC')
      .getMany();
  }

  // Conversations avec dernier message, nom de l'envoyeur et unread_count (pour liste + indicateur non lu)
  async getConversationsWithDetails(userId: string): Promise<ConversationWithDetails[]> {
    const convs = await this.getUserConversations(userId);
    const enriched: ConversationWithDetails[] = await Promise.all(
      convs.map(async (c) => {
        const [lastMsg, myParticipant] = await Promise.all([
          this.messagesRepository.findOne({
            where: { conversation_id: c.id },
            order: { created_at: 'DESC' },
            relations: ['user'],
          }),
          this.participantsRepository.findOne({
            where: { conversation_id: c.id, user_id: userId },
          }),
        ]);
        let displayName = c.name ?? null;
        if (c.type === ConversationType.INDIVIDUAL && !displayName) {
          const other = await this.participantsRepository.findOne({
            where: { conversation_id: c.id, user_id: Not(userId) },
            relations: ['user'],
          });
          const u = other?.user;
          displayName = u
            ? `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.telephone || 'Inconnu'
            : 'Inconnu';
        }
        const senderName =
          lastMsg?.user != null
            ? `${lastMsg.user.first_name || ''} ${lastMsg.user.last_name || ''}`.trim() || lastMsg.user.telephone
            : null;
        return {
          ...c,
          name: displayName ?? c.name ?? undefined,
          last_message: lastMsg?.content ?? null,
          last_message_sender_name: senderName ?? null,
          unread_count: myParticipant?.unread_count ?? 0,
        } as ConversationWithDetails;
      }),
    );
    return enriched;
  }

  // Créer un message
  async createMessage(data: {
    conversationId: string;
    userId: string;
    content: string;
    type?: MessageType;
    mediaUrl?: string;
    replyToId?: string;
  }): Promise<Message> {
    // Vérifier que l'utilisateur est participant
    const isParticipant = await this.isParticipant(data.conversationId, data.userId);
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant of this conversation');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const message = this.messagesRepository.create({
        conversation_id: data.conversationId,
        user_id: data.userId,
        content: data.content,
        type: data.type || MessageType.TEXT,
        media_url: data.mediaUrl,
        reply_to_id: data.replyToId,
      });

      const savedMessage = await queryRunner.manager.save(Message, message);

      // Mettre à jour last_message_at de la conversation
      await queryRunner.manager.update(
        Conversation,
        { id: data.conversationId },
        { last_message_at: new Date() },
      );

      // Incrémenter les compteurs de non lus pour les autres participants
      await queryRunner.manager
        .createQueryBuilder()
        .update(ConversationParticipant)
        .set({ unread_count: () => 'unread_count + 1' })
        .where('conversation_id = :conversationId', { conversationId: data.conversationId })
        .andWhere('user_id != :userId', { userId: data.userId })
        .execute();

      await queryRunner.commitTransaction();

      // Charger les relations
      return this.messagesRepository.findOne({
        where: { id: savedMessage.id },
        relations: ['user', 'conversation'],
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Obtenir les messages d'une conversation avec pagination par curseur
  async getMessages(
    conversationId: string,
    userId: string,
    cursor?: string,
    limit: number = 50,
  ): Promise<{ messages: Message[]; nextCursor: string | null }> {
    // Vérifier que l'utilisateur est participant
    const isParticipant = await this.isParticipant(conversationId, userId);
    if (!isParticipant) {
      throw new ForbiddenException('Not a participant of this conversation');
    }

    const queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.user', 'user')
      .where('message.conversation_id = :conversationId', { conversationId })
      .orderBy('message.created_at', 'DESC')
      .take(limit + 1); // Prendre un de plus pour vérifier s'il y a une page suivante

    if (cursor) {
      // Pagination par curseur (plus rapide que OFFSET)
      const cursorMessage = await this.messagesRepository.findOne({ where: { id: cursor } });
      if (cursorMessage) {
        queryBuilder.andWhere('message.created_at < :cursorDate', {
          cursorDate: cursorMessage.created_at,
        });
      }
    }

    const messages = await queryBuilder.getMany();
    const hasMore = messages.length > limit;
    const messagesToReturn = hasMore ? messages.slice(0, limit) : messages;
    const nextCursor = hasMore && messagesToReturn.length > 0 ? messagesToReturn[messagesToReturn.length - 1].id : null;

    return {
      messages: messagesToReturn.reverse(), // Inverser pour avoir les plus anciens en premier
      nextCursor,
    };
  }

  // Vérifier si un utilisateur est participant
  async isParticipant(conversationId: string, userId: string): Promise<boolean> {
    const participant = await this.participantsRepository.findOne({
      where: { conversation_id: conversationId, user_id: userId, is_active: true },
    });
    return !!participant;
  }

  // Mettre à jour les compteurs de non lus
  async updateUnreadCounts(conversationId: string, userId: string): Promise<void> {
    await this.participantsRepository.update(
      { conversation_id: conversationId, user_id: userId },
      { unread_count: 0, last_read_at: new Date() },
    );
  }

  // Marquer les messages comme lus
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Marquer comme lus les messages reçus (envoyés par les autres) dans cette conversation
      await queryRunner.manager
        .createQueryBuilder()
        .update(Message)
        .set({ is_read: true, read_at: new Date() })
        .where('conversation_id = :conversationId', { conversationId })
        .andWhere('user_id != :userId', { userId })
        .andWhere('is_read = :isRead', { isRead: false })
        .execute();

      // Réinitialiser le compteur de non lus
      await queryRunner.manager.update(
        ConversationParticipant,
        { conversation_id: conversationId, user_id: userId },
        { unread_count: 0, last_read_at: new Date() },
      );

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
