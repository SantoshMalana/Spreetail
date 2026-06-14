# Splitwise Clone (Spreetail Assignment)

A fully functional, responsive, and robust Splitwise clone built with Next.js 14, Tailwind CSS, Prisma, and PostgreSQL.

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-github-repo-url>
   cd splitwise-clone
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root directory and add your database connection string and NextAuth secret.
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<dbname>"
   # Optional: For JWT Auth
   JWT_SECRET="your_secure_random_string_here"
   ```

4. **Database Setup:**
   Run the Prisma migrations to set up the database schema.
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Application Locally:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`.

## Features
- **User Authentication:** Secure JWT-based login and registration.
- **Group Management:** Create groups, invite members, and delete empty groups.
- **Expense Tracking:** Add expenses with detailed categorization (emojis).
- **Smart Debt Simplification:** Algorithm to minimize the total number of transactions needed to settle up.
- **Complex Splits:** Support for splitting equally, by exact amounts, percentages, or shares.
- **CSV Import & Export:** Bulk import expenses from a CSV file with an advanced anomaly detection engine. Export group expenses to a CSV file.
- **Real-time Chat:** Comment on individual expenses to discuss discrepancies.

## AI Used
This project was developed with the assistance of an advanced AI Coding Assistant (Antigravity/Gemini) for scaffolding components, setting up the Prisma schema, building the debt simplification algorithm, and generating the complex anomaly resolution logic for CSV imports. See `AI_USAGE.md` for complete details.
