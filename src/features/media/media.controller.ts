// src/features/media/media.controller.ts

import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catchAsync';
import { mediaService } from './media.service';
import { FindMediaOptions, MediaType, ProcessingStatus } from './media.types';

class MediaController {
  /**
   * @desc    Get a paginated list of media for the authenticated user.
   *          Supports filtering by media_type and processing_status.
   * @route   GET /api/v1/media
   * @access  Authenticated
   * @query   page - The page number to retrieve (default: 1)
   * @query   limit - The number of items per page (default: 10)
   * @query   media_type - 'audio' | 'video' | 'image'
   * @query   processing_status - 'pending_processing' | 'processing' | 'processed' | 'error'
   */
  getMedia = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore - req.user is attached by isAuthenticated middleware
    const userId = req.user.id;

    // 1. Sanitize and parse query parameters with defaults
    const options: FindMediaOptions = {
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 10,
      filters: {
        media_type: req.query.media_type as MediaType | undefined,
        processing_status: req.query.processing_status as ProcessingStatus | undefined,
      },
    };

    // 2. Call the service with validated options
    const result = await mediaService.findUserMedia(userId, options);

    // 3. Send the successful response
    res.status(200).json({
      status: 'success',
      ...result,
    });
  });
}

export const mediaController = new MediaController();