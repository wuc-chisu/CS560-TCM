# 和安中醫診所首頁

使用 Next.js + Tailwind CSS + PostgreSQL (Prisma) 建立的中醫診所首頁專案，風格採中式典雅紅金配色，並支援行動裝置。

## 技術棧

- Next.js App Router
- Tailwind CSS
- NextAuth Google Login
- PostgreSQL + Prisma
- TypeScript + Zod

## 首頁內容

- Hero Banner
- 診所介紹
- 診療項目
- 醫師團隊
- 健康專欄
- 聯絡我們（含預約與聯絡表單）

## 專案結構

```text
src/
  app/
    api/
      appointments/route.ts
      auth/[...nextauth]/route.ts
      contact/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    auth/google-login-button.tsx
    forms/appointment-form.tsx
    forms/contact-form.tsx
    layout/site-header.tsx
    layout/site-footer.tsx
    providers/session-provider.tsx
    sections/
      hero-banner.tsx
      clinic-intro.tsx
      services.tsx
      doctors.tsx
      health-articles.tsx
      contact-us.tsx
    ui/section-heading.tsx
  lib/
    auth.ts
    prisma.ts
prisma/
  schema.prisma
```

## 本機啟動

1. 安裝套件

```bash
npm install
```

2. 建立環境變數

```bash
cp .env.example .env
```

3. 初始化 Prisma Client 與資料表

```bash
npx prisma generate
npx prisma db push
```

4. 啟動開發伺服器

```bash
npm run dev
```

## Google Login 設定

- 在 Google Cloud Console 建立 OAuth Client
- Authorized redirect URI 設為: `http://localhost:3000/api/auth/callback/google`
- 將 `GOOGLE_CLIENT_ID` 與 `GOOGLE_CLIENT_SECRET` 填入 `.env`

## 預約資料儲存

- 預約表單送出後會呼叫 `POST /api/appointments`
- API 透過 Prisma 將資料寫入 PostgreSQL 的 `Appointment` 資料表
