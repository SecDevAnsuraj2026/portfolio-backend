import pool from '../config/db.js';

function toCertification(row) {
  return {
    id: row.id,
    title: row.title,
    issuer: row.issuer,
    date: row.date,
    imageUrl: row.image_url,
  };
}

function toCertificationRecord(certificationData) {
  return {
    title: certificationData.title,
    issuer: certificationData.issuer,
    date: certificationData.date,
    image_url: certificationData.image_url || certificationData.imageUrl || 'N/A',
  };
}

class Certification {
  static async getAll() {
    const query = 'SELECT * FROM certifications ORDER BY id DESC';
    const result = await pool.query(query);
    return result.rows.map(toCertification);
  }

  static async getById(id) {
    const query = 'SELECT * FROM certifications WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? toCertification(result.rows[0]) : null;
  }

  static async create(certificationData) {
    const certification = toCertificationRecord(certificationData);
    const query = `
      INSERT INTO certifications (title, issuer, date, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      certification.title,
      certification.issuer,
      certification.date,
      certification.image_url,
    ];
    const result = await pool.query(query, values);
    return toCertification(result.rows[0]);
  }

  static async update(id, certificationData) {
    const certification = toCertificationRecord(certificationData);
    const query = `
      UPDATE certifications
      SET title = $1, issuer = $2, date = $3, image_url = $4
      WHERE id = $5
      RETURNING *
    `;
    const values = [
      certification.title,
      certification.issuer,
      certification.date,
      certification.image_url,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] ? toCertification(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = 'DELETE FROM certifications WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? toCertification(result.rows[0]) : null;
  }
}

export default Certification;
