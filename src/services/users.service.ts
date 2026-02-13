import { api } from './api';
import { API_ENDPOINTS } from '../config/api';

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
}

export interface UpdateUserPayload {
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
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
}

export const usersService = new UsersService();
export default usersService;
