const { ValidationError } = require('../utils/customErrors');

/**
 * A middleware factory that takes a Zod schema and returns a validation middleware.
 * @param {import('zod').ZodSchema} schema - The Zod schema to validate against.
 */
const validate = (schema) => (req, res, next) => {
  try {
    // Zod's `parse` method will throw an error if validation fails.
    schema.parse(req.body);
    next();
  } catch (err) {
    // If it's a ZodError, format it into a user-friendly message.
    if (err.name === 'ZodError') {
      const message = err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
      // Use our existing ValidationError to send a 400 response.
      const validationError = new ValidationError(message, 'VALIDATION_FAILED');
      
      // Log the specific validation failure for debugging.
      req.log.warn({
        msg: 'Request validation failed',
        error_code: 'VALIDATION_FAILED',
        details: message,
      });

      return next(validationError);
    }
    // For any other kind of error, pass it to the global error handler.
    next(err);
  }
};

module.exports = validate;