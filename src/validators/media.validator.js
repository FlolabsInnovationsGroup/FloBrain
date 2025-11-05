const { z } = require('zod');

// Define the schema for the media upload endpoint.
// We expect a body with a 'filename' property that is a non-empty string.
const uploadMediaSchema = z.object({
  filename: z.string({
    required_error: 'Filename is required',
  }).min(1, { message: 'Filename cannot be empty' }),
  // You could add more rules here, e.g.,
  // userId: z.number().int().positive(),
});

module.exports = {
  uploadMediaSchema,
};