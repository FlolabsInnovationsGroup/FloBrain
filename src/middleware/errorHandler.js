const { BaseError } = require('../utils/customErrors');
const config = require('../config');

/**
 * The global error handling middleware.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  // If the error is not one of our custom BaseErrors, we check for other common types
  if (!(error instanceof BaseError)) {
    // Handle Express.json() parsing errors
    if (error instanceof SyntaxError && 'body' in error) {
      error = new BaseError('Malformed JSON in request body', 400, 'VALIDATION_BODY');
    } else {
      // For all other unexpected errors, wrap them in a generic 500 error
      // This ensures we don't leak implementation details
      error = new BaseError(
        'An unexpected internal error occurred',
        500,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }
  
  // Log the error in a structured format
  req.log.error({
    // Standard log fields
    route: `${req.method} ${req.originalUrl}`,
    status: error.httpStatus,
    msg: error.message,
    // Error-specific fields
    error_code: error.errorCode,
    error_name: err.name, // Log original error name (e.g., "SyntaxError")
    // Log the full stack for the original error for unexpected errors
    ...(error.httpStatus === 500 && { stack: err.stack }),
  });

  // Construct the standardized error response
  const errorResponse = {
    success: false,
    error: {
      code: error.errorCode,
      message: error.message,
      request_id: req.requestId,
    },
  };

  res.status(error.httpStatus).json(errorResponse);
}

module.exports = errorHandler;