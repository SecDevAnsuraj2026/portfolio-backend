# Backend README

This file contains the backend details for the portfolio project.

## Backend Stack
- Express
- PostgreSQL
- Cloudinary
- Multer
- JWT
- cookie-parser

## Main Responsibilities
- Serve portfolio content from PostgreSQL
- Fall back to seeded data when PostgreSQL is unavailable
- Protect admin write routes
- Upload project and certification images
- Upload resume and CV PDFs
- Serve public document downloads
- Run light startup migrations

## Important Files
```text
backend/server-script/
|-- server.js
|-- schema.sql
|-- config/
|   |-- db.js
|   |-- cloudinary.js
|   `-- fallbackData.js
|-- controllers/
|-- middleware/
|-- models/
|-- routes/
`-- scripts/setupDatabase.js
```

## Scripts
```bash
npm run dev
npm start
npm run db:setup
```

## Backend `.env`
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@host:5432/database
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=your-admin@example.com
ADMIN_PASSWORD=your-strong-password
JWT_SECRET=replace-this-in-production
CLIENT_URL=http://localhost:5173,http://localhost:3000
```

## Admin Auth
- Admin login uses `ADMIN_EMAIL` and `ADMIN_PASSWORD` from backend `.env`
- `POST /api/admin/login` creates a JWT-backed session
- Protected routes accept cookie auth and bearer token auth
- `GET /api/admin/session` refreshes session state for the frontend
- To change admin credentials, update `.env` and restart backend
- There is no password-change API

## Public Routes
- `GET /api`
- `GET /api/health`
- `GET /api/profile`
- `GET /api/projects`
- `GET /api/projects/:id`
- `GET /api/certifications`
- `GET /api/certifications/:id`
- `GET /api/experience`
- `GET /api/education`
- `GET /api/skills`
- `GET /api/documents`
- `GET /api/documents/:type`
- `GET /api/documents/download/:type`

## Protected Routes
- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/session`
- `PUT /api/profile`
- `POST|PUT|DELETE /api/projects`
- `POST|PUT|DELETE /api/certifications`
- `POST|PUT|DELETE /api/experience`
- `POST|PUT|DELETE /api/education`
- `POST|PUT|DELETE /api/skills`
- `POST /api/documents/upload`
- `DELETE /api/documents/:type`

## Upload Rules
- Image types: JPG, JPEG, PNG, WEBP
- Document type: PDF only
- Max upload size: 2 MB
- Cloudinary folders:
  - `portfolio/projects`
  - `portfolio/certifications`
  - `portfolio/documents`

## Database Behavior
- Uses PostgreSQL through `pg`
- Falls back to seeded in-memory content if the database is unavailable
- Applies light startup migrations for a few schema updates

## Run Backend Only
```bash
cd backend/server-script
npm install
npm run db:setup
npm run dev
```

## Troubleshooting
- If PostgreSQL is down, the backend may run in fallback mode
- If Cloudinary is missing, uploads will fail
- If admin requests return `401`, log in again and verify frontend API config
