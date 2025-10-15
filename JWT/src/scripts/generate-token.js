// src/scripts/generate-token.js

// This script allows us to generate a JWT from the command line.
// Usage: node src/scripts/generate-token.js <userId> [roles]
// Example: node src/scripts/generate-token.js user-789 admin,editor

const { generateToken } = require('../services/jwt.service');

// Process command-line arguments
const userId = process.argv[2];
const rolesArg = process.argv[3];

// --- Validation ---
if (!userId) {
  console.error('Error: A user ID must be provided.');
  console.log('Usage: node src/scripts/generate-token.js <userId> [roles]');
  console.log('Example: node src/scripts/generate-token.js user-789 admin,editor');
  process.exit(1); // Exit with an error code
}

// --- Prepare Payload ---
const payload = {
  sub: userId,
  // If roles are provided as a comma-separated string, split them into an array
  roles: rolesArg ? rolesArg.split(',') : [],
};

// --- Generate and Print Token ---
try {
  const token = generateToken(payload);
  console.log('--- Generated JWT ---');
  console.log(token);
} catch (error) {
  console.error('Failed to generate token:', error);
  process.exit(1);
}