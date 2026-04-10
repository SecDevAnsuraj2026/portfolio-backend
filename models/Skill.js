const pool = require('../config/db');

function toSkill(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
  };
}

class Skill {
  static async getAll() {
    const query = 'SELECT * FROM skills ORDER BY type ASC, name ASC';
    const result = await pool.query(query);
    return result.rows.map(toSkill);
  }

  static async create(skillData) {
    const { name, type } = skillData;
    const query = `
      INSERT INTO skills (name, type)
      VALUES ($1, $2)
      RETURNING *
    `;
    const values = [name, type];
    const result = await pool.query(query, values);
    return toSkill(result.rows[0]);
  }

  static async update(id, skillData) {
    const { name, type } = skillData;
    const query = `
      UPDATE skills
      SET name = $1,
          type = $2
      WHERE id = $3
      RETURNING *
    `;
    const values = [name, type, id];
    const result = await pool.query(query, values);
    return result.rows[0] ? toSkill(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = 'DELETE FROM skills WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? toSkill(result.rows[0]) : null;
  }
}

module.exports = Skill;
