import pool from '../config/db.js';

function toProject(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    techStack: row.tech_stack
      ? row.tech_stack.split(',').map((item) => item.trim()).filter(Boolean)
      : [],
    githubUrl: row.github_link,
    liveUrl: row.live_link,
    imageUrl: row.image_url,
    createdAt: row.created_at,
  };
}

function toProjectRecord(projectData) {
  return {
    title: projectData.title,
    description: projectData.description,
    tech_stack: Array.isArray(projectData.techStack)
      ? projectData.techStack.join(', ')
      : projectData.tech_stack || projectData.techStack,
    github_link: projectData.github_link || projectData.githubUrl,
    live_link: projectData.live_link || projectData.liveUrl,
    image_url: projectData.image_url || projectData.imageUrl || 'N/A',
  };
}

class Project {
  static async getAll() {
    const query = 'SELECT * FROM projects ORDER BY created_at DESC, id DESC';
    const result = await pool.query(query);
    return result.rows.map(toProject);
  }

  static async getById(id) {
    const query = 'SELECT * FROM projects WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? toProject(result.rows[0]) : null;
  }

  static async create(projectData) {
    const project = toProjectRecord(projectData);
    const query = `
      INSERT INTO projects (title, description, tech_stack, github_link, live_link, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      project.title,
      project.description,
      project.tech_stack,
      project.github_link,
      project.live_link,
      project.image_url,
    ];
    const result = await pool.query(query, values);
    return toProject(result.rows[0]);
  }

  static async update(id, projectData) {
    const project = toProjectRecord(projectData);
    const query = `
      UPDATE projects
      SET title = $1,
          description = $2,
          tech_stack = $3,
          github_link = $4,
          live_link = $5,
          image_url = $6
      WHERE id = $7
      RETURNING *
    `;
    const values = [
      project.title,
      project.description,
      project.tech_stack,
      project.github_link,
      project.live_link,
      project.image_url,
      id,
    ];
    const result = await pool.query(query, values);
    return result.rows[0] ? toProject(result.rows[0]) : null;
  }

  static async delete(id) {
    const query = 'DELETE FROM projects WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? toProject(result.rows[0]) : null;
  }
}

export default Project;
