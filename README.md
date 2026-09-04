# Team CRM & Project Finance System

## Ishga tushirish

### Backend
```bash
cd backend
npm install
cp .env.example .env   # DB ma'lumotlarini kiriting
npm run dev            # http://localhost:4000
```

### Frontend (React + Vite + Tailwind + Recharts)
```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

## Bu sessiyada qilingan yirik o'zgarishlar

### Dashboard — jonlantirildi
- Har bir statistik karta bosiladigan: Daromad/Xarajat/Foyda → Moliya, Loyihalar → Loyihalar (status filtri bilan), Bajarilgan vazifalar → Vazifalar
- Hover effektlar: border, shadow, biroz ko'tarilish
- **Analytics**: Daromad vs Xarajat grafigi (so'nggi 6 oy, recharts), Eng foydali loyihalar, Eng ko'p sarflangan loyihalar (ikkalasi ham bosiladi → Project Detail), Vazifalar holati (bajarilgan/jarayonda/todo/muddati o'tgan)
- "Kutilayotgan xarajat" statik/ishlamaydigan karta olib tashlandi — o'rniga "Kutilayotgan to'lovlar" (bosilsa Moliyaga o'tadi, u yerda real action bor)

### Projects — jadval + karta, alohida yaratish sahifasi
- `/projects` — qidiruv, status filtri, 10 xil sorting (yangi/eski, ko'p/kam sarflangan, ko'p/kam daromad, foyda, progress, muddat)
- Yuqorida jadval (dense), pastda "Muhim loyihalar" karta grid (progress bar, status badge, jamoa avatarlari, foyda)
- `/projects/new` — alohida to'liq forma: nomi, tavsif, mijoz, prioritet, status, sanalar, byudjet/kutilgan daromad-xarajat, jamoa a'zolarini tanlash, boshlang'ich eslatma
- Har bir loyiha kartasi/qatori bosilsa → `/projects/:id`

### Finance ↔ Projects bog'lanishi
- Tranzaksiya qo'shishda loyiha tanlash (avvalgi so'rovingiz — ishlayapti)
- Loyihaga bog'liq tranzaksiya loyiha nomiga bosilsa → o'sha loyiha sahifasiga o'tadi
- Dashboarddagi "eng foydali/eng ko'p sarflangan loyihalar" ham bosilsa → Project Detail

### Universal Pending → Completed
- Moliyada har bir "Kutilmoqda" tranzaksiya yonida **Bajarildi** / **Bekor qilish** tugmalari (ham global Moliya sahifasida, ham loyiha ichidagi Moliya tabida)
- Status filtri (Hammasi / Kutilmoqda / Bajarilgan / Bekor qilingan)

### Profile sahifasi
- `/profile` — avatar, holat (available/busy/dnd/offline), "hozir nima ustida ishlayapsiz", bio, faoliyat statistikasi (loyihalar, bajarilgan vazifalar, yutuqlar, faol kunlar)
- Sidebar pastidagi user chip bosilsa profilga o'tadi

### Loyiha o'chirish
- Project Detail sahifasida owner/admin uchun "O'chirish" — tasdiqlash so'rovi bilan

### Backend qo'shimchalari
- `Project` entity: `priority`, `client` maydonlari qo'shildi
- `GET /api/projects` — sort/filter/search + har bir loyiha uchun real moliya va progress (batch hisoblangan, N+1 emas)
- `GET /api/reports/analytics` — oylik trend, loyiha performance, vazifa statistikasi (real DB'dan, fake emas)
- `GET /api/users/me/stats` — profil statistikasi
- `GET /api/users/directory` — barcha userlar uchun yengil ro'yxat (@mention, a'zo tanlash uchun)
- `DELETE /api/projects/:id`

## Auth: Access + Refresh token tizimi

- Login/register → `{ accessToken, refreshToken, user }` qaytaradi
- `accessToken` qisqa muddatli (default `15m`, `JWT_ACCESS_EXPIRES_IN`), xotirada saqlanadi
- `refreshToken` uzoq muddatli (default `30d`, `JWT_REFRESH_EXPIRES_IN`), `localStorage`'da saqlanadi va DB'da **hash holda** saqlanadi — logout'da bekor qilinadi
- Access token eskirsa frontend avtomatik `POST /api/auth/refresh` bilan yangilaydi (single-flight) va so'rovni qayta yuboradi
- Har refresh'da token **rotatsiya** qilinadi (eski refresh token bekor bo'ladi); logout `POST /api/auth/logout` server tomonda tokenni o'chiradi
- Parol almashtirilganda barcha refresh tokenlar bekor qilinadi

> ⚠️ Eski `localStorage.token` (7 kunlik oddiy JWT) bilan tizim o'zgartirildi — eski sessiya endi ishlamaydi, foydalanuvchilar bir marta qayta kirishi kerak.

## ATAYLAB QOLDIRILGAN QISMLAR (keyingi safar)

Quyidagilarni **soxta/yarim qilib chalkashtirmaslik uchun** ataylab qilmadim — xohlasangiz alohida qilib beraman:

1. **Manager roli / murakkab permission matritsasi** — hozir SUPER_ADMIN/ADMIN/USER + project owner/member bor. Yangi "Manager" rolini qo'shish mavjud tizimga ta'sir qiladi, alohida muhokama qilish kerak.
2. **Clients moduli** — rasmda "Mijozlar" sidebar item bor edi, lekin bu original spec'da yo'q edi va yangi entity/CRUD talab qiladi.
3. **Activity calendar (GitHub-style heatmap)** — backend tayyor (`/api/activity/calendar`), frontend hali yo'q

Qaysi birini keyin qilishimni ayting.
