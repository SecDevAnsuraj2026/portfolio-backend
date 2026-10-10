import pool from '../config/db.js';

function toProfile(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    summary: row.summary,
    mobile: row.mobile,
    linkedinUrl: row.linkedin_url,
    githubUrl: row.github_url,
    instagramUrl: row.instagram_url,
    facebookUrl: row.facebook_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toProfileRecord(profileData) {
  return {
    name: profileData.name || 'Ansu Raj',
    email: profileData.email || '',
    summary: profileData.summary || '',
    mobile: profileData.mobile || '',
    linkedin_url: profileData.linkedinUrl || profileData.linkedin_url || '',
    github_url: profileData.githubUrl || profileData.github_url || '',
    instagram_url: profileData.instagramUrl || profileData.instagram_url || '',
    facebook_url: profileData.facebookUrl || profileData.facebook_url || '',
  };
}

class Profile {
  static async get() {
    const query = 'SELECT * FROM profile ORDER BY id LIMIT 1';
    const result = await pool.query(query);
    return result.rows[0] ? toProfile(result.rows[0]) : null;
  }

  static async update(profileData) {
    const existingResult = await pool.query('SELECT name, email FROM profile WHERE id = 1 LIMIT 1');
    const existingProfile = existingResult.rows[0] || {};
    const profile = toProfileRecord(profileData);
    const query = `
      INSERT INTO profile
        (id, name, email, summary, mobile, linkedin_url, github_url, instagram_url, facebook_url)
      VALUES
        (1, $1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        summary = EXCLUDED.summary,
        mobile = EXCLUDED.mobile,
        linkedin_url = EXCLUDED.linkedin_url,
        github_url = EXCLUDED.github_url,
        instagram_url = EXCLUDED.instagram_url,
        facebook_url = EXCLUDED.facebook_url,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    const values = [
      profileData.name || existingProfile.name || profile.name,
      profileData.email || existingProfile.email || profile.email,
      profile.summary,
      profile.mobile,
      profile.linkedin_url,
      profile.github_url,
      profile.instagram_url,
      profile.facebook_url,
    ];
    const result = await pool.query(query, values);
    return toProfile(result.rows[0]);
  }
}

export default Profile;
