# One World Investment

One World Investment is a beginner-friendly full-stack starter repository for an investment website focused on coffee, gasoline, and jewelry business opportunities. It includes a polished landing page, a working Express backend, JWT login and registration, contact form handling, and a real investor dashboard backed by local JSON storage.

## Project Overview

This repository is organized so future website builders, collaborators, and portfolio reviewers can quickly understand where things live and what to edit.

Main source-of-truth folders:

- `frontend/` for the website UI and dashboard
- `backend/` for the Express API, data logic, and local storage

If older prototype files still exist at the project root, treat `frontend/` and `backend/` as the maintained starter structure.

If `legacy-archive/` is present, it only contains old duplicate files kept for cleanup safety. The live project does not depend on it, so you can delete it after you confirm you no longer need the archived copies.

## Features

- Responsive landing page with modern dark blue and gold branding
- Filipino-friendly package presentation and peso formatting
- Contact form connected to a real backend endpoint
- Investor registration with bcrypt password hashing
- Investor login using JWT authentication
- Real dashboard page with saved investments and progress tracking
- Sample JSON storage for users, contacts, and investments
- Placeholder assets for logo, business icons, payment icon, and dashboard icons
- Starter-ready structure for future database upgrades

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Authentication: JWT
- Password security: bcryptjs
- Local storage: JSON files
- Config: dotenv
- API access: fetch

## Storage Policy

This starter currently uses JSON file storage inside `backend/data/`.

Important:

- JSON storage is for demo and development only.
- It works well for local testing and starter prototypes.
- It is not recommended for real production deployments.

For production, migrate storage to a proper database such as:

- MongoDB
- PostgreSQL

The backend already keeps storage access grouped inside helper/controller layers so future migration is easier.

## Folder Structure

```text
/project-root
  /frontend
    index.html
    style.css
    script.js
    dashboard.html
    dashboard.css
    dashboard.js
    /assets
      /images
      /icons
      /logos
  /backend
    server.js
    package.json
    .env.example
    /routes
    /controllers
    /models
    /middleware
    /utils
    /data
  README.md
  .gitignore
```

## Installation Guide

### Local Setup

1. Clone or download the repository.
2. Open the project folder.
3. Choose whether you want a frontend-only preview or the full-stack version.

## Running Frontend

For a quick visual preview only:

1. Open `frontend/index.html` in a browser.

Important:

- This is useful for layout/design review.
- Backend-powered features like login, registration, contact saving, and dashboard data need the backend running.

## Running Backend

1. Open a terminal inside `backend/`
2. Run `npm install`
3. Copy `.env.example` to `.env`
4. Set your `JWT_SECRET`
5. Run `npm start`

After the backend starts, open:

- `http://localhost:5000`

That serves the frontend together with the backend API.

## Environment Variables

Create `backend/.env` with:

```env
PORT=5000
JWT_SECRET=your_secret_here
NODE_ENV=development
FRONTEND_URL=https://your-site.netlify.app
```

## Security Notes

- Never deploy without changing `JWT_SECRET`.
- In development mode, the backend can use a fallback JWT secret for easier local setup.
- Outside development mode, the backend now stops if `JWT_SECRET` is missing.
- For real deployments, replace JSON storage with MongoDB or PostgreSQL.

## API Base URL

Frontend API requests are configured in:

- `frontend/script.js`
- `frontend/dashboard.js`

Current pattern:

- `localhost` automatically uses `http://localhost:5000`
- deployed frontend builds use `window.API_BASE_URL` first
- if nothing is injected, the frontend falls back to the placeholder Render backend URL

Before deployment, update the fallback value or inject:

```html
<script>
  window.API_BASE_URL = "https://your-real-backend-url.com";
</script>
```

## Sample Data

Starter sample data is included in:

- `backend/data/users.json`
- `backend/data/investments.json`
- `backend/data/contacts.json`

Notes:

- Sample data is meant to show file structure and dashboard shape.
- For a clean auth test, it is best to register a fresh account locally.

## Beginner Notes

### Where to edit frontend design

- `frontend/index.html`
- `frontend/style.css`
- `frontend/dashboard.html`
- `frontend/dashboard.css`

### Where to edit investment values

- `backend/utils/packages.js`

This file controls package IDs, names, amounts, estimated returns, duration, and max slots.

### Where to edit dashboard logic

- `frontend/dashboard.js`
- `backend/controllers/investmentController.js`

### Where to edit backend API behavior

- `backend/server.js`
- `backend/routes/`
- `backend/controllers/`
- `backend/middleware/`

### Where to replace assets

- `frontend/assets/logos/`
- `frontend/assets/icons/`
- `frontend/assets/images/`

## Deployment Guide

### GitHub Pages

GitHub Pages is best for frontend-only hosting.

Steps:

1. Deploy `frontend/` as a static site.
2. If you need the backend too, host `backend/` separately on Render, Railway, or another Node host.
3. Set `window.API_BASE_URL` or update the fallback API URL in the frontend if your backend runs on a different domain.

Best use:

- portfolio preview
- static frontend demo

### Netlify

Netlify is ideal for the frontend.

Steps:

1. Set publish directory to `frontend`
2. The included `netlify.toml` already points Netlify to the `frontend` folder
3. Deploy the backend separately on Render, Railway, a VPS, or another Node host
4. Set `window.API_BASE_URL` or update the fallback API URL if needed
5. Set `FRONTEND_URL=https://your-site.netlify.app` in your backend environment variables

Best use:

- landing page deployment
- frontend collaboration previews

### Vercel

You can deploy the Node backend using the included `vercel.json`.

Steps:

1. Import the repository into Vercel
2. Set the project root if needed
3. Add environment variables
4. Confirm the Express server routes correctly

Best use:

- combined Node-based deployment
- quick cloud previews

### Render

Render is a good home for the Express backend.

Steps:

1. Create a new Web Service from the repo
2. Point the service at `backend/`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables from `.env.production.example` or `backend/.env.example`
6. Set `FRONTEND_URL=https://your-site.netlify.app` when your frontend is deployed separately

Best use:

- simple backend hosting
- pairing with GitHub Pages or Netlify frontend hosting

### Railway

Railway works well for the backend without code changes.

Steps:

1. Create a new project from the repository
2. Point the service at `backend/`
3. Install dependencies with `npm install`
4. Start with `npm start`
5. Add environment variables from `.env.production.example`
6. Set `FRONTEND_URL=https://your-site.netlify.app` when your frontend is deployed separately

Best use:

- fast Node backend hosting
- pairing with Netlify, GitHub Pages, or another static frontend host

## CORS Deployment Note

The backend now uses a dynamic CORS whitelist for safer browser requests.

Allowed by default:

- `http://localhost:3000`
- `http://localhost:5000`
- `http://127.0.0.1:5500`
- `http://localhost:5500`
- `https://your-netlify-site.netlify.app`
- `process.env.FRONTEND_URL` when provided

To deploy the frontend safely, set `FRONTEND_URL` in your backend environment variables.

Examples:

- Render: `FRONTEND_URL=https://your-site.netlify.app`
- Railway: `FRONTEND_URL=https://your-site.netlify.app`

## Health Check

The backend includes a lightweight health endpoint:

- `GET /api/health`

Response shape:

```json
{
  "status": "ok",
  "timestamp": "2026-04-06T12:00:00.000Z"
}
```

Notes:

- no authentication required
- no database queries
- useful for backend connection tests
- helpful for waking a sleeping Render free-tier backend

The frontend can ping `/api/health` automatically on page load before important requests if the backend may be asleep.

### VPS

This project also works on a regular VPS.

Steps:

1. Copy the repo to the server
2. Install Node.js
3. Run the backend from `backend/`
4. Use a process manager like PM2 if desired
5. Reverse proxy through Nginx or Apache if needed

Best use:

- full control over backend hosting
- long-term platform independence

## GitHub Portfolio Tips

To keep the repository clean for portfolio use:

- keep active edits inside `frontend/` and `backend/`
- replace placeholder assets with branded files when ready
- add screenshots or a live demo link later
- keep the README updated as features grow

## Future Upgrade Ideas

- MongoDB integration
- admin dashboard
- email notifications
- real payment tracking
- investor transaction history
- role-based access control
