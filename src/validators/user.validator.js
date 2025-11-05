const { z } = require('zod');

const createUserSchema = z.object({
  email: z.string().email({ message: 'A valid email is required' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters long' }),
});

module.exports = {
  createUserSchema,
};