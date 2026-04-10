const pool = require('../config/db');

function toExperience(row) {
  return {
    id: row.id,
    role: row.role,
    organization: row.organization,
    location: row.location,
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    url: row.url,
  };
}

function toExperienceRecord(experienceData) {
  return {
    role: experienceData.role,
    organization: experienceData.organization,
    location: experienceData.location,
    start_date: experienceData.start_date || experienceData.startDate,
    end_date: experienceData.end_date || experienceData.endDate || null,
    description: experienceData.description,
    url: experienceData.url || null,
  };
}

class Experience {
  static async getAll() {
    const query = 'SELECT * FROM experience ORDER BY start_date DESC, id DESC';
    const result = await pool.query(query);
    return result.rows.map(toExperience);
  }

  static async create(experienceData) {
    const experience = toExperienceRecord(experienceData);
    const query = `
      INSERT INTO experience
        (role, organization, location, start_date, end_date, description, url)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      experience.role,
      experience.organization,
      experience.location,
      experience.start_date,
      experience.end_date,
      experience.description,
      experience.url,
    ];
    const result = await pool.query(query, values);
    return toExperience(result.rows[0]);
  }

  static async update(id, experienceData) {
    const experience = toExperienceRecord(experienceData);
    const query = `
      UPDATE experience
      SET role = $1,
          organization = $2,
          location = $3,
          start_date = $4,
          end_date = $5,
          description = $6,
          url = $7
      WHERE id = $8
      RETURNING *
    `;
    const values = [
      experience.role,
      experience.organization,
      experience.location,
      experience.start_date,
      experience.end_date,
      experience.description,
      experience.url,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] ? toExperience(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = 'DELETE FROM experience WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? toExperience(result.rows[0]) : null;
  }
}

module.exports = Experience;
