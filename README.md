This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```


Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
qq
8/04/2026
g

## Appointment Automation (Admin Email + Google Calendar)

When a payment is successfully completed and an appointment becomes confirmed, the app can:

- send an email notification to admin,
- auto-create a Google Calendar event,
- generate and include a Google Meet link.

Set these environment variables:

```bash
ADMIN_NOTIFICATION_EMAIL=admin@example.com

GOOGLE_CALENDAR_ID=primary
GOOGLE_CALENDAR_TIMEZONE=Europe/London
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Optional (for Google Workspace domain-wide delegation)
GOOGLE_IMPERSONATED_USER=admin@yourdomain.com

# Optional appointment duration in minutes (default: 30)
APPOINTMENT_DURATION_MINUTES=30
```

Notes:

- If Google Calendar credentials are missing, booking confirmation still works; calendar creation is skipped safely.
- Appointment entries continue to appear in the admin appointments module as usual.

## Vercel Deployment Checklist (Local Works, Live Fails)

If features work on localhost but fail on Vercel, check these first:

1. Copy `.env.example` values into Vercel Project Settings -> Environment Variables.
2. Set variables for all environments you use (`Production`, `Preview`, and `Development` if needed).
3. Redeploy after updating environment variables.
4. Confirm `MONGODB_URI` points to the production database and your MongoDB network rules allow Vercel access.
5. Confirm `NEXT_PUBLIC_SITE_URL` and `AUTH_URL` match your live domain exactly.
6. Ensure Stripe live keys are configured (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`).
7. Ensure Cloudinary variables are configured, otherwise uploads/gallery actions will fail in production.
8. Ensure Google Calendar and SMTP variables are set if booking automation and emails are expected.

Common symptom mapping:

- Empty public/admin data: `MONGODB_URI` missing or pointing to wrong DB.
- Login/auth issues: missing `AUTH_SECRET`/`JWT_SECRET`/`AUTH_URL`.
- Upload button works locally but not live: missing Cloudinary credentials.
- Payments not completing live: Stripe live keys/webhook secret missing or incorrect.
