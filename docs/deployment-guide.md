# 🚀 SK Beringis Sports Championship Portal - Cloud Deployment Guide

This guide provides step-by-step instructions to deploy the **SK Beringis Portal** online using popular cloud container platforms (Render, Railway, Fly.io) with PostgreSQL.

---

## 🎯 Recommended Method 1: Render.com (1-Click Blueprint)

[Render](https://render.com) offers seamless Docker deployment and a managed PostgreSQL database with automatic SSL.

### Step 1: Push latest changes to GitHub
Ensure all your latest changes and the `render.yaml` blueprint file are pushed to GitHub:
```bash
git add .
git commit -m "feat: configure cloud deployment and render blueprint"
git push origin main
```

### Step 2: Connect to Render
1. Visit [Render Dashboard](https://dashboard.render.com/) and log in with your GitHub account.
2. Click **New +** → **Blueprint**.
3. Connect your repository: `Efftsh/sk-beringis-sport-day`.
4. Render will automatically detect `render.yaml` and configure:
   - **Web Service:** `sk-beringis-portal` (Docker container running AdonisJS v6 + React)
   - **PostgreSQL Database:** `sk-beringis-db`
5. Click **Apply**. Render will provision your database and build the Docker container.

### Step 3: Run Initial Data Seeding
Once the deployment status turns to **Live**:
1. In the Render Dashboard, click on your **sk-beringis-portal** Web Service.
2. Go to the **Shell** tab (or connect via SSH).
3. Run the initial seeder once to populate the 4 sport houses and initial events:
   ```bash
   node ace db:seed
   ```
4. Access your live portal at `https://<your-subdomain>.onrender.com`!

---

## 🚂 Method 2: Railway.app

[Railway](https://railway.app) provides ultra-fast Docker container hosting.

### Step 1: Create a Railway Project
1. Log in to [Railway.app](https://railway.app) with GitHub.
2. Click **New Project** → **Deploy from GitHub repo** → select `Efftsh/sk-beringis-sport-day`.
3. In the project canvas, click **+ New** → **Database** → **Add PostgreSQL**.

### Step 2: Configure Environment Variables
In your web service settings on Railway, add/link the following variables:
- `PORT` = `3333`
- `HOST` = `0.0.0.0`
- `NODE_ENV` = `production`
- `APP_KEY` = *(generate via `node ace generate:key` or enter a 32-char secret)*
- `APP_URL` = `https://${RAILWAY_STATIC_URL}`
- `DB_CONNECTION` = `pg`
- `DB_SSL` = `true`
- `DATABASE_URL` = `${{Postgres.DATABASE_URL}}`

### Step 3: Initial Seed
Open the **Web Terminal** on Railway and run:
```bash
node ace db:seed
```

---

## 🪽 Method 3: Fly.io

1. Install Flyctl CLI:
   ```bash
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```
2. Launch the app and attach a Postgres cluster:
   ```bash
   fly launch
   fly postgres create
   fly postgres attach <postgres-app-name>
   fly deploy
   ```

---

## 🔑 Default Production Login Credentials
- **Admin Email:** `admin@skberingis.edu.my`
- **Default Password:** `password123` *(Remember to update your password after initial setup in the admin dashboard!)*
