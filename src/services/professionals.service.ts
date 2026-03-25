import { api } from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Professional {
  id: string;
  user_id: string;
  business_name?: string;
  description?: string;
  profession?: string;
  address?: string;
  city?: string;
  pays_code: string;
  position_gps?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  cni_document_url?: string;
  is_verified: boolean;
  rating: number;
  total_reviews: number;
  is_active: boolean;
  /** Plage horaire pour les créneaux réservables (0–23), défaut 8h */
  work_start_hour?: number;
  /** Heure de fin (excluse du dernier créneau), défaut 19h */
  work_end_hour?: number;
  created_at?: string;
  user?: {
    id: string;
    telephone: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

/** Corps attendu par PUT /professionals/:id (le backend mappe `position` → `position_gps`) */
export type UpdateProfessionalPayload = Partial<
  Omit<Professional, 'position_gps' | 'user' | 'id' | 'user_id' | 'rating' | 'total_reviews' | 'is_verified' | 'is_active' | 'created_at'>
> & {
  position?: { latitude: number; longitude: number };
};

export interface SearchProfessionalsParams {
  latitude: number;
  longitude: number;
  radius?: number; // en mètres, défaut 10000
  pays_code?: string;
  profession?: string;
}

class ProfessionalsService {
  // Rechercher des professionnels par géolocalisation
  async search(params: SearchProfessionalsParams): Promise<Professional[]> {
    return api.get<Professional[]>(API_ENDPOINTS.PROFESSIONALS.SEARCH, {
      params: {
        latitude: params.latitude.toString(),
        longitude: params.longitude.toString(),
        radius: params.radius?.toString() || '10000',
        pays_code: params.pays_code,
        profession: params.profession,
      },
    });
  }

  // Professionnels populaires (optionnel: limit, défaut 10, max 50)
  async getPopular(limit: number = 10): Promise<Professional[]> {
    return api.get<Professional[]>('/professionals/popular', {
      params: limit > 10 ? { limit } : undefined,
    });
  }

  // Obtenir un professionnel par ID
  async getById(id: string): Promise<Professional> {
    return api.get<Professional>(API_ENDPOINTS.PROFESSIONALS.GET_BY_ID(id));
  }

  // Obtenir mon profil professionnel (null si pas encore de fiche)
  async getMyProfile(): Promise<Professional | null> {
    return api.get<Professional | null>(API_ENDPOINTS.PROFESSIONALS.MY_PROFILE);
  }

  // Créer un profil professionnel
  async create(data: Partial<Professional>): Promise<Professional> {
    return api.post<Professional>(API_ENDPOINTS.PROFESSIONALS.CREATE, data);
  }

  // Mettre à jour un profil professionnel
  async update(id: string, data: UpdateProfessionalPayload): Promise<Professional> {
    return api.put<Professional>(API_ENDPOINTS.PROFESSIONALS.UPDATE(id), data);
  }

  // Uploader un document CNI
  async uploadCNI(id: string, file: File): Promise<{ url: string; objectName: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post<{ url: string; objectName: string }>(
      API_ENDPOINTS.PROFESSIONALS.UPLOAD_CNI(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  }
}

export const professionalsService = new ProfessionalsService();
export default professionalsService;

