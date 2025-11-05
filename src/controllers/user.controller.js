const bcrypt = require('bcrypt');
const dbPool = require('../services/real-db-connection');
const db = require('../services/db');
const { ConflictError } = require('../utils/customErrors'); // <-- Import ConflictError

const userController = {
  createUser: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      req.log.info({
        body: req.body,
        msg: 'Attempting to create a new user. PII should be redacted.',
      });

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const query = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email';
      const result = await db.timedQuery(
        'create_user',
        () => dbPool.query(query, [email, hashedPassword])
      );

      res.status(201).json({
        success: true,
        message: 'User created successfully.',
        user: result.rows[0],
      });
    } catch (error) {
      if (error.code === '23505') {
        const conflictError = new ConflictError(
          'A user with this email already exists.',
          'USER_CONFLICT'
        );
        return next(conflictError);
      }
      
      next(error);
    }
  },
};

module.exports = userController;