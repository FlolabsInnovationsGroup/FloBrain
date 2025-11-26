// src/features/media/media.service.ts

import { Media, FindMediaOptions, PaginatedResponse, MediaType, ProcessingStatus } from './media.types';
import logger from '../../utils/logger';

// --- MOCK DATABASE ---
// A comprehensive mock dataset to simulate real-world data for two different users.
const allMedia: Media[] = [
  { id: 'media_001', user_id: 'mock_user_id_123', name: 'Meeting Recap.mp4', media_type: 'video', processing_status: 'processed', created_at: new Date('2025-11-20T10:00:00Z') },
  { id: 'media_002', user_id: 'mock_user_id_123', name: 'Project Brainstorm.mp3', media_type: 'audio', processing_status: 'processed', created_at: new Date('2025-11-19T15:30:00Z') },
  { id: 'media_003', user_id: 'mock_user_id_123', name: 'IMG_9872.jpg', media_type: 'image', processing_status: 'processed', created_at: new Date('2025-11-19T12:00:00Z') },
  { id: 'media_004', user_id: 'mock_user_id_123', name: 'Podcast Interview.mp3', media_type: 'audio', processing_status: 'pending_processing', created_at: new Date('2025-11-21T09:00:00Z') },
  { id: 'media_005', user_id: 'mock_user_id_456', name: 'Other User Video.mp4', media_type: 'video', processing_status: 'processed', created_at: new Date('2025-11-18T11:00:00Z') },
  { id: 'media_006', user_id: 'mock_user_id_123', name: 'Transcription Failed.mp3', media_type: 'audio', processing_status: 'error', created_at: new Date('2025-11-18T18:00:00Z') },
  { id: 'media_007', user_id: 'mock_user_id_123', name: 'Team Presentation.mp4', media_type: 'video', processing_status: 'processing', created_at: new Date('2025-11-22T14:00:00Z') },
  { id: 'media_008', user_id: 'mock_user_id_123', name: 'logo-design.png', media_type: 'image', processing_status: 'pending_processing', created_at: new Date('2025-11-23T16:00:00Z') },
];
// --- END MOCK DATABASE ---

class MediaService {
  /**
   * Finds and paginates media records for a specific user, applying optional filters.
   * @param userId - The ID of the user whose media to fetch.
   * @param options - Pagination and filtering options.
   * @returns A paginated response object containing the user's media.
   */
  public async findUserMedia(userId: string, options: FindMediaOptions): Promise<PaginatedResponse<Media>> {
    const { page, limit, filters } = options;
    logger.debug({ userId, options }, 'Finding user media with options');

    // 1. Authorization: Filter by the authenticated user
    let userMedia = allMedia.filter(m => m.user_id === userId);

    // 2. Apply Filters
    if (filters.media_type) {
      userMedia = userMedia.filter(m => m.media_type === filters.media_type);
    }
    if (filters.processing_status) {
      userMedia = userMedia.filter(m => m.processing_status === filters.processing_status);
    }

    // 3. Sort by most recent
    userMedia.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    const totalRecords = userMedia.length;
    const totalPages = Math.ceil(totalRecords / limit);

    // 4. Apply Pagination
    const offset = (page - 1) * limit;
    const paginatedData = userMedia.slice(offset, offset + limit);

    logger.info(`Found ${totalRecords} records for user ${userId}, returning page ${page}`);

    return {
      data: paginatedData,
      meta: {
        totalRecords,
        currentPage: page,
        totalPages,
        limit,
      },
    };
  }
}

export const mediaService = new MediaService();