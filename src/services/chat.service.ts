import { api } from './api';
import { API_ENDPOINTS } from '../config/api';
import { chatSocketService } from './chat-socket.service';

export interface Conversation {
  id: string;
  type: 'individual' | 'group';
  name?: string;
  avatar_url?: string;
  created_by?: string;
  last_message?: string;
  last_message_at?: string;
  /** Nom de l'envoyeur du dernier message (pour affichage non lu) */
  last_message_sender_name?: string;
  unread_count?: number;
  created_at: string;
  participants?: ConversationParticipant[];
  /** Conversation 1-à-1 : id de l'autre personne (création de groupe) */
  other_user_id?: string | null;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  unread_count: number;
  last_read_at?: string;
  is_active: boolean;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  type: 'text' | 'image' | 'video' | 'file' | 'audio';
  content?: string;
  media_url?: string;
  is_read: boolean;
  read_at?: string;
  reply_to_id?: string;
  /** Indique que le message a été envoyé depuis une réponse à une story */
  metadata?: { from_story?: boolean; story_id?: string; [key: string]: unknown };
  created_at: string;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export interface MessagesParams {
  cursor?: string;
  limit?: number;
}

class ChatService {
  // Obtenir toutes les conversations de l'utilisateur
  async getConversations(): Promise<Conversation[]> {
    return api.get<Conversation[]>(API_ENDPOINTS.CHAT.CONVERSATIONS);
  }

  // Créer une conversation individuelle
  async createIndividualConversation(userId: string): Promise<Conversation> {
    return api.post<Conversation>(API_ENDPOINTS.CHAT.CREATE_INDIVIDUAL, {
      user_id: userId,
    });
  }

  // Créer une conversation de groupe (backend attend participantIds)
  async createGroupConversation(data: { name: string; participant_ids: string[]; avatar_url?: string }): Promise<Conversation> {
    return api.post<Conversation>(API_ENDPOINTS.CHAT.CREATE_GROUP, {
      name: data.name,
      participantIds: data.participant_ids,
    });
  }

  // Envoyer un message via REST (ex. réponse à une story sans ouvrir le chat)
  async sendMessageRest(
    conversationId: string,
    content: string,
    options?: { from_story?: boolean; story_id?: string },
  ): Promise<Message> {
    return api.post<Message>(API_ENDPOINTS.CHAT.SEND_MESSAGE(conversationId), {
      content,
      ...(options?.from_story && { from_story: true }),
      ...(options?.story_id && { story_id: options.story_id }),
    });
  }

  // Obtenir les messages d'une conversation
  async getMessages(conversationId: string, params: MessagesParams = {}): Promise<{ messages: Message[]; nextCursor?: string }> {
    const queryParams: any = {}
    if (params.cursor) queryParams.cursor = params.cursor
    if (params.limit) queryParams.limit = params.limit.toString()

    return api.get<{ messages: Message[]; nextCursor?: string }>(
      API_ENDPOINTS.CHAT.GET_MESSAGES(conversationId),
      { params: queryParams }
    );
  }

  // Envoyer un message en temps réel via WebSocket
  async sendMessage(
    conversationId: string,
    content: string,
    type: 'text' | 'image' | 'video' | 'file' | 'audio' = 'text',
    _mediaUrl?: string
  ): Promise<Message> {
    const ack = await chatSocketService.sendMessage(conversationId, content, type);
    if (ack?.error) throw new Error(ack.error);
    if (!ack?.message) throw new Error('Aucune réponse du serveur');
    return ack.message;
  }

  // Marquer les messages comme lus
  async markAsRead(conversationId: string): Promise<void> {
    return api.post<void>(API_ENDPOINTS.CHAT.MARK_AS_READ(conversationId));
  }
}

export const chatService = new ChatService();
export default chatService;

