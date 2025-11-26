// src/features/media/media.types.ts

// Re-defining core types here to keep the media feature self-contained.
// In a larger project, these might live in a shared 'types' directory.
export type ProcessingStatus = 'pending_processing' | 'processing' | 'processed' | 'error';
export type MediaType = 'audio' | 'video' | 'image';

export interface Media {
  id: string;
  user_id: string;
  name: string;
  media_type: MediaType;
  processing_status: ProcessingStatus;
  created_at: Date;
}

// Defines the structure for API query parameters for pagination and filtering
export interface FindMediaOptions {
  page: number;
  limit: number;
  filters: {
    media_type?: MediaType;
    processing_status?: ProcessingStatus;
  };
}

// A generic, reusable interface for any paginated API response
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalRecords: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
}