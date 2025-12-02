// src/features/user/user.routes.ts

import { Router } from 'express';
import { userController } from './user.controller';
import { isAuthenticated } from '../../middleware/isAuthenticated';

const router = Router();

// This route is protected by the isAuthenticated middleware
router.get('/me', isAuthenticated, userController.getMe);

export const userRouter = router;