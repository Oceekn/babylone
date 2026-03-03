import { api } from './api';
import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Service {
  id: string;
  professional_id: string;
  title: string;
  category?: string;
  description?: string;
  price: number;
  currency: string;
  estimated_duration?: number;
  image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Service avec infos professionnel (pour la liste côté client). */
export interface ServiceWithProfessional extends Service {
  category?: string;
  professional?: {
    id: string;
    profession?: string;
    business_name?: string;
    user?: { first_name?: string; last_name?: string };
  };
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

  /** Liste des services disponibles (pour l'écran Services client). query = mot-clé optionnel. */
  async getAvailableList(query?: string): Promise<ServiceWithProfessional[]> {
    const url = query?.trim()
      ? `${API_ENDPOINTS.SERVICES.LIST_AVAILABLE}?q=${encodeURIComponent(query.trim())}`
      : API_ENDPOINTS.SERVICES.LIST_AVAILABLE;
    return api.get<ServiceWithProfessional[]>(url);
  }

  /** Top 7 catégories les plus utilisées. */
  async getTopCategories(): Promise<{ name: string; count: number }[]> {
    return api.get<{ name: string; count: number }[]>(API_ENDPOINTS.SERVICES.CATEGORIES);
  }

  /** Enregistrer l'usage d'une catégorie (recherche ou sélection) pour faire évoluer le top 7. */
  async useCategory(name: string): Promise<void> {
    if (!name?.trim()) return;
    await api.post(API_ENDPOINTS.SERVICES.CATEGORIES_USE, { name: name.trim() });
  }

  // Obtenir mes services (pour les professionnels)
  async getMyServices(): Promise<Service[]> {
    return api.get<Service[]>(API_ENDPOINTS.SERVICES.MY_SERVICES);
  }

  // Creer un service
  async create(data: { title: string; category?: string; description?: string; price: number; currency?: string; estimated_duration?: number }): Promise<Service> {
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

