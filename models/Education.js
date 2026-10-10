import pool from '../config/db.js';

function toEducation(row) {
  return {
    id: row.id,
    degree: row.degree,
    institution: row.institution,
    year: row.year,
    score: row.score,
  };
}

class Education {
  static async getAll() {
    const query = 'SELECT * FROM education ORDER BY year DESC, id DESC';
    const result = await pool.query(query);
    return result.rows.map(toEducation);
  }

  static async create(educationData) {
    const { degree, institution, year, score } = educationData;
    const query = `
      INSERT INTO education (degree, institution, year, score)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [degree, institution, year, score];
    const result = await pool.query(query, values);
    return toEducation(result.rows[0]);
  }

  static async update(id, educationData) {
    const { degree, institution, year, score } = educationData;
    const query = `
      UPDATE education
      SET degree = $1,
          institution = $2,
          year = $3,
          score = $4
      WHERE id = $5
      RETURNING *
    `;
    const values = [degree, institution, year, score, id];
    const result = await pool.query(query, values);
    return result.rows[0] ? toEducation(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = 'DELETE FROM education WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? toEducation(result.rows[0]) : null;
  }
}

export default Education;
