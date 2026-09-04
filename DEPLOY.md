# 🚀 Deploy Yo'riqnomasi

## Loyiha: Team CRM (React + Express + PostgreSQL)

---

## 1. Backend Deploy (Railway)

### 1.1. Railwayga kirish
1. [railway.app](https://railway.app) ga kiring
2. GitHub orqali kiring
3. **New Project** → **Deploy from GitHub repo**
4. Backend papkasini tanlang

### 1.2. PostgreSQL bazani yaratish
1. Railway dashboard'da **New** → **Database** → **PostgreSQL**
2. Bazani backend xizmatiga ulang
3. `DATABASE_URL` avtomatik o'rnatiladi

### 1.3. Environment variables
Railway dashboard'da **Variables** bo'limiga boring va qo'shing:

```
FRONTEND_URL=https://your-app.vercel.app
JWT_SECRET=random-access-secret-123456789
JWT_REFRESH_SECRET=different-random-refresh-secret-987654321
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
NODE_ENV=production
```

> ⚠️ `FRONTEND_URL` ni Vercel deploy bo'lgandan keyin to'ldiring

### 1.4. Deploy
- Railway avtomatik deploy qiladi
- Backend URL: `https://your-project.up.railway.app`
- Health check: `https://your-project.up.railway.app/api/health`

---

## 2. Frontend Deploy (Vercel)

### 2.1. Vercelga kirish
1. [vercel.com](https://vercel.com) ga kiring
2. GitHub orqali kiring
3. **New Project** → Import qiling
4. Root directory: `frontend`

### 2.2. Environment variables
Vercel dashboard'da **Settings** → **Environment Variables**:

```
VITE_API_URL=https://your-railway-app.up.railway.app/api
```

### 2.3. Deploy
- Vercel avtomatik deploy qiladi
- Frontend URL: `https://your-app.vercel.app`

---

## 3. Deploydan keyin

### 3.1. Backend CORS ni yangilang
Railway'da `FRONTEND_URL` ni to'g'ri URL ga o'zgartiring:
```
FRONTEND_URL=https://your-app.vercel.app
```

### 3.2. Tekshiring
1. Backend health check: `https://your-app.up.railway.app/api/health`
2. Frontend: `https://your-app.vercel.app`
3. Login/Register funksiyalarini sinab ko'ring

---

## 🔧 Muammo hal qilish

### CORS xatosi
- `FRONTEND_URL` to'g'ri URL ekanligini tekshiring
- URL oxirida `/` qo'shmang

### Database xatosi
- `DATABASE_URL` to'g'ri ekanligini tekshiring
- SSL kerak bo'lsa: `?ssl=true` qo'shing

### Build xatosi
- Backend: `npm install` dan keyin `npm start` ishga tushiring
- Frontend: `npm run build` xatoliksiz ishlashi kerak

---

## 📝 Tez deploy (qisqa)

```bash
# Backend (Railway)
# 1. GitHub repo ni Railway ga import qiling
# 2. PostgreSQL database qo'shing
# 3. Environment variables o'rnating

# Frontend (Vercel)
# 1. GitHub repo ni Vercel ga import qiling
# 2. Root directory: frontend
# 3. VITE_API_URL environment variable qo'shing
```

---

## 🎯 Deploy URL'lari

| Xizmat | URL |
|--------|-----|
| Backend | `https://your-project.up.railway.app` |
| Frontend | `https://your-app.vercel.app` |
| Database | Railway PostgreSQL |

---

Generated with Codebuff 🤖
