# AI_USAGE.md — AI Tool Usage Log

## AI Tool Used
**Tool:** Antigravity (Google DeepMind AI coding assistant)
**Model:** Gemini / Claude (senior developer mode)
**Role:** Primary development collaborator — architecture, code generation, debugging

---

## How the AI Was Used

The AI was used as a **senior developer collaborator**. The developer (me) acted as the engineering lead responsible for:
- Approving or rejecting every architectural decision
- Reviewing and understanding every line of generated code
- Catching errors and directing corrections
- Making all final product decisions

The AI was directed to:
- Analyze the CSV and identify all data anomalies
- Propose a database schema for a time-aware expense splitting system
- Generate the Next.js/Prisma boilerplate and configuration
- Write the CSV import logic and anomaly detection engine
- Build the balance calculation algorithms

---

## Key Prompts

### Prompt 1: Initial Analysis
> "go to downloads and go through these two things Internship Assignment-1, expenses_export.csv"

This started the project. The AI read the CSV and identified the first set of anomalies but initially missed the time-based membership requirement (Sam moving in April, Meera leaving March).

### Prompt 2: Replan After Full Assignment Read
> "Assignment: Build a Shared Expenses App [full brief pasted]"

This was the critical replan prompt. After reading the full brief, the AI completely overhauled the plan, identified 17 anomalies (exceeding the stated "at least 12"), and restructured the architecture to include temporal membership and a two-phase CSV import.

### Prompt 3: Database Schema Design
> "ok lets start with very basic and fundamental things"

The AI initialized the Next.js project, created the Prisma schema, and pushed the tables to Supabase.

---

## Three Cases Where the AI Got It Wrong

### Case 1: Missing `left_at` on GroupMember

**What the AI did:** In the initial Prisma schema, the `GroupMember` model only had `joined_at` — there was no `left_at` column.

**Why it was wrong:** Without `left_at`, the system cannot tell who was a member at any given point in time. Sam's complaint ("Why would March electricity affect my balance?") would be impossible to answer correctly. Meera would still appear in April splits.

**What I caught:** I re-read the full CSV and noticed Meera's farewell dinner on 28/03/2026 and Sam's first appearance on 08/04/2026. The system needed to know that Meera left and Sam joined at specific dates.

**What I changed:** Added `left_at DateTime?` to the `GroupMember` model and updated the balance engine query to filter members by `joined_at <= expenseDate AND (left_at IS NULL OR left_at >= expenseDate)`.

---

### Case 2: Treating the Thalassa Duplicate as a Format Error

**What the AI did:** In the initial anomaly analysis, the AI grouped the Thalassa duplicate (Rows 24 & 25) with format/normalisation errors because the descriptions were slightly different.

**Why it was wrong:** This is not a formatting problem — it is a financial duplicate where two people logged the same dinner with different amounts. It requires a business decision (which one wins?), not string normalisation.

**What I caught:** Looking at Row 25's note: "Aisha also logged this I think hers is wrong." This is a data conflict requiring user approval, not a technical fix.

**What I changed:** Reclassified this as a "data conflict" anomaly category in the import UI, separate from "format errors," with a side-by-side comparison and explicit user approval flow.

---

### Case 3: Using the Transaction Pooler URL for Prisma Migrations

**What the AI did:** Initially configured Prisma to use `DATABASE_URL` (the transaction-mode pooler at port 6543) for `prisma db push`.

**Why it was wrong:** Supabase's transaction-mode pooler does not support prepared statements, which Prisma migrations require. The command failed with `P1001: Can't reach database server`.

**What I caught:** The error message was explicit. After checking Supabase documentation, the `DIRECT_URL` (session mode, port 5432) must be used for migrations.

**What I changed:** Updated `prisma.config.ts` to use `DIRECT_URL` for the datasource, and left `DATABASE_URL` (pooler) for the runtime `PrismaClient` connection in the application code.
