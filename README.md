# Spreetail 💸

A premium, full-stack shared expenses application built with Next.js 15, Supabase, Prisma, and TailwindCSS.

![Spreetail Dashboard](./public/demo.png)

## Features 🚀

- **Smart Debt Simplification Engine**: An $O(N \log N)$ greedy algorithm that calculates net positions and minimizes the total number of transactions needed to settle up.
- **Robust CSV Anomaly Engine**: Easily import dirty, real-world data. Our engine handles messy date formats, normalizes percentage logic (e.g., handles percentages that sum >100%), resolves temporal membership anomalies (charging users for periods before they joined or after they left), and maps hidden settlements correctly.
- **Complex Split Logic**: Split bills EQUALLY, by EXACT amounts, by PERCENTAGE, or by relative SHARES.
- **Multi-currency Support**: Native support for logging expenses in foreign currencies (e.g. USD) and resolving them to a base currency (INR) for fair settlement.
- **Supabase Realtime Chat**: A live, web-socket powered chat interface on each expense detail view, allowing flatmates to argue over the Wifi bill in real-time.
- **Premium Aesthetics**: Built with a sleek dark mode, smooth gradient typography, glassmorphism elements, and micro-animations for a 10x UX feel.

## Tech Stack 🛠️

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma (with `@prisma/adapter-pg` for Edge-compatible connection pooling)
- **Auth**: Custom JWT-based Authentication with Next.js Middleware
- **Realtime**: `@supabase/supabase-js`

## Local Development 💻

1. **Clone the repository**
   ```bash
   git clone https://github.com/SantoshMalana/Spreetail.git
   cd Spreetail
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   # Used by Prisma for schema migrations (Direct DB connection)
   DIRECT_URL="postgresql://postgres.[YOUR-SUPABASE-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"

   # Used by the App for standard queries (Connection Pooler)
   DATABASE_URL="postgresql://postgres.[YOUR-SUPABASE-REF]:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

   # Supabase client config for Realtime Chat
   NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-SUPABASE-REF].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

   # Custom Auth Key
   JWT_SECRET="your-super-secret-key"
   ```

4. **Initialize the Database**
   ```bash
   npx prisma db push
   
   # Enable Supabase Realtime for the chat feature
   node enable-realtime.js
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

## Vercel Deployment 🚀

This project is configured to deploy seamlessly to Vercel.

1. Push your code to GitHub.
2. In Vercel, "Import Project" and select the repository.
3. Add the **Environment Variables** listed above into your Vercel project settings.
4. The Build Command is already configured in `package.json` to run `prisma generate && next build`.
5. Click **Deploy**.

## Testing the CSV Importer

A dirty data file `expenses_export.csv` is provided in the project root. Navigate to `/dashboard/import` in the app, select a group, and upload this file to see the anomaly resolution engine in action!
