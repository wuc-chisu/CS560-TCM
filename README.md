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

## Contact Us 表單寄信設定

- 安裝寄信套件：`npm install nodemailer`
- 在專案根目錄建立 `.env.local`，並填入以下 Gmail SMTP 設定：

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-16-digit-app-password"
CONTACT_TO_EMAIL="your-gmail@gmail.com"
CONTACT_FROM_EMAIL="your-gmail@gmail.com"
```

- `SMTP_PASS` 請使用 Gmail App Password，不要填入一般登入密碼
- 使用者送出聯絡表單後，網站會呼叫 `POST /api/contact`，API 會先驗證欄位，再透過 Gmail SMTP 將內容寄到 `CONTACT_TO_EMAIL`

## Contact Us 測試方式

1. 將 `.env.example` 內容補到 `.env.local`
2. 執行 `npm run dev`
3. 開啟首頁並送出 Contact Us 表單
4. 確認畫面有成功訊息，並檢查 Gmail 收件匣
5. 可用少於 10 字的訊息測試驗證錯誤，確認表單會顯示失敗原因

## 預約資料儲存

- 預約表單送出後會呼叫 `POST /api/appointments`
- API 透過 Prisma 將資料寫入 PostgreSQL 的 `Appointment` 資料表
