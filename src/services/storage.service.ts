import apiClient from './api';
import { API_ENDPOINTS } from '../config/api';

export interface UploadResult {
  url: string;
  objectName: string;
  size: number;
  mimetype: string;
}

/** Envoie un fichier (JWT requis) ; stockage MinIO. Retourne l'URL. */
export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ url: string }>(
    API_ENDPOINTS.STORAGE.UPLOAD,
    formData
  );
  return data.url;
}

/** Upload public (pas de JWT) -- pour l'inscription. */
export async function uploadFilePublic(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<{ url: string }>(
    API_ENDPOINTS.STORAGE.UPLOAD_PUBLIC,
    formData
  );
  return data.url;
}

export const storageService = { uploadFile, uploadFilePublic };
export default storageService;
