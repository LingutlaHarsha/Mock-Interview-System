# Deployment Guide - Mock Interview System

This repository is configured to deploy **both the Frontend and Backend** on **Render.com** (via automated Blueprint) or **Vercel** + **Render**.

---

## ⚡ 1. Deploy Both on Render.com (Recommended - One Click Blueprint)

Because this repository includes `render.yaml`, Render can deploy **both the Django Backend and React Frontend** automatically with one click.

### Steps:
1. Create a free account at [Render.com](https://render.com/) and sign in with GitHub.
2. Click **New +** (top right) &rarr; **Blueprint**.
3. Select your repository: **`LingutlaHarsha/Mock-Interview-System`**.
4. Render will read `render.yaml` and show:
   - `mock-interview-backend` (Django Python Web Service)
   - `mock-interview-frontend` (React Static Site, automatically wired to the backend)
5. Click **Apply**.
6. Render will build and deploy both services!

---

## 🛠️ 2. Deploying Separately on Render (Manual Option)

### Backend (Django Web Service):
1. On Render, click **New +** &rarr; **Web Service**.
2. Connect `LingutlaHarsha/Mock-Interview-System`.
3. Set the following:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate && python manage.py loaddata initial_data.json`
   - **Start Command**: `gunicorn config.wsgi:application`
4. Click **Create Web Service**. Render gives you a URL (e.g. `https://mock-interview-backend.onrender.com`).

### Frontend (React Static Site):
1. On Render, click **New +** &rarr; **Static Site**.
2. Connect `LingutlaHarsha/Mock-Interview-System`.
3. Set the following:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Under **Environment Variables**:
   - `VITE_API_URL`: Your backend URL (e.g. `https://mock-interview-backend.onrender.com`)
5. Under **Redirects/Rewrites**:
   - Add a rewrite: Source `/*` &rarr; Destination `/index.html` (Action: `Rewrite`).
6. Click **Create Static Site**.

---

## 🌐 3. Alternative: Deploy Frontend on Vercel + Backend on Render

If you prefer keeping the frontend on Vercel:
1. Deploy Backend on Render as described in Step 2.
2. In your Vercel Dashboard for `mock-interview-system-five`:
   - Go to **Settings** &rarr; **Environment Variables**.
   - Add `VITE_API_URL` with your Render backend URL (e.g. `https://mock-interview-backend.onrender.com`).
   - Go to **Deployments** &rarr; **Redeploy**.
