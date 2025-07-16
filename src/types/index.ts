export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SocialMediaAccount {
  id: string;
  userId: string;
  platform: SocialMediaPlatform;
  accountId: string;
  accountName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type SocialMediaPlatform = 
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'linkedin'
  | 'tiktok'
  | 'threads'
  | 'youtube';

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls?: string[];
  platforms: SocialMediaPlatform[];
  status: PostStatus;
  scheduledAt?: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  analytics?: PostAnalytics;
}

export type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed';

export interface PostAnalytics {
  [platform: string]: {
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
    clicks?: number;
    lastUpdated: Date;
  };
}

export interface MediaFile {
  id: string;
  userId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  createdAt: Date;
}

export interface CreatePostData {
  content: string;
  mediaFiles?: File[];
  platforms: SocialMediaPlatform[];
  scheduledAt?: Date;
}

export interface UpdatePostData {
  content?: string;
  platforms?: SocialMediaPlatform[];
  scheduledAt?: Date;
}

export interface SocialMediaAccountConnection {
  platform: SocialMediaPlatform;
  isConnected: boolean;
  accountName?: string;
  accountId?: string;
  profilePicture?: string;
}

export interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  scheduledPosts: number;
  totalViews: number;
  totalLikes: number;
  totalShares: number;
  connectedAccounts: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
