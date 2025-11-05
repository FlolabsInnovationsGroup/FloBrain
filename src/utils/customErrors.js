/**
 * A base class for all operational, predictable errors.
 */
class BaseError extends Error {
  constructor(message, httpStatus, errorCode) {
    super(message);
    this.name = this.constructor.name;
    this.httpStatus = httpStatus;
    this.errorCode = errorCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 4xx Client Errors
class ValidationError extends BaseError {
  constructor(message = 'Validation failed', errorCode = 'VALIDATION_FAILED') {
    super(message, 400, errorCode);
  }
}

class AuthenticationError extends BaseError {
  constructor(message = 'Missing or invalid credentials', errorCode = 'AUTH_MISSING') {
    super(message, 401, errorCode);
  }
}

class ForbiddenError extends BaseError {
  constructor(message = 'You do not have permission to perform this action', errorCode = 'FORBIDDEN') {
    super(message, 403, errorCode);
  }
}

class NotFoundError extends BaseError {
  constructor(message = 'The requested resource was not found', errorCode = 'NOT_FOUND') {
    super(message, 404, errorCode);
  }
}

class ConflictError extends BaseError {
  constructor(message = 'A conflict occurred with the current state of the resource', errorCode = 'CONFLICT') {
    super(message, 409, errorCode);
  }
}

class PayloadTooLargeError extends BaseError {
  constructor(message = 'The request payload is larger than the server is willing to process', errorCode = 'MEDIA_TOO_LARGE') {
    super(message, 413, errorCode);
  }
}

class UnsupportedMediaTypeError extends BaseError {
  constructor(message = 'The media type of the request is not supported', errorCode = 'MEDIA_UNSUPPORTED') {
    super(message, 415, errorCode);
  }
}

class UnprocessableEntityError extends BaseError {
  constructor(message = 'The request was well-formed but was unable to be followed due to semantic errors', errorCode = 'UNPROCESSABLE_ENTITY') {
    super(message, 422, errorCode);
  }
}

// 5xx Server Errors (can be added if needed, e.g., for external service failures)
class ServiceUnavailableError extends BaseError {
    constructor(message = 'The service is temporarily unavailable', errorCode = 'AI_TIMEOUT') {
        super(message, 503, errorCode);
    }
}


module.exports = {
  BaseError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  PayloadTooLargeError,
  UnsupportedMediaTypeError,
  UnprocessableEntityError,
  ServiceUnavailableError,
};