// src/features/user/user.service.ts

import { User } from './user.types';
import logger from '../../utils/logger';
import AppError from '../../utils/AppError';

// --- DATABASE MOCK (Replace with your actual database client) ---
const db = {
  findUserById: async (id: string): Promise<User | null> => {
    logger.debug({ userId: id }, '[DB MOCK] Fetching user by ID');
    // In a real application, you would query your database here.
    if (id === 'mock_user_id_123') {
      return {
        id: 'mock_user_id_123',
        email: 'test.user@example.com',
        name: 'Test User',
        createdAt: new Date('2024-01-15T10:00:00Z'),
      };
    }
    return null;
  },
};
// --- END DATABASE MOCK ---


class UserService {
  public async findUserById(id: string): Promise<User> {
    const user = await db.findUserById(id);
    if (!user) {
      throw new AppError(404, 'User not found.');
    }
    return user;
  }
}

export const userService = new UserService();