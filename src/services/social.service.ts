import { api } from './api';
import { API_ENDPOINTS } from '../config/api';

/** Aligné sur `metadata.scope === 'realization'` côté API (réalisations fiche pro). */
export const POST_METADATA_SCOPE_REALIZATION = 'realization' as const;

export interface Post {
  id: string;
  user_id: string;
  content?: string;
  image_url?: string;
  video_url?: string;
  pays_code: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_public: boolean;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

export interface FeedParams {
  cursor?: string;
  limit?: number;
  pays_code?: string;
}

class SocialService {
  // Obtenir le feed social
  async getFeed(params: FeedParams = {}): Promise<{ posts: Post[]; nextCursor?: string }> {
    const queryParams: any = {}
    if (params.cursor) queryParams.cursor = params.cursor
    if (params.limit) queryParams.limit = params.limit.toString()
    if (params.pays_code) queryParams.pays_code = params.pays_code

    return api.get<{ posts: Post[]; nextCursor?: string }>(API_ENDPOINTS.SOCIAL.FEED, {
      params: queryParams,
    });
  }

  // Obtenir un post par ID
  async getPost(postId: string): Promise<Post> {
    return api.get<Post>(API_ENDPOINTS.SOCIAL.GET_POST(postId));
  }

  // Créer un post
  async createPost(data: {
    content?: string;
    image_url?: string;
    video_url?: string;
    pays_code?: string;
    metadata?: Record<string, unknown>;
  }): Promise<Post> {
    return api.post<Post>(API_ENDPOINTS.SOCIAL.CREATE_POST, {
      ...data,
      pays_code: data.pays_code || 'CM',
    });
  }

  // Ajouter un commentaire
  async addComment(postId: string, content: string, parentId?: string): Promise<Comment> {
    return api.post<Comment>(API_ENDPOINTS.SOCIAL.ADD_COMMENT(postId), {
      content,
      parent_id: parentId,
    });
  }

  // Obtenir les commentaires d'un post
  async getComments(postId: string, cursor?: string, limit?: number): Promise<{ comments: Comment[]; nextCursor?: string }> {
    const params: any = {}
    if (cursor) params.cursor = cursor
    if (limit) params.limit = limit.toString()

    return api.get<{ comments: Comment[]; nextCursor?: string }>(
      API_ENDPOINTS.SOCIAL.GET_COMMENTS(postId),
      { params }
    );
  }

  // Toggle like sur un post
  async toggleLike(postId: string): Promise<{ liked: boolean; likes_count: number }> {
    return api.post<{ liked: boolean; likes_count: number }>(API_ENDPOINTS.SOCIAL.TOGGLE_LIKE(postId));
  }

  // Follow / unfollow
  async follow(userId: string): Promise<{ following: boolean }> {
    return api.post<{ following: boolean }>(API_ENDPOINTS.SOCIAL.FOLLOW_USER(userId));
  }

  async unfollow(userId: string): Promise<{ following: boolean }> {
    return api.delete<{ following: boolean }>(API_ENDPOINTS.SOCIAL.UNFOLLOW_USER(userId));
  }

  async getFollowStatus(userId: string): Promise<{ following: boolean }> {
    return api.get<{ following: boolean }>(API_ENDPOINTS.SOCIAL.USER_FOLLOW_STATUS(userId));
  }

  async getFollowCounts(userId: string): Promise<{ followers: number; following: number }> {
    return api.get<{ followers: number; following: number }>(API_ENDPOINTS.SOCIAL.USER_FOLLOW_COUNTS(userId));
  }

  async getFollowers(userId: string, limit?: number): Promise<{ follower: { id: string; first_name?: string; last_name?: string; avatar_url?: string } }[]> {
    const params = limit ? { limit } : {};
    return api.get(API_ENDPOINTS.SOCIAL.USER_FOLLOWERS(userId), { params });
  }

  async getFollowing(userId: string, limit?: number): Promise<{ following: { id: string; first_name?: string; last_name?: string; avatar_url?: string } }[]> {
    const params = limit ? { limit } : {};
    return api.get(API_ENDPOINTS.SOCIAL.USER_FOLLOWING(userId), { params });
  }

  async getUserPosts(userId: string, scope?: typeof POST_METADATA_SCOPE_REALIZATION): Promise<Post[]> {
    const params = scope ? { scope } : {};
    return api.get<Post[]>(API_ENDPOINTS.SOCIAL.USER_POSTS(userId), { params });
  }
}

export const socialService = new SocialService();
export default socialService;

