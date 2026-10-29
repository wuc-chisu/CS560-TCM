# He An Traditional Chinese Medicine Clinic

A clinic website built with Next.js, Tailwind CSS, and PostgreSQL (Prisma), featuring an elegant red-and-gold design and responsive layouts for mobile devices.

## Tech Stack

- Next.js App Router
- Tailwind CSS
- Clerk authentication (administrators are configured with `ADMIN_EMAILS`)
- PostgreSQL + Prisma
- TypeScript + Zod

## Website Sections

- Hero banner
- About the clinic
- Services
- Practitioner team
- Health articles
- Contact, appointment booking, and contact forms

## Project Structure

```text
src/
  app/
    admin/
      appointments/
      medical-records/
      users/
    api/
      appointments/route.ts
      contact/route.ts
    sign-in/
    sign-up/
    globals.css
    layout.tsx
    page.tsx
  components/
    admin/
    forms/appointment-form.tsx
    forms/contact-form.tsx
    layout/site-header.tsx
    layout/site-footer.tsx
    providers/appointment-modal-provider.tsx
    sections/
      hero-banner.tsx
      clinic-intro.tsx
      services.tsx
      doctors.tsx
      health-articles.tsx
      contact-us.tsx
    ui/section-heading.tsx
  lib/
    admin.ts
    prisma.ts
prisma/
  schema.prisma
  seed.mjs
```

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Generate the Prisma Client, create the database tables, and seed the database:

```bash
npx prisma generate
npx prisma db push
npm run db:seed
```

4. Start the development server:

```bash
npm run dev
```

## Clerk Authentication

- Run `clerk init` or add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to `.env.local`.
- Configure administrator accounts with `ADMIN_EMAILS` as a comma-separated list. Each email must be verified.

## Contact Form Email

- Install the mail package with `npm install nodemailer`.
- Create a `.env.local` file in the project root and add your Gmail SMTP settings:

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="your-gmail@gmail.com"
SMTP_PASS="your-16-digit-app-password"
CONTACT_TO_EMAIL="your-gmail@gmail.com"
CONTACT_FROM_EMAIL="your-gmail@gmail.com"
```

- Use a Gmail App Password for `SMTP_PASS`, not your regular account password.
- When a visitor submits the contact form, the website calls `POST /api/contact`. The API validates the fields and sends the message to `CONTACT_TO_EMAIL` through Gmail SMTP.

## Test the Contact Form

1. Copy the contents of `.env.example` into `.env.local`.
2. Run `npm run dev`.
3. Open the homepage and submit the contact form.
4. Confirm the success message appears and check the recipient inbox.
5. Test validation by entering a message shorter than 10 characters and confirm that the form displays an error.

## Appointment Data

- Submitting the appointment form calls `POST /api/appointments`.
- The API uses Prisma to write to PostgreSQL and relate `Patient`, `Doctor`, `Service`, and `Appointment` records.
- Practitioner and service choices are defined in English in `src/lib/appointment-schema.ts`; the API checks that each choice has an active database record.
- The system prevents a practitioner from receiving overlapping `PENDING` or `CONFIRMED` appointments.
- The API also checks `DoctorSchedule` and `ClinicClosure` records to prevent bookings outside available hours or on closure dates.

## Default Appointment Data

- Run `npm run db:seed` to create the English-language practitioners, services, and weekday schedules from 9:00 AM to 5:00 PM. Run the seed after upgrading an existing database so the English choices are available.

## Appointment Admin Dashboard

- Open `/admin/appointments`.
- Only administrators can access this page. Signed-out users see a sign-in button, and users without administrator access see a permission message. Administrators can view all, pending, confirmed, and cancelled appointments.
