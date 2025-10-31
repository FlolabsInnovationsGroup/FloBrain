import { Sequelize } from 'sequelize';
import 'dotenv/config';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Missing DATABASE_URL in .env');

export const sequelize = new Sequelize(url, {
  dialect: 'postgres',
  logging: false,
});
