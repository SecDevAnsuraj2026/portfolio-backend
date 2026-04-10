CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  tech_stack TEXT,
  github_link VARCHAR(500),
  live_link VARCHAR(500),
  image_url VARCHAR(500) DEFAULT 'N/A',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS profile (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  summary TEXT,
  mobile VARCHAR(100),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  instagram_url VARCHAR(500),
  facebook_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS certifications (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255) NOT NULL,
  date VARCHAR(100) NOT NULL,
  image_url VARCHAR(500) DEFAULT 'N/A'
);

CREATE TABLE IF NOT EXISTS experience (
  id SERIAL PRIMARY KEY,
  role VARCHAR(255) NOT NULL,
  organization VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date VARCHAR(50), 
  description TEXT,
  url VARCHAR(255)      
);

CREATE TABLE IF NOT EXISTS education (
  id SERIAL PRIMARY KEY,
  degree VARCHAR(255) NOT NULL,
  institution VARCHAR(255) NOT NULL,
  year VARCHAR(20),
  score VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_title ON projects(title);
CREATE INDEX IF NOT EXISTS idx_certifications_title ON certifications(title);
CREATE INDEX IF NOT EXISTS idx_certifications_issuer ON certifications(issuer);
CREATE INDEX IF NOT EXISTS idx_experience_start_date ON experience(start_date);
CREATE INDEX IF NOT EXISTS idx_education_year ON education(year);
CREATE INDEX IF NOT EXISTS idx_skills_type ON skills(type);

INSERT INTO projects
  (id, title, description, tech_stack, github_link, live_link, image_url)
VALUES
  (
    1,
    'Hand2Write Platform',
    'A secure writing platform that manages content, collaboration, and personalized workflows.',
    'React, ExpressJS, PostgreSQL, Axios',
    'https://github.com/SecDevAnsuraj2026/hand2write-platform',
    'https://hand2write.example.com',
    'https://placehold.co/900x600/f8fafc/0f766e/png?text=Hand2Write+Platform'
  ),
  (
    2,
    'FRIDAY Voice Assistant',
    'A voice-enabled assistant for task automation, search, and hands-free productivity.',
    'React, Node.js, ExpressJS, PostgreSQL',
    'https://github.com/SecDevAnsuraj2026/friday-voice-assistant',
    'https://friday-ai.example.com',
    'https://placehold.co/900x600/f8fafc/be123c/png?text=FRIDAY+Assistant'
  ),
  (
    3,
    'Secure Auth App',
    'An authentication dashboard with JWT, login sessions, and admin access controls.',
    'React, ExpressJS, PostgreSQL, JWT',
    'https://github.com/SecDevAnsuraj2026/secure-auth-app',
    'https://secure-auth.example.com',
    'https://placehold.co/900x600/f8fafc/4338ca/png?text=Secure+Auth+App'
  ),
  (
    4,
    'Feedback Collector',
    'A feedback collection and reporting tool for capturing user responses securely.',
    'React, ExpressJS, PostgreSQL, Bootstrap',
    'https://github.com/SecDevAnsuraj2026/feedback-collector',
    'https://feedback-collector.example.com',
    'https://placehold.co/900x600/f8fafc/1d4ed8/png?text=Feedback+Collector'
  ),
  (
    5,
    'CDR Analyzer',
    'A call detail record analyzer for telecom metrics, parsing, and reporting.',
    'Node.js, PostgreSQL, ExpressJS, JavaScript',
    'https://github.com/SecDevAnsuraj2026/cdr-analyzer',
    'https://cdr-analyzer.example.com',
    'https://placehold.co/900x600/f8fafc/15803d/png?text=CDR+Analyzer'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO profile
  (id, name, email, summary, mobile, linkedin_url, github_url, instagram_url, facebook_url)
VALUES
  (
    1,
    'Ansu Raj',
    'ansuraj1998rks@gmail.com',
    'B.Tech CSE (Cybersecurity) student and Full-Stack Developer proficient in Python, Node.js, and PostgreSQL.',
    '7808018791',
    'https://www.linkedin.com/in/ansurajsecdev',
    'https://github.com/SecDevAnsuraj2026',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO experience
  (id, role, organization, location, start_date, end_date, description, url)
VALUES
  (
    1,
    'Cybersecurity Intern',
    'I4C, MP Police State Cyber Cell',
    'Bhopal, India',
    '2026-03-01',
    '2026-03-31',
    'Assisted with security assessments, vulnerability review, and secure application testing.',
    'https://x.com/mpcyberpolice?lang=en'
  ),
  (
    2,
    'Python Developer Intern',
    'THE SKYBRISK',
    'Remote',
    '2025-12-01',
    'Present', 
    'Platform for tech internships and custom web and mobile development Remote.',
    'https://www.theskybrisk.com/'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO education
  (id, degree, institution, year, score)
VALUES
  (1, 'B.Tech CSE (Cybersecurity)', 'SIRT Bhopal', '2026', '7.0 CGPA'),
  (2, '12th CBSE', 'CBSE Board', '2022', '55%'),
  (3, '10th CBSE', 'CBSE Board', '2020', '75%')
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills
  (id, name, type)
VALUES
  (1, 'Python', 'language'),
  (2, 'JavaScript', 'language'),
  (3, 'HTML', 'language'),
  (4, 'CSS', 'language'),
  (5, 'SQL', 'language'),
  (6, 'React', 'framework'),
  (7, 'ExpressJS', 'framework'),
  (8, 'Flask', 'framework'),
  (9, 'Django', 'framework'),
  (10, 'MongoDB', 'database'),
  (11, 'PostgreSQL', 'database'),
  (12, 'MySQL', 'database'),
  (13, 'Git & GitHub', 'tool'),
  (14, 'Kali Linux', 'tool'),
  (15, 'VS Code', 'tool'),
  (16, 'PyCharm', 'tool')
ON CONFLICT (id) DO NOTHING;

INSERT INTO admin
  (id, email, password)
VALUES
  (1, 'ansuraj1998rks@gmail.com', '$2a$12$Lq0e8nGojK9.3xFAt0wHKe10CQ3aJ/JAW2hiyNE72m6p9wMrOVFJ2')
ON CONFLICT (id) DO NOTHING;

SELECT setval('projects_id_seq', COALESCE((SELECT MAX(id) FROM projects), 1));
SELECT setval('profile_id_seq', COALESCE((SELECT MAX(id) FROM profile), 1));
SELECT setval('certifications_id_seq', COALESCE((SELECT MAX(id) FROM certifications), 1));
SELECT setval('experience_id_seq', COALESCE((SELECT MAX(id) FROM experience), 1));
SELECT setval('education_id_seq', COALESCE((SELECT MAX(id) FROM education), 1));
SELECT setval('skills_id_seq', COALESCE((SELECT MAX(id) FROM skills), 1));
SELECT setval('admin_id_seq', COALESCE((SELECT MAX(id) FROM admin), 1));
