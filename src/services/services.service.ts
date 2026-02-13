import { api } from './api';
import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Service {
  id: string;
  professional_id: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  estimated_duration?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class ServicesService {
  // Obtenir les services d'un professionnel
  async getByProfessional(professionalId: string): Promise<Service[]> {
    return api.get<Service[]>(API_ENDPOINTS.SERVICES.GET_BY_PROFESSIONAL(professionalId));
  }

  // Obtenir un service par ID
  async getById(id: string): Promise<Service> {
    return api.get<Service>(API_ENDPOINTS.SERVICES.GET_BY_ID(id));
  }

  // Obtenir mes services (pour les professionnels)
  async getMyServices(): Promise<Service[]> {
    return api.get<Service[]>(API_ENDPOINTS.SERVICES.MY_SERVICES);
  }

  // Creer un service
  async create(data: { title: string; description?: string; price: number; currency?: string; estimated_duration?: number }): Promise<Service> {
    return api.post<Service>(API_ENDPOINTS.SERVICES.CREATE, data);
  }

  // Mettre a jour un service
  async update(id: string, data: Partial<Service>): Promise<Service> {
    return api.put<Service>(API_ENDPOINTS.SERVICES.UPDATE(id), data);
  }

  // Supprimer un service
  async delete(id: string): Promise<void> {
    return api.delete(API_ENDPOINTS.SERVICES.DELETE(id));
  }

  /** Envoyer une photo du service (photo de travail) — stockage MinIO. */
  async uploadImage(serviceId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await apiClient.post<{ url: string }>(
      API_ENDPOINTS.SERVICES.UPLOAD_IMAGE(serviceId),
      formData
    );
    return data.url;
  }
}

export const servicesService = new ServicesService();
export default servicesService;

