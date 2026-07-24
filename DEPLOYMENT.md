# Deployment Guide - AI Mock Interview System

This repository is set up with automated deployment for the **Frontend** using **GitHub Pages & GitHub Actions**, and step-by-step instructions for deploying the **Django Backend**.

---

## 🌐 1. Deploying Frontend to GitHub Pages (Automated)

The frontend is built with React + Vite and is configured for GitHub Pages via GitHub Actions.

### Steps to Enable GitHub Pages:
1. Go to your GitHub repository: [Maheshuppara/Mock_interview_system_project](https://github.com/Maheshuppara/Mock_interview_system_project)
2. Click **Settings** (top navigation bar).
3. On the left sidebar, click **Pages** (under Code and automation).
4. Under **Build and deployment** -> **Source**, change the selection from *Deploy from a branch* to **GitHub Actions**.
5. Click **Save**.

That's it! Every time you push changes to the `main` branch, GitHub Actions automatically builds the project and deploys it to:
👉 **`https://maheshuppara.github.io/Mock_interview_system_project/`**

---

## 🐍 2. Deploying Django Backend

Since GitHub Pages only hosts static files (HTML/JS/CSS), the Django backend must be deployed to a cloud platform like **Render.com** or **Railway.app**.

### Option A: Render.com (Recommended & Free)
1. Create a free account at [Render.com](https://render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository `Mock_interview_system_project`.
4. Configure the Web Service settings:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt && python manage.py migrate`
   - **Start Command**: `gunicorn config.wsgi:application`
5. Click **Create Web Service**.

### Option B: PythonAnywhere / Railway
- Use `backend/requirements.txt` to install dependencies.
- Database: Configure SQLite or MySQL environment variables in `backend/config/settings.py`.
- Run migrations: `python manage.py migrate`.

---

## 🔄 3. Connecting Frontend to Live Backend

Once your backend is live (e.g. `https://your-backend.onrender.com`), update the API URL in `frontend/src/` (or via environment variables) so API requests target your live server instead of `http://127.0.0.1:8000`.
