const { sequelize } = require('../../config/database');
const FileModel = require('./file.model');

const db = {};

db.sequelize = sequelize;

// Initialize models
db.File = FileModel(sequelize);

// Sync all models with the database
// In a production environment, should use migrations instead of sync({ force: true })
const syncDb = async () => {
  await db.sequelize.sync({ alter: true }); // Use alter: true to update schema without dropping data
  console.log("All models were synchronized successfully.");
};

module.exports = { db, syncDb };