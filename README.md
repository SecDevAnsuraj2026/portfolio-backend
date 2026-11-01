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


# Portfolio Backend & Database Infrastructure

This repository contains details about the hosting infrastructure, database settings, and handy SQL snippets used to maintain our application.

## 🚀 Cloud Infrastructure & Architecture

### 1. Database Hosting (Neon vs. Render)
* **Neon** was selected over Render for database storage because Neon provides a powerful, **lifetime-free tier** for its serverless PostgreSQL instance.
* Render restricts its free PostgreSQL databases to **one month only**, making Neon the superior choice for data persistence.
* **Database Platform Website:** [https://neon.com](https://neon.com)

### 2. Backend Hosting (Render)
* The backend services are deployed on the Render cloud environment.
* **The Challenge:** On Render's free tier, Web Services will automatically **spin down (go to sleep)** if they do not receive any traffic for **15 consecutive minutes**. If a user visits the app after a long time, the server suffers a cold start, causing the initial response to feel extremely laggy or slow.
* **Backend Platform Website:** [https://render.com](https://render.com)

### 3. Keep-Alive Automation (UptimeRobot)
* To fix Render's spin-down lag, **UptimeRobot** is configured as a cron-style monitoring service.
* **The Solution:** UptimeRobot sends a ping request to our Render backend API route every **5 minutes**. This regular traffic interval tricks the Render engine into staying awake continuously, ensuring instant response times whenever an actual user visits the website.
* **Monitoring Platform Website:** [https://uptimerobot.com](https://uptimerobot.com)

---

## 🤖 Deep Dive: What is UptimeRobot?

**UptimeRobot** is a popular cloud-based monitoring service used to track the availability (uptime) of websites, APIs, and servers. While its primary purpose is to alert developers when their site crashes, it is the perfect tool for maintaining free-tier cloud applications.

### ⚙️ How the Keep-Alive Trick Works
1. **The Target:** You configure UptimeRobot with your Render backend URL (e.g., your base URL or a dedicated `/health` endpoint).
2. **The Interval:** UptimeRobot sends an automated HTTP request to that URL at a fixed frequency.
3. **The Logic:** Because Render's idle timeout is **15 minutes**, UptimeRobot's **5-minute interval** effectively guarantees that the server never enters an idle state, completely bypassing "cold start" latency for real users.

### 🎁 Key Features of the Free Tier
* **50 Free Monitors:** Allows monitoring/keeping alive up to 50 distinct applications.
* **5-Minute Checking Window:** The default check rate, which perfectly solves the Render free tier limitation.
* **Multi-Location Verification:** To prevent false alarms, if a request fails, UptimeRobot double-checks your website from a completely different global datacenter before marking it down.
* **Instant Notifications:** Automatically sends email alerts the moment your backend encounters a real crash or network issue.

---

## 🛠️ Neon SQL Editor Cheatsheet

Use the following queries inside the Neon SQL Editor console to interact with the database tables.

### 📋 List All Tables
To see a clean list of all user-generated tables (filtering out internal system schemas), run:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

### 🔍 View Specific Table Data
To inspect and view all the rows inside your portfolio tables, run the corresponding query below:

* **User Profile Data**
  ```sql
  SELECT * FROM profile;
  ```

* **Project Portfolios**
  ```sql
  SELECT * FROM projects;
  ```

* **Work Experience**
  ```sql
  SELECT * FROM experience;
  ```

* **Academic Education**
  ```sql
  SELECT * FROM education;
  ```

* **Technical Skills**
  ```sql
  SELECT * FROM skills;
  ```

* **Uploaded Documents**
  ```sql
  SELECT * FROM documents;
  ```

