const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

(async () => {
  try {
    const result = await pool.query(
      "SELECT table_name,column_name,data_type FROM information_schema.columns WHERE table_name IN ('admin','admins') ORDER BY table_name,column_name"
    );
    console.log(JSON.stringify(result.rows, null, 2));
  } catch (err) {
    console.error('ERROR:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
