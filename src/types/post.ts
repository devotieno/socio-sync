export interface SocialMediaPost {
  id?: string;
  userId: string;
  content: string;
  platforms: string[]; // ['twitter', 'facebook', 'instagram', etc.]
  selectedAccounts: string[]; // Individual account IDs for granular posting
  scheduledAt?: Date;
  publishedAt?: Date;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  mediaFiles?: MediaFile[];
  createdAt: Date;
  updatedAt: Date;
  analytics?: PostAnalytics;
}

export interface MediaFile {
  id: string;
  url: string;
  type: 'image' | 'video';
  size: number;
  filename: string;
  thumbnail?: string;
}

export interface PostAnalytics {
  likes: number;
  shares: number;
  comments: number;
  views: number;
  engagement: number;
  platformMetrics: {
    [platform: string]: {
      likes: number;
      shares: number;
      comments: number;
      views: number;
    };
  };
}

export interface ScheduledPost extends SocialMediaPost {
  scheduledAt: Date;
  status: 'scheduled';
}

export interface PostFormData {
  content: string;
  selectedAccounts: string[];
  scheduledAt?: Date | null;
  mediaFiles?: File[];
  publishNow: boolean;
}

export interface PlatformConfig {
  id: string;
  name: string;
  icon: string;
  maxCharacters: number;
  supportsMedia: boolean;
  supportedMediaTypes: string[];
  color: string;
}

export const PLATFORM_CONFIGS: Record<string, PlatformConfig> = {
  twitter: {
    id: 'twitter',
    name: 'Twitter',
    icon: '𝕏',
    maxCharacters: 280,
    supportsMedia: true,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    color: '#1DA1F2',
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    maxCharacters: 63206,
    supportsMedia: true,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
    color: '#4267B2',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    maxCharacters: 2200,
    supportsMedia: true,
    supportedMediaTypes: ['image/jpeg', 'image/png'],
    color: '#E4405F',
  },
  threads: {
    id: 'threads',
    name: 'Threads',
    icon: '🧵',
    maxCharacters: 500,
    supportsMedia: true,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
    color: '#000000',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    maxCharacters: 3000,
    supportsMedia: true,
    supportedMediaTypes: ['image/jpeg', 'image/png', 'video/mp4'],
    color: '#0077B5',
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    maxCharacters: 2200,
    supportsMedia: true,
    supportedMediaTypes: ['video/mp4', 'video/quicktime'],
    color: '#FE2C55',
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    maxCharacters: 5000,
    supportsMedia: true,
    supportedMediaTypes: ['video/mp4', 'video/quicktime', 'video/avi'],
    color: '#FF0000',
  },
};
