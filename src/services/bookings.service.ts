import { api } from './api';
import { API_ENDPOINTS } from '../config/api';

export interface Booking {
  id: string;
  client_id: string;
  professional_id: string;
  service_id?: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'rejected';
  scheduled_at: string;
  duration_minutes?: number;
  price?: number;
  currency: string;
  notes?: string;
  address?: string;
  cancellation_reason?: string;
  rating?: number;
  review?: string;
  created_at: string;
  updated_at: string;
  // Relations
  client?: {
    id: string;
    first_name: string;
    last_name: string;
    telephone: string;
    avatar_url?: string;
  };
  professional?: {
    id: string;
    user_id?: string;
    business_name: string;
    profession: string;
    user?: {
      id?: string;
      first_name: string;
      last_name: string;
      telephone?: string;
      avatar_url?: string;
    };
  };
  service?: {
    id: string;
    title: string;
    price: number;
    image_url?: string;
  };
}

export interface CreateBookingData {
  professional_id: string;
  service_id?: string;
  scheduled_at: string;
  duration_minutes?: number;
  price?: number;
  currency?: string;
  notes?: string;
  address?: string;
}

class BookingsService {
  async create(data: CreateBookingData): Promise<Booking> {
    return api.post<Booking>(API_ENDPOINTS.BOOKINGS.CREATE, data);
  }

  async createWithPayment(data: CreateBookingData): Promise<{ booking: Booking; transaction: any }> {
    return api.post<{ booking: Booking; transaction: any }>(API_ENDPOINTS.BOOKINGS.CREATE_WITH_PAYMENT, data);
  }

  async getMyBookings(status?: string): Promise<Booking[]> {
    const params = status ? `?status=${status}` : '';
    return api.get<Booking[]>(`${API_ENDPOINTS.BOOKINGS.MY_BOOKINGS}${params}`);
  }

  async getReceivedBookings(status?: string): Promise<Booking[]> {
    const params = status ? `?status=${status}` : '';
    return api.get<Booking[]>(`${API_ENDPOINTS.BOOKINGS.RECEIVED}${params}`);
  }

  async getById(id: string): Promise<Booking> {
    return api.get<Booking>(API_ENDPOINTS.BOOKINGS.GET_BY_ID(id));
  }

  async updateStatus(id: string, status: string, cancellation_reason?: string): Promise<Booking> {
    return api.patch<Booking>(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id), {
      status,
      cancellation_reason,
    });
  }

  async addReview(id: string, rating: number, review?: string): Promise<Booking> {
    return api.post<Booking>(API_ENDPOINTS.BOOKINGS.REVIEW(id), { rating, review });
  }

  async getStats(): Promise<{
    todayBookings: Booking[];
    todayCount: number;
    monthRevenue: number;
    avgRating: number;
    totalReviews: number;
  }> {
    return api.get('/bookings/stats');
  }

  async getReviewsReceived(): Promise<Booking[]> {
    return api.get<Booking[]>('/bookings/reviews-received');
  }
}

export const bookingsService = new BookingsService();
