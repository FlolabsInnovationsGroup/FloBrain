// src/middleware/errorHandler.ts

import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';
import logger from '../utils/logger';

const handleOperationalError = (err: AppError, res: Response) => {
  // Operational, trusted error: send message to client
  res.status(err.statusCode).json({
    status: err.status,
    error: err.name,
    message: err.message,
  });
};

const handleProgrammingError = (err: Error, res: Response) => {
  // Programming or other unknown error: don't leak error details
  logger.error(err, 'UNHANDLED ERROR 💥');

  res.status(500).json({
    status: 'error',
    error: 'InternalServerError',
    message: 'Something went very wrong!',
  });
};


const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return handleOperationalError(err, res);
  }

  // Handle other types of errors if necessary (e.g., database validation errors)
  // For now, we treat everything else as a 500-level programming error.
  
  return handleProgrammingError(err, res);
};

export default errorHandler;