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

## ATAYLAB QOLDIRILGAN QISMLAR (keyingi safar)

Quyidagilarni **soxta/yarim qilib chalkashtirmaslik uchun** ataylab qilmadim — xohlasangiz alohida qilib beraman:

1. **Access + Refresh token tizimi** — hozir oddiy JWT (7 kunlik). To'liq access/refresh + avtomatik yangilash + xavfsiz saqlash alohida katta ish, auth arxitekturasini qayta qurishni talab qiladi.
2. **Manager roli / murakkab permission matritsasi** — hozir SUPER_ADMIN/ADMIN/USER + project owner/member bor. Yangi "Manager" rolini qo'shish mavjud tizimga ta'sir qiladi, alohida muhokama qilish kerak.
3. **Clients moduli** — rasmda "Mijozlar" sidebar item bor edi, lekin bu original spec'da yo'q edi va yangi entity/CRUD talab qiladi.
4. **Global search UI** (backend allaqachon tayyor `/api/search`, faqat frontend qismi yo'q)
5. **Activity calendar (GitHub-style heatmap)** — backend tayyor (`/api/activity/calendar`), frontend hali yo'q

Shu 5 tadan qaysi birini keyin qilishimni ayting.
