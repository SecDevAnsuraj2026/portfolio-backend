const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const pool = require('./config/db');
const Admin = require('./models/Admin');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const localDevOriginPattern = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):517\d$/;

function isAllowedOrigin(origin) {
  return (
    !origin ||
    allowedOrigins.includes(origin) ||
    (NODE_ENV !== 'production' && localDevOriginPattern.test(origin))
  );
}

async function runLightMigrations() {
  if (!pool.connected) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS certifications (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      issuer VARCHAR(255) NOT NULL,
      date VARCHAR(100) NOT NULL,
      image_url VARCHAR(500) DEFAULT 'N/A'
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      type VARCHAR(50) NOT NULL,
      file_url VARCHAR(500) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query("ALTER TABLE projects ALTER COLUMN image_url SET DEFAULT 'N/A'");
  await pool.query("ALTER TABLE certifications ALTER COLUMN image_url SET DEFAULT 'N/A'");
  await pool.query('ALTER TABLE experience ADD COLUMN IF NOT EXISTS url VARCHAR(500)');
  await pool.query("UPDATE projects SET image_url = 'N/A' WHERE image_url IS NULL OR TRIM(image_url) = ''");
  await pool.query("UPDATE certifications SET image_url = 'N/A' WHERE image_url IS NULL OR TRIM(image_url) = ''");

  await pool.query(`
    ALTER TABLE certifications
    ALTER COLUMN date TYPE VARCHAR(100)
    USING date::text
  `);

  await pool.query('ALTER TABLE certifications DROP COLUMN IF EXISTS credential_url');

  await pool.query('CREATE INDEX IF NOT EXISTS idx_certifications_title ON certifications(title)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_certifications_issuer ON certifications(issuer)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type)');
}

// Middleware
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Allow downloads on mobile by being less restrictive with COPP
  if (req.path.includes('/download/')) {
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  } else {
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site');
  }
  
  if (NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Type'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const projectRoutes = require('./routes/projectRoutes');
const certificationRoutes = require('./routes/certificationRoutes');
const experienceRoutes = require('./routes/experienceRoutes');
const educationRoutes = require('./routes/educationRoutes');
const skillRoutes = require('./routes/skillRoutes');
const profileRoutes = require('./routes/profileRoutes');
const documentRoutes = require('./routes/documentRoutes');

app.use('/api/projects', projectRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/admin', adminRoutes);

// API base endpoint
app.get('/api', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Portfolio API is available',
    endpoints: [
      '/api/health',
      '/api/profile',
      '/api/projects',
      '/api/certifications',
      '/api/experience',
      '/api/education',
      '/api/skills',
    ],
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  // If headers already sent (e.g., download in progress), just end
  if (res.headersSent) {
    console.error('Error after headers sent:', err.message);
    return res.end();
  }

  if (err instanceof multer.MulterError) {
    // Multer error
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 2MB.' });
    }
    return res.status(400).json({ success: false, message: err.message || 'File upload error' });
  } else if (err.message && err.message.includes('only') && err.message.toLowerCase().includes('allowed')) {
    return res.status(400).json({ success: false, message: err.message });
  } else if (err.message === 'Cloudinary environment variables are not fully configured') {
    return res.status(500).json({ success: false, message: err.message });
  }

  console.error('Error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
const startServer = async () => {
  try {
    await pool.initialize();
    if (pool.connected) {
      await runLightMigrations();
      await Admin.ensureDefaultAdmin();
    }

    const dbStatus = pool.connected ? '✅ Connected' : '⚠️ Fallback mode (database unavailable)';

    console.log('\n' + '='.repeat(50));
    console.log('🚀 Server is running successfully');
    console.log('='.repeat(50));
    console.log(`📍 Local URL: http://localhost:${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🗄️  Database: ${dbStatus}`);
    if (pool.useFallback) {
      console.log('ℹ️  Backend is using seeded fallback data until a PostgreSQL database is configured.');
    }
    console.log('='.repeat(50) + '\n');

  } catch (dbError) {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 Server is running successfully');
    console.log('='.repeat(50));
    console.log(`📍 Local URL: http://localhost:${PORT}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🗄️  Database: ❌ Connection initialization failed`);
    console.log(`🧠  Error: ${dbError.message}`);
    console.log('='.repeat(50));
    console.log('⚠️  Please check your database configuration\n');
  }
};

app.listen(PORT, startServer);
