# Deployment Guide for Competitive Exam Platform

Your project has been prepared for production with **Render** (Backend & Database) and **Vercel** (Frontend).

## 1. Backend & Database (Render)
1. Go to [Render](https://render.com/).
2. **Database:**
   - Create a new **PostgreSQL** database.
   - Copy the **Internal Database URL** for the backend service.
3. **Backend Service:**
   - Create a new **Web Service**.
   - Connect your GitHub repo: `hani197/compititive-exam`.
   - Set **Root Directory** to `backend`.
   - **Runtime:** `Python`.
   - **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`
   - **Start Command:** `gunicorn core.wsgi`
   - **Environment Variables:**
     - `SECRET_KEY`: (generate a random string)
     - `DATABASE_URL`: (paste the database URL from step 2)
     - `ALLOWED_HOSTS`: `your-backend-url.onrender.com,your-frontend-url.vercel.app`
     - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-url.vercel.app`
     - `CSRF_TRUSTED_ORIGINS`: `https://your-frontend-url.vercel.app`
     - `DEBUG`: `False`
     - `ANTHROPIC_API_KEY`: (your key)
     - `GEMINI_API_KEY`: (your key)
     - (Optional) `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` for persistent media storage.

## 2. Frontend (Vercel)
1. Go to [Vercel](https://vercel.com/).
2. Create a new project.
3. Connect your GitHub repo: `hani197/compititive-exam`.
4. Set **Root Directory** to `frontend`.
5. **Framework Preset:** `Vite`.
6. **Environment Variables:**
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api`
7. Click **Deploy**.

## 3. Post-Deployment
- Run the seed data command if needed:
  Go to Render's "Shell" tab for your backend and run:
  `python manage.py seed_data`
