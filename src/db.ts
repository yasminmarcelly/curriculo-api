import 'dotenv/config';
import { Pool } from 'pg';

const url = process.env.DATABASE_URL;
if (!url) throw new Error('Defina DATABASE_URL (veja .env.example)');

const local = /localhost|127\.0\.0\.1/.test(url);

export const pool = new Pool({
  connectionString: url,
  ssl: local ? false : { rejectUnauthorized: false },
  max: 3,
});
