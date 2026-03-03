import { api } from './api';
import { API_ENDPOINTS } from '../config/api';

export interface LoginCredentials {
  telephone: string;
  password: string;
}

export interface RegisterData {
  telephone: string;
  password: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  pays_code?: string;
  role?: 'client' | 'professional';
  verification_code?: string;
}

export interface AuthResponse {
  access_token: string;
  user?: {
    id: string;
    telephone: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    role: string;
    pays_code: string;
  };
}

class AuthService {
  // Connexion (réelle, backend JWT)
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
    }
    if (response.user) {
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  }

  // Inscription
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data);
      
      // Stocker le token
      if (response.access_token) {
        localStorage.setItem('auth_token', response.access_token);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
      }
      
      return response;
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  }

  // Déconnexion
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Obtenir le token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Envoyer le code de vérification (inscription) par SMS ou email
  async sendSignupCode(
    method: 'SMS' | 'Email',
    telephone: string,
    email?: string,
  ): Promise<{ message: string }> {
    return api.post<{ message: string }>(API_ENDPOINTS.AUTH.SEND_SIGNUP_CODE, {
      method,
      telephone,
      email,
    });
  }

  // Demander la reinitialisation du mot de passe
  async requestPasswordReset(identifier: string): Promise<{ message: string; reset_token: string }> {
    return api.post<{ message: string; reset_token: string }>(
      API_ENDPOINTS.AUTH.REQUEST_RESET,
      { identifier }
    );
  }

  // Reinitialiser le mot de passe avec le code de verification
  async resetPassword(resetToken: string, code: string, newPassword: string): Promise<AuthResponse & { message: string }> {
    const response = await api.post<AuthResponse & { message: string }>(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { reset_token: resetToken, code, new_password: newPassword }
    );

    // Connecter automatiquement
    if (response.access_token) {
      localStorage.setItem('auth_token', response.access_token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
    }

    return response;
  }

  // Obtenir les informations utilisateur depuis le token (décodage basique)
  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      // Décoder le payload JWT (base64)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;

