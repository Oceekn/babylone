import { io, Socket } from 'socket.io-client';
import { API_CONFIG } from '../config/api';
import { authService } from './auth.service';
import type { Message } from './chat.service';

const NAMESPACE = '/chat';

let socketInstance: Socket | null = null;

function getSocket(): Socket | null {
  const token = authService.getToken();
  if (!token) return null;
  if (socketInstance?.connected) return socketInstance;

  const url = `${API_CONFIG.SOCKET_URL}${NAMESPACE}`;
  socketInstance = io(url, {
    auth: { token },
    transports: ['websocket', 'polling'],
  });

  socketInstance.on('connect_error', (err) => {
    console.error('Chat WebSocket connect_error:', err.message);
  });
  socketInstance.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') socketInstance = null;
  });

  return socketInstance;
}

function disconnect(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

/** Rejoindre une conversation (room) pour recevoir les messages en temps réel */
function joinConversation(conversationId: string): Promise<{ success?: boolean; error?: string }> {
  const s = getSocket();
  if (!s?.connected) return Promise.resolve({ error: 'Non connecté' });
  return new Promise((resolve) => {
    s.emit('join_conversation', { conversationId }, (ack: unknown) => {
      resolve((ack as { success?: boolean; error?: string }) ?? {});
    });
  });
}

/** Quitter une conversation */
function leaveConversation(conversationId: string): Promise<void> {
  const s = getSocket();
  if (!s?.connected) return Promise.resolve();
  return new Promise((resolve) => {
    s.emit('leave_conversation', { conversationId }, () => resolve());
  });
}

/** Envoyer un message (temps réel, backend émet new_message à tous les participants) */
function sendMessage(
  conversationId: string,
  content: string,
  type: 'text' | 'image' | 'video' | 'file' | 'audio' = 'text'
): Promise<{ success?: boolean; message?: Message; error?: string }> {
  const s = getSocket();
  if (!s?.connected) return Promise.resolve({ error: 'Non connecté' });
  return new Promise((resolve) => {
    s.emit('send_message', { conversationId, content, type }, (ack: unknown) => {
      resolve((ack as { success?: boolean; message?: Message; error?: string }) ?? {});
    });
  });
}

/** S'abonner aux nouveaux messages d'une conversation */
function onNewMessage(callback: (message: Message) => void): () => void {
  const s = getSocket();
  if (!s) return () => {};
  s.on('new_message', callback);
  return () => {
    s.off('new_message', callback);
  };
}

/** Indicateur de frappe */
function emitTyping(conversationId: string, isTyping: boolean): void {
  const s = getSocket();
  if (s?.connected) s.emit('typing', { conversationId, isTyping });
}

function onUserTyping(callback: (data: { userId: string; conversationId: string; isTyping: boolean }) => void): () => void {
  const s = getSocket();
  if (!s) return () => {};
  s.on('user_typing', callback);
  return () => {
    s.off('user_typing', callback);
  };
}

/** Forcer la connexion du socket (utile pour initialiser avant d'ecouter) */
function connect(): Socket | null {
  return getSocket();
}

export const chatSocketService = {
  connect,
  getSocket,
  disconnect,
  joinConversation,
  leaveConversation,
  sendMessage,
  onNewMessage,
  emitTyping,
  onUserTyping,
};

export default chatSocketService;
