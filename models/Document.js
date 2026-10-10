import pool from '../config/db.js';
import * as fallback from '../config/fallbackData.js';

function toDocument(row) {
  return {
    id: row.id,
    type: row.type,
    fileUrl: row.file_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

class Document {
  static async getByType(type) {
    if (pool.useFallback) {
      return fallback.getDocumentByType(type)
    }

    try {
      const query = 'SELECT * FROM documents WHERE type = $1 LIMIT 1';
      const result = await pool.query(query, [type]);
      return result.rows[0] ? toDocument(result.rows[0]) : null;
    } catch (error) {
      console.error('Database error in Document.getByType():', error.message);
      // Return null if table doesn't exist or query fails
      if (error.message.includes('does not exist') || error.message.includes('relation')) {
        return null;
      }
      throw error;
    }
  }

  static async getAll() {
    if (pool.useFallback) {
      return fallback.getDocuments()
    }

    try {
      const query = 'SELECT * FROM documents ORDER BY type';
      const result = await pool.query(query);
      return result.rows.map(toDocument);
    } catch (error) {
      console.error('Database error in Document.getAll():', error.message);
      // Return empty array if table doesn't exist or query fails
      if (error.message.includes('does not exist') || error.message.includes('relation')) {
        return [];
      }
      throw error;
    }
  }

  static async create({ type, fileUrl }) {
    if (pool.useFallback) {
      return fallback.addDocument({ type, fileUrl })
    }

    const query = `
      INSERT INTO documents (type, file_url, created_at, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const result = await pool.query(query, [type, fileUrl]);
    return result.rows[0] ? toDocument(result.rows[0]) : null;
  }

  static async update(id, { type, fileUrl }) {
    if (pool.useFallback) {
      return fallback.updateDocument(id, { type, fileUrl })
    }

    const query = `
      UPDATE documents
      SET type = $1, file_url = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [type, fileUrl, id]);
    return result.rows[0] ? toDocument(result.rows[0]) : null;
  }

  static async upsert({ type, fileUrl }) {
    const existing = await Document.getByType(type);
    
    if (existing) {
      return Document.update(existing.id, { type, fileUrl });
    }
    
    return Document.create({ type, fileUrl });
  }

  static async delete(id) {
    if (pool.useFallback) {
      return fallback.deleteDocument(id)
    }

    const query = 'DELETE FROM documents WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? toDocument(result.rows[0]) : null;
  }

  static async deleteByType(type) {
    if (pool.useFallback) {
      return fallback.deleteDocumentByType(type)
    }

    const query = 'DELETE FROM documents WHERE type = $1 RETURNING *';
    const result = await pool.query(query, [type]);
    return result.rows[0] ? toDocument(result.rows[0]) : null;
  }
}

export default Document;
