const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;
let pool = null;

function handlePoolError(error) {
  console.error('PostgreSQL pool error:', error.message);
  db.connected = false;
  db.useFallback = true;
}

const db = {
  pool: null,
  connected: false,
  useFallback: false,
  initializationAttempts: 0,
  maxInitAttempts: 5,
  
  async initialize() {
    if (!connectionString) {
      this.useFallback = true;
      return;
    }

    pool = new Pool({ connectionString });
    this.pool = pool;
    pool.on('error', handlePoolError);

    try {
      await pool.query('SELECT 1');
      this.connected = true;
      this.useFallback = false;
      this.initializationAttempts = 0;
    } catch (error) {
      console.error('PostgreSQL connection failed:', error.message);
      this.connected = false;
      this.useFallback = true;
      this.initializationAttempts++;
    }
  },
  
  async query(text, params) {
    // Retry logic for queries if database appears to be initializing
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (!this.connected || !pool) {
          // If still initializing, wait a bit and try again
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
            continue;
          }
          throw new Error('Database is unavailable');
        }
        
        return await pool.query(text, params);
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
        }
      }
    }
    
    throw lastError;
  },
  
  async end() {
    if (pool) {
      await pool.end();
    }
  },
};

module.exports = db;
