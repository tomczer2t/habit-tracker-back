import { createPool } from 'mysql2/promise';
import { config } from '../config/config';

export const pool = createPool({
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  namedPlaceholders: true,
});