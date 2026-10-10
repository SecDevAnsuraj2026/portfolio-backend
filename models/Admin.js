import bcrypt from 'bcryptjs';

import pool from '../config/db.js';

// SECURITY: Environment variables are REQUIRED - no defaults!
if (!process.env.ADMIN_EMAIL) {
  throw new Error('ADMIN_EMAIL environment variable is required');
}
if (!process.env.ADMIN_PASSWORD) {
  throw new Error('ADMIN_PASSWORD environment variable is required');
}

const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BCRYPT_ROUNDS = 12;

function toAdmin(row) {
  return {
    id: row.id,
    email: row.email,
    password: row.password,
    createdAt: row.created_at,
  };
}

function isHashedPassword(value) {
  return typeof value === 'string' && value.startsWith('$2');
}

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

class Admin {
  static async getByEmail(email) {
    const query = 'SELECT * FROM admin WHERE email = $1 LIMIT 1';
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] ? toAdmin(result.rows[0]) : null;
  }

  static async create({ email, password }) {
    const query = `
      INSERT INTO admin (email, password)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [email.toLowerCase(), await hashPassword(password)];
    const result = await pool.query(query, values);
    return result.rows[0] ? toAdmin(result.rows[0]) : null;
  }

  static async ensureDefaultAdmin() {
    const existing = await Admin.getByEmail(DEFAULT_ADMIN_EMAIL);
    if (existing) {
      if (!isHashedPassword(existing.password)) {
        return Admin.updatePassword(existing.email, existing.password);
      }
      return existing;
    }
    return Admin.create({ email: DEFAULT_ADMIN_EMAIL, password: DEFAULT_ADMIN_PASSWORD });
  }

  static async updatePassword(email, newPassword) {
    const query = `
      UPDATE admin
      SET password = $1
      WHERE email = $2
      RETURNING *
    `;
    const values = [await hashPassword(newPassword), email.toLowerCase()];
    const result = await pool.query(query, values);
    return result.rows[0] ? toAdmin(result.rows[0]) : null;
  }

  static needsPasswordRehash(storedPassword) {
    return Boolean(storedPassword && !isHashedPassword(storedPassword));
  }

  static async verifyPassword(password, storedPassword) {
    if (!storedPassword) {
      return false;
    }
    if (isHashedPassword(storedPassword)) {
      return bcrypt.compare(password, storedPassword);
    }
    return password === storedPassword;
  }
}

export default Admin;
