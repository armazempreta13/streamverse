export interface Episode {
  id: string;
  number: number;
  title: string;
  duration: string;
  description: string;
  thumbnail: string;
  progress?: number;
}

export interface ContentData {
  id: string;
  slug: string;
  title: string;
  originalTitle?: string;
  year: number;
  type: "anime" | "series" | "movie";
  seasons?: number;
  duration?: string;
  genres?: string[];
  rating?: string;
  score?: number | string;
  reviews?: string;
  relevance?: string;
  description: string;
  categories?: string[];
  fullSynopsis?: string;
  heroImage?: string;
  posterImage?: string;
  thumbnailImage?: string;
  coverImage?: string;
  videoUrl?: string; // For movies
  videoUrl2?: string;
  progress?: number;
  episodes?: Episode[];
  relatedSlugs?: string[];
  status?: string;
  studio?: string;
  classification?: string;
  audio?: string;
  subtitles?: string;
  info?: any;
  cast?: {
    name: string;
    role: string;
    avatar: string;
  }[];
}
