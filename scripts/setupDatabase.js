import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const pool = new Pool({ connectionString });

  try {
    await pool.query(schema);
    console.log('Database schema and seed data applied successfully.');
  } catch (error) {
    console.error('Database setup failed:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

setupDatabase();
