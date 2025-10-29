// src/models/user.model.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../../models'); // <-- THIS IS THE CORRECTED LINE
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fullName: {
    type: DataTypes.STRING,
    field: 'full_name',
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user',
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'active',
  },
}, {
  // Model options
  tableName: 'Users',
  // Use a hook to automatically hash the password before a user is created
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        // Hashing with cost factor 10, as per requirements
        user.password = await bcrypt.hash(user.password, 10);
      }
    },
  },
});

// We no longer need custom createUser/findUserByEmail functions.
// We will call User.create() and User.findOne() directly from the controller.

module.exports = User;