// src/features/user/user.controller.ts

import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';
import { catchAsync } from '../../utils/catchAsync';

class UserController {
  /**
   * Handles the request to get the currently authenticated user's profile.
   * GET /api/v1/users/me
   */
  getMe = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore - The isAuthenticated middleware attaches the user object.
    const userId = req.user.id;

    const user = await userService.findUserById(userId);

    // We don't send the password hash or other sensitive data.
    res.status(200).json({
      status: 'success',
      data: {
        user,
      },
    });
  });
}

export const userController = new UserController();