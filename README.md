# 🔧 Portfolio Backend API

A professional Node.js/Express API server for portfolio management with PostgreSQL database, Cloudinary integration, and secure JWT authentication. Implements MVC architecture with comprehensive error handling and RESTful endpoints.

**Author:** Ansuraj  
**Version:** 1.0.0  
**Status:** Production Ready ✅

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Development](#development)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This backend API provides:
- **Complete CRUD operations** for portfolio content (projects, education, skills, etc.)
- **Document management** with Cloudinary storage for PDFs and images
- **Secure admin authentication** using JWT tokens
- **Database auto-migration** with PostgreSQL
- **CORS-enabled** for cross-origin frontend requests
- **Error handling and logging** for production reliability
- **Optimized PDF downloads** for desktop and mobile platforms

### Key Technologies
- **Runtime**: Node.js 16+
- **Framework**: Express 5.2.1
- **Database**: PostgreSQL 8.20.0
- **File Storage**: Cloudinary 1.41.3
- **Authentication**: JWT / jsonwebtoken 9.0.2
- **HTTP**: Axios for reliable requests
- **Development**: Nodemon for auto-restart

---

## 🏗️ Architecture

### MVC Pattern Implementation

```
Request → Routes → Middleware → Controller → Model → Database
                                              ↓
                                           Cloudinary
```

### Layer Responsibilities

| Layer | Role | Files |
|-------|------|-------|
| **Routes** | Define API endpoints | `routes/*.js` |
| **Controllers** | Business logic | `controllers/*.js` |
| **Models** | Database operations | `models/*.js` |
| **Middleware** | Auth, uploads, CORS | `middleware/*.js` |
| **Config** | Database, Cloudinary | `config/*.js` |

---

## 📁 Project Structure

```
server-script/
│
├── 📄 server.js                 # Main Express app entry
├── 📄 package.json              # Dependencies & scripts
├── 📝 schema.sql                # Database schema
├── .env                         # Environment variables
│
├── 📁 config/
│   ├── db.js                    # PostgreSQL connection pool
│   ├── cloudinary.js            # Cloudinary client setup
│   └── fallbackData.js          # Default portfolio data
│
├── 📁 controllers/              # Business logic (70+ endpoints)
│   ├── adminController.js       # Authentication & admin ops
│   ├── profileController.js     # Profile CRUD
│   ├── projectController.js     # Project CRUD
│   ├── experienceController.js  # Experience CRUD
│   ├── educationController.js   # Education CRUD
│   ├── skillController.js       # Skill CRUD
│   ├── certificationController.js # Certification CRUD
│   └── documentController.js    # PDF upload/download
│
├── 📁 routes/                   # API routing (70+ endpoints)
│   ├── adminRoutes.js           endpoints: /api/admin
│   ├── profileRoutes.js         # endpoints: /api/profile
│   ├── projectRoutes.js         # endpoints: /api/projects
│   ├── experienceRoutes.js      # endpoints: /api/experience
│   ├── educationRoutes.js       # endpoints: /api/education
│   ├── skillRoutes.js           # endpoints: /api/skills
│   ├── certificationRoutes.js   # endpoints: /api/certifications
│   └── documentRoutes.js        # endpoints: /api/documents
│
├── 📁 models/                   # Database abstraction
│   ├── Profile.js               # Profile model
│   ├── Project.js               # Project model
│   ├── Experience.js            # Experience model
│   ├── Education.js             # Education model
│   ├── Skill.js                 # Skill model
│   ├── Certification.js         # Certification model
│   ├── Document.js              # Document model
│   └── Admin.js                 # Admin model
│
├── 📁 middleware/
│   ├── authMiddleware.js        # JWT verification
│   └── upload.js                # Multer + Cloudinary setup
│
├── 📁 scripts/
│   └── setupDatabase.js         # DB initialization script
│
└── 📁 uploads/                  # Temporary upload storage
```

---

## 🚀 Installation & Setup

### Prerequisites
```bash
✓ Node.js 16+ (check: node --version)
✓ npm 8+ (check: npm --version)
✓ PostgreSQL 12+ running locally or remote
✓ Cloudinary free account
✓ Internet connection for Cloudinary API
```

### Step 1: Install Dependencies

```bash
cd backend/server-script
npm install
```

This installs all required packages automatically.

### Step 2: Configure PostgreSQL

**Option A: Local PostgreSQL**
```bash
# Windows
# Start PostgreSQL service from Services app

# Linux/Mac
brew services start postgresql
```

**Option B: Cloud PostgreSQL** (Recommended for production)
- Create account on Railway, Heroku, or AWS RDS
- Copy connection string to `.env`

### Step 3: Create `.env` File

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/portfolio_db

# Cloudinary (Sign up at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Authentication
JWT_SECRET=your_super_secret_key_change_this_in_production

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Step 4: Initialize Database

```bash
npm run db:setup
```

### Step 5: Start Backend

```bash
npm run dev
```

Expected output:
```
✓ Server running on http://localhost:5000
✓ Database connected
✓ Cloudinary configured
✓ Ready for requests
```
   - Run the schema.sql file to create tables:
     ```bash
     psql -U your_username -d portfolio_db -f schema.sql
     ```

4. **Configure environment variables**
   - Copy `.env` file and update the values:
     ```
     PORT=5000
     DATABASE_URL=postgresql://username:password@localhost:5432/portfolio_db
     ```

5. **Start the server**
   ```bash
   # Development mode with nodemon
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Projects

- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project (supports image upload)
- `PUT /api/projects/:id` - Update project (supports image upload)
- `DELETE /api/projects/:id` - Delete project

### Experience

- `GET /api/experience` - Get all experience entries
- `POST /api/experience` - Create new experience entry

### Education

- `GET /api/education` - Get all education entries
- `POST /api/education` - Create new education entry

### Skills

- `GET /api/skills` - Get all skills
- `POST /api/skills` - Create new skill

### Health Check

- `GET /api/health` - Server health check

## Data Models

### Project
```json
{
  "id": 1,
  "title": "Project Title",
  "description": "Project description",
  "tech_stack": "React, Node.js, PostgreSQL",
  "github_link": "https://github.com/username/project",
  "live_link": "https://project-demo.com",
  "image_url": "/uploads/project-image-123456789.jpg"
}
```

## File Upload

- **Supported formats**: Images only (jpg, png, gif, etc.)
- **Maximum file size**: 5MB
- **Storage location**: `/uploads` directory
- **URL format**: `/uploads/filename.ext`

## Technologies Used

- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **PostgreSQL**: Database
- **pg**: PostgreSQL client
- **Multer**: File upload middleware
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **Nodemon**: Development auto-restart

## Development

- Use `npm run dev` for development with auto-restart
- Static files are served from `/uploads` directory
- Error handling includes multer-specific errors
- All routes follow RESTful conventions

## License

ISC
