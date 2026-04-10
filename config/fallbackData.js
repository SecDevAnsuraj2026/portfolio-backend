const fallbackData = {
  profile: {
    id: 1,
    name: 'Ansu Raj',
    email: 'ansuraj1998rks@gmail.com',
    summary:
      'B.Tech CSE (Cybersecurity) student and Full-Stack Developer proficient in Python, Node.js, and PostgreSQL.',
    mobile: '7808018791',
    linkedinUrl: 'https://www.linkedin.com/in/ansurajsecdev',
    githubUrl: 'https://github.com/SecDevAnsuraj2026',
    instagramUrl: '',
    facebookUrl: '',
  },
  projects: [
    {
      id: 1,
      title: 'Secure Portfolio Dashboard',
      description:
        'A React and Express portfolio dashboard with PostgreSQL-backed project data.',
      techStack: ['React', 'Bootstrap', 'Node.js', 'PostgreSQL'],
      githubUrl: 'https://github.com/username/secure-portfolio-dashboard',
      liveUrl: 'https://secure-portfolio.example.com',
      imageUrl: 'https://placehold.co/900x600/f8fafc/0f766e/png?text=Portfolio+Dashboard',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      title: 'Threat Notes Library',
      description:
        'A searchable knowledge base for cybersecurity commands, references, and learning notes.',
      techStack: ['React', 'Express', 'PostgreSQL', 'Axios'],
      githubUrl: 'https://github.com/username/threat-notes-library',
      liveUrl: 'https://threat-notes.example.com',
      imageUrl: 'https://placehold.co/900x600/f8fafc/be123c/png?text=Threat+Notes',
      createdAt: new Date().toISOString(),
    },
  ],
  certifications: [],
  experience: [
    {
      id: 1,
      role: 'Frontend Developer Intern',
      organization: 'Nexora Labs',
      location: 'Remote',
      startDate: '2025-06-01',
      endDate: '2025-09-30',
      description:
        'Built responsive React components and integrated REST APIs for internal dashboards.',
      url: 'https://www.linkedin.com',
    },
    {
      id: 2,
      role: 'Cybersecurity Trainee',
      organization: 'SecurePath Academy',
      location: 'Bengaluru, India',
      startDate: '2025-10-01',
      endDate: '2026-02-28',
      description:
        'Practiced secure coding, OWASP basics, log review, and vulnerability reporting workflows.',
      url: 'https://owasp.org',
    },
  ],
  education: [
    {
      id: 1,
      degree: 'B.Tech in Computer Science',
      institution: 'Riverside Institute of Technology',
      year: '2026',
      score: '8.4 CGPA',
    },
    {
      id: 2,
      degree: 'Higher Secondary Education',
      institution: 'Green Valley Public School',
      year: '2022',
      score: '87%',
    },
  ],
  skills: [
    { id: 1, name: 'JavaScript', type: 'language' },
    { id: 2, name: 'SQL', type: 'language' },
    { id: 3, name: 'React', type: 'framework' },
    { id: 4, name: 'Express.js', type: 'framework' },
    { id: 5, name: 'Bootstrap', type: 'framework' },
    { id: 6, name: 'Git', type: 'tool' },
    { id: 7, name: 'PostgreSQL', type: 'tool' },
  ],
}

function nextId(collection) {
  if (!Array.isArray(fallbackData[collection]) || fallbackData[collection].length === 0) {
    return 1
  }
  return Math.max(...fallbackData[collection].map((item) => Number(item.id) || 0)) + 1
}

module.exports = {
  fallbackData,
  getProfile() {
    return fallbackData.profile
  },
  updateProfile(profileUpdates) {
    fallbackData.profile = {
      ...fallbackData.profile,
      ...profileUpdates,
    }
    return fallbackData.profile
  },
  getProjects() {
    return fallbackData.projects
  },
  addProject(project) {
    const newProject = {
      id: nextId('projects'),
      createdAt: new Date().toISOString(),
      ...project,
    }
    fallbackData.projects.unshift(newProject)
    return newProject
  },
  deleteProject(projectId) {
    const id = Number(projectId)
    const index = fallbackData.projects.findIndex((item) => Number(item.id) === id)
    if (index === -1) return null
    return fallbackData.projects.splice(index, 1)[0]
  },
  updateProject(projectId, projectUpdates) {
    const id = Number(projectId)
    const index = fallbackData.projects.findIndex((item) => Number(item.id) === id)
    if (index === -1) return null
    fallbackData.projects[index] = {
      ...fallbackData.projects[index],
      ...projectUpdates,
    }
    return fallbackData.projects[index]
  },
  getCertifications() {
    return fallbackData.certifications
  },
  addCertification(certification) {
    const newCertification = {
      id: nextId('certifications'),
      ...certification,
    }
    fallbackData.certifications.unshift(newCertification)
    return newCertification
  },
  updateCertification(certificationId, certificationUpdates) {
    const id = Number(certificationId)
    const index = fallbackData.certifications.findIndex((item) => Number(item.id) === id)
    if (index === -1) return null
    fallbackData.certifications[index] = {
      ...fallbackData.certifications[index],
      ...certificationUpdates,
    }
    return fallbackData.certifications[index]
  },
  deleteCertification(certificationId) {
    const id = Number(certificationId)
    const index = fallbackData.certifications.findIndex((item) => Number(item.id) === id)
    if (index === -1) return null
    return fallbackData.certifications.splice(index, 1)[0]
  },
  getExperience() {
    return fallbackData.experience
  },
  addExperience(experience) {
    const newExperience = {
      id: nextId('experience'),
      ...experience,
    }
    fallbackData.experience.unshift(newExperience)
    return newExperience
  },
  updateExperience(experienceId, experienceUpdates) {
    const id = Number(experienceId)
    const index = fallbackData.experience.findIndex((item) => Number(item.id) === id)
    if (index === -1) return null
    fallbackData.experience[index] = {
      ...fallbackData.experience[index],
      ...experienceUpdates,
    }
    return fallbackData.experience[index]
  },
  deleteExperience(experienceId) {
    const id = Number(experienceId)
    const index = fallbackData.experience.findIndex((item) => Number(item.id) === id)
    if (index === -1) return null
    return fallbackData.experience.splice(index, 1)[0]
  },
  getEducation() {
    return fallbackData.education
  },
  addEducation(education) {
    const newEducation = {
      id: nextId('education'),
      ...education,
    }
    fallbackData.education.unshift(newEducation)
    return newEducation
  },
  updateEducation(educationId, educationUpdates) {
    const id = Number(educationId)
    const index = fallbackData.education.findIndex((item) => Number(item.id) === id)
    if (index === -1) return null
    fallbackData.education[index] = {
      ...fallbackData.education[index],
      ...educationUpdates,
    }
    return fallbackData.education[index]
  },
  deleteEducation(educationId) {
    const id = Number(educationId)
    const index = fallbackData.education.findIndex((item) => Number(item.id) === id)
    if (index === -1) return null
    return fallbackData.education.splice(index, 1)[0]
  },
  getSkills() {
    return fallbackData.skills
  },
  addSkill(skill) {
    const newSkill = {
      id: nextId('skills'),
      ...skill,
    }
    fallbackData.skills.unshift(newSkill)
    return newSkill
  },
  deleteSkill(skillId) {
    const id = Number(skillId)
    const index = fallbackData.skills.findIndex((skill) => Number(skill.id) === id)
    if (index === -1) return null
    return fallbackData.skills.splice(index, 1)[0]
  },
  updateSkill(skillId, skillUpdates) {
    const id = Number(skillId)
    const index = fallbackData.skills.findIndex((skill) => Number(skill.id) === id)
    if (index === -1) return null
    fallbackData.skills[index] = {
      ...fallbackData.skills[index],
      ...skillUpdates,
    }
    return fallbackData.skills[index]
  },
}
