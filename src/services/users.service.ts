import { api } from './api';
import { API_ENDPOINTS } from '../config/api';

export type PrivacyDmFrom = 'contacts_or_follow' | 'followers' | 'mutual' | 'none' | 'everyone';
export type PrivacyStatusVisibility = 'everyone' | 'followers' | 'nobody';
export type PrivacyGroupInvite = 'dm_only' | 'none';

export interface User {
  id: string;
  telephone: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role: string;
  pays_code: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  /** Qui peut ouvrir une nouvelle conversation */
  privacy_dm_from?: PrivacyDmFrom;
  /** Qui peut voir statut / activité (futur) */
  privacy_status_visibility?: PrivacyStatusVisibility;
  /** Ajout aux groupes */
  privacy_group_invite?: PrivacyGroupInvite;
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  privacy_dm_from?: PrivacyDmFrom;
  privacy_status_visibility?: PrivacyStatusVisibility;
  privacy_group_invite?: PrivacyGroupInvite;
}

class UsersService {
  async getMe(): Promise<User> {
    return api.get<User>(API_ENDPOINTS.USERS.ME);
  }

  async updateMe(payload: UpdateUserPayload): Promise<User> {
    return api.patch<User>(API_ENDPOINTS.USERS.UPDATE_ME, payload);
  }

  async searchUsers(query: string): Promise<User[]> {
    return api.get<User[]>(`${API_ENDPOINTS.USERS.SEARCH}?q=${encodeURIComponent(query)}`);
  }

  /** Import des numéros du répertoire (normalisés côté serveur) pour autoriser les DM sans follow */
  async syncContacts(phones: string[]): Promise<{ saved: number }> {
    return api.post<{ saved: number }>(API_ENDPOINTS.USERS.SYNC_CONTACTS, { phones });
  }
}

export const usersService = new UsersService();
export default usersService;
