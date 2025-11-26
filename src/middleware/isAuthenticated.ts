// src/middleware/isAuthenticated.ts

import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

/**
 * A mock authentication middleware.
 * In a real application, this would verify a JWT from an 'Authorization' header.
 * It attaches the authenticated user's ID to the request object.
 */
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // For demonstration, we'll hardcode a user ID.
  // In a real app, you would decode a token here.
  const mockUserId = 'mock_user_id_123';

  if (!mockUserId) {
    return next(new AppError(401, 'You are not logged in.'));
  }

  // Attach user information to the request object
  // @ts-ignore
  req.user = {
    id: mockUserId,
  };

  next();
};