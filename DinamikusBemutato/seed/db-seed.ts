// seed/db-seed.ts
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from '../src/lib/server/db/schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// Ezt használjuk raw SQL-hez is
export const pool = mysql.createPool(DATABASE_URL);

// Ezt használja a Drizzle ORM (delete/insert stb.)
export const db = drizzle(pool, { schema, mode: 'default' });

export { schema };
