/// <reference types="vite/client" />
// Configuration de l'API Backend
const DEFAULT_BASE = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api/v1';
const DEFAULT_ORIGIN = import.meta.env?.VITE_SOCKET_URL || DEFAULT_BASE.replace(/\/api\/v1\/?$/, '') || 'http://localhost:3000';
const STORAGE_API_BASE = 'api_base_url';
const STORAGE_SOCKET_URL = 'socket_url';

export function getApiBaseUrl(): string {
  return localStorage.getItem(STORAGE_API_BASE) || DEFAULT_BASE;
}
export function getSocketUrl(): string {
  return localStorage.getItem(STORAGE_SOCKET_URL) || DEFAULT_ORIGIN;
}
export function setBackendUrl(serverUrl: string): void {
  const base = serverUrl.replace(/\/+$/, '') + '/api/v1';
  const origin = serverUrl.replace(/\/+$/, '');
  localStorage.setItem(STORAGE_API_BASE, base);
  localStorage.setItem(STORAGE_SOCKET_URL, origin);
}

export const API_CONFIG = {
  BASE_URL: DEFAULT_BASE,
  TIMEOUT: 30000, // 30 secondes
  /** URL du serveur pour WebSocket (même origine que l’API, sans /api/v1) */
  SOCKET_URL: DEFAULT_ORIGIN,
  getApiBaseUrl,
  getSocketUrl,
  setBackendUrl,
};

// Endpoints de l'API
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    VERIFY_TOKEN: '/auth/verify',
    SEND_SIGNUP_CODE: '/auth/send-signup-code',
    REQUEST_RESET: '/auth/request-reset',
    RESET_PASSWORD: '/auth/reset-password',
  },
  
  // Users
  USERS: {
    ME: '/users/me',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE_ME: '/users/me',
    SEARCH: '/users/search',
  },
  
  // Professionals
  PROFESSIONALS: {
    SEARCH: '/professionals/search',
    POPULAR: '/professionals/popular',
    GET_BY_ID: (id: string) => `/professionals/${id}`,
    MY_PROFILE: '/professionals/my-profile',
    CREATE: '/professionals',
    UPDATE: (id: string) => `/professionals/${id}`,
    UPLOAD_CNI: (id: string) => `/professionals/${id}/upload-cni`,
    DELETE: (id: string) => `/professionals/${id}`,
  },
  
  // Services
  SERVICES: {
    LIST_AVAILABLE: '/services/list',
    CATEGORIES: '/services/categories',
    CATEGORIES_USE: '/services/categories/use',
    GET_BY_ID: (id: string) => `/services/${id}`,
    GET_BY_PROFESSIONAL: (professionalId: string) => `/services/professional/${professionalId}`,
    MY_SERVICES: '/services/my-services',
    CREATE: '/services',
    UPDATE: (id: string) => `/services/${id}`,
    UPLOAD_IMAGE: (id: string) => `/services/${id}/upload-image`,
    DELETE: (id: string) => `/services/${id}`,
  },
  
  // Wallet
  WALLET: {
    GET_BALANCE: '/wallet/balance',
    GET_WALLET: '/wallet',
    TOPUP: '/wallet/topup',
  },
  
  // Transactions
  TRANSACTIONS: {
    MY_TRANSACTIONS: '/transactions/my-transactions',
    GET_BY_ID: (id: string) => `/transactions/${id}`,
  },
  
  // Payments
  PAYMENTS: {
    INITIALIZE: '/payments/initialize',
    GET_BY_ID: (id: string) => `/payments/${id}`,
    MY_PAYMENTS: '/payments/my-payments',
    WEBHOOK_CINETPAY: '/payments/webhook/cinetpay',
    WEBHOOK_FLUTTERWAVE: '/payments/webhook/flutterwave',
  },
  
  // Withdrawals
  WITHDRAWALS: {
    REQUEST: '/withdrawals',
  },
  
  // Chat
  CHAT: {
    CONVERSATIONS: '/chat/conversations',
    CREATE_INDIVIDUAL: '/chat/conversations/individual',
    CREATE_GROUP: '/chat/conversations/group',
    GET_MESSAGES: (conversationId: string) => `/chat/conversations/${conversationId}/messages`,
    MARK_AS_READ: (conversationId: string) => `/chat/conversations/${conversationId}/read`,
  },
  
  // Social
  SOCIAL: {
    FEED: '/social/feed',
    CREATE_POST: '/social/posts',
    GET_POST: (postId: string) => `/social/posts/${postId}`,
    ADD_COMMENT: (postId: string) => `/social/posts/${postId}/comments`,
    GET_COMMENTS: (postId: string) => `/social/posts/${postId}/comments`,
    TOGGLE_LIKE: (postId: string) => `/social/posts/${postId}/like`,
    USER_POSTS: (userId: string) => `/social/users/${userId}/posts`,
    FOLLOW_USER: (userId: string) => `/social/follow/${userId}`,
    UNFOLLOW_USER: (userId: string) => `/social/follow/${userId}`,
    USER_FOLLOW_STATUS: (userId: string) => `/social/users/${userId}/follow-status`,
    USER_FOLLOW_COUNTS: (userId: string) => `/social/users/${userId}/follow-counts`,
    USER_FOLLOWERS: (userId: string) => `/social/users/${userId}/followers`,
    USER_FOLLOWING: (userId: string) => `/social/users/${userId}/following`,
    STORIES: '/social/stories',
    STORIES_UPLOAD: '/social/stories/upload',
    STORY_BY_ID: (id: string) => `/social/stories/${id}`,
  },
  
  // Storage
  STORAGE: {
    UPLOAD: '/storage/upload',
    UPLOAD_PUBLIC: '/storage/upload-public',
  },
  
  // Bookings
  BOOKINGS: {
    CREATE: '/bookings',
    CREATE_WITH_PAYMENT: '/bookings/with-payment',
    MY_BOOKINGS: '/bookings/my-bookings',
    RECEIVED: '/bookings/received',
    STATS: '/bookings/stats',
    REVIEWS_RECEIVED: '/bookings/reviews-received',
    PROFESSIONAL_REVIEWS: (professionalId: string) => `/bookings/professional/${professionalId}/reviews`,
    AVAILABILITY: '/bookings/availability',
    GET_BY_ID: (id: string) => `/bookings/${id}`,
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`,
    RESCHEDULE: (id: string) => `/bookings/${id}/reschedule`,
    REVIEW: (id: string) => `/bookings/${id}/review`,
  },

  // Health
  HEALTH: {
    CHECK: '/health',
    DETAILED: '/health/detailed',
  },
};

