# DECISIONS.md — Engineering & Product Decision Log

Every significant decision, the options considered, and why we chose what we chose.

---

## 1. Tech Stack Selection

**Decision:** Next.js (App Router) + Supabase (PostgreSQL) + Prisma ORM

**Options Considered:**
- A: Express.js REST API + React frontend + PostgreSQL → More control, more boilerplate
- B: Next.js + Supabase + Prisma → Unified codebase, managed DB, built-in real-time
- C: Firebase → NoSQL, violates the "relational DBs only" constraint

**Why B:** The assignment explicitly requires a relational database. Supabase gives us managed PostgreSQL, authentication, and real-time subscriptions. Prisma gives us type-safe schema management. Next.js collapses the frontend/backend boundary so we can move faster. This stack lets two developers ship a working product in 2 days.

---

## 2. Monetary Precision: Store as Integer Cents

**Decision:** All monetary amounts stored as integers representing the smallest currency unit (paise for INR, cents for USD).

**Options Considered:**
- A: Store as NUMERIC/DECIMAL in PostgreSQL
- B: Store as FLOAT → Rejected immediately (0.1 + 0.2 ≠ 0.3 in floating point)
- C: Store as INTEGER (cents/paise) → Chosen

**Why C:** JavaScript's native number type is a 64-bit float. Operations like `3200 / 3 = 1066.666...` cause rounding inconsistencies. By storing as integers and only converting to display values at the UI layer, we eliminate floating-point drift entirely. All financial arithmetic is integer arithmetic.

**Rounding Rule:** When splitting equally, divide total and floor it. Remainder cents (e.g., 1 paise) go to the first person in alphabetical order. This is deterministic and auditable.

---

## 3. Multi-Currency Handling

**Decision:** Store both original currency/amount AND a converted INR equivalent. Let the user confirm the exchange rate at import time.

**Options Considered:**
- A: Refuse to import USD expenses → Breaks Priya's explicit requirement
- B: Assume 1 USD = 1 INR → This is exactly the bug Priya complained about
- C: Auto-fetch live exchange rate from an API → Rate at time of trip differs from today's rate
- D: Prompt user to enter the USD→INR rate at import time, store it per-expense → Chosen

**Why D:** The trip was in March 2026. The exchange rate then (≈₹83/USD) matters, not today's rate. We store the FX rate alongside each expense so any future audit can reconstruct exactly how the conversion was done. This is the honest, transparent approach.

---

## 4. Time-Based Group Membership

**Decision:** `GroupMember` table has both `joined_at` and `left_at` columns. Expense splits respect membership at the time of the expense date.

**Options Considered:**
- A: No membership history — just current members
- B: Soft-delete with `deleted_at`
- C: Explicit `joined_at` and `left_at` columns → Chosen

**Why C:** Sam's complaint is explicit — "I moved in mid-April. Why would March electricity affect my balance?" Without temporal membership, we cannot answer this question correctly. The split engine checks: for any expense on date D, only include members where `joined_at <= D AND (left_at IS NULL OR left_at >= D)`.

---

## 5. CSV Import Strategy: Detect, Surface, Don't Guess

**Decision:** The importer runs in two phases. Phase 1: parse and detect ALL anomalies, surface them grouped by type. Phase 2: import only after user reviews and approves each resolution.

**Options Considered:**
- A: Auto-fix silently → "A silent guess is a failing answer" (from assignment brief)
- B: Crash on first error → "A crashed import is a failing answer" (from assignment brief)
- C: Two-phase: parse → review → import → Chosen

**Why C:** The assignment brief explicitly says both A and B are failing answers. Our importer must detect AND surface. We chose a review UI where anomalies are presented in categories (duplicates, format errors, missing data, etc.) with a proposed resolution and an "Accept / Override" toggle per row.

---

## 6. Debt Simplification Algorithm

**Decision:** Greedy net-balance algorithm.

**Options Considered:**
- A: Store raw debts (A owes B, B owes C) and show them all → Violates Aisha's requirement: "one number per person"
- B: Exact minimum-transaction algorithm (NP-Hard) → Computationally intractable for large groups
- C: Greedy: calculate net balance per person, match largest creditor to largest debtor → Chosen

**Why C:** The greedy approach is the industry standard (used by Splitwise). It does not always produce the absolute minimum number of transactions, but it always produces the minimum total money flow, and runs in O(N log N). Rohan's requirement ("I want to see which expenses make that up") is met separately by a drill-down view, not by the simplified debt summary.

---

## 7. Percentage Splits That Don't Sum to 100%

**Decision:** Do not silently normalise. Block the row and require user intervention.

**Options Considered:**
- A: Normalise proportionally → Changes the actual amounts paid. Financially incorrect without consent.
- B: Block and require user correction → Chosen
- C: Skip silently → Loses data

**Why B:** Normalising 110% to 100% means every person's share gets recalculated without their knowledge. That is a silent financial modification. We block the row, show the user exactly what the sum is, and require them to either correct the percentages or explicitly approve normalisation.

---

## 8. Duplicate Expense Detection

**Decision:** Fuzzy match on (date, payer, amount, members). Not exact string match on description.

**Options Considered:**
- A: Exact match on description → Would miss "Dinner at Marina Bites" vs "dinner - marina bites"
- B: Fuzzy description match only → Too many false positives
- C: Combination: same date + same payer + same amount + overlapping members + fuzzy description → Chosen

**Why C:** The duplicate in the CSV has different capitalisation and punctuation but identical financial data. The combination check reduces false positives (many legitimate expenses have the same amount) while catching true duplicates.

---

## 9. Non-Members in Split (Kabir)

**Decision:** Default to redistributing the non-member's share equally among known members. Flag in import report.

**Options Considered:**
- A: Create a new user for Kabir → He has no account and no ongoing relationship with the group
- B: Skip the expense entirely → Kabir participated; ignoring him loses money
- C: Write off Kabir's share (treat as absorbed by Dev) → Arbitrary
- D: Redistribute Kabir's share among known members → Chosen

**Why D:** Kabir joined for one day. Creating an account for him adds permanent system complexity for a one-time guest. Redistributing his share means the four primary members absorb his cost, which is the most pragmatic outcome. This is fully documented in the import report.

---

## 10. Thalassa Duplicate (Two People Logged Different Amounts)

**Decision:** Default to keeping the higher-amount row (Row 25, ₹2450 by Rohan). Require user to confirm.

**Options Considered:**
- A: Average the two amounts → Financially meaningless
- B: Take the first row → The note on Row 25 says Row 25 is probably correct
- C: Take the higher amount and flag for user confirmation → Chosen

**Why C:** Row 25's note explicitly says "Aisha also logged this I think hers is wrong." This is a clear signal that the second entry (₹2450) is intended to be the correct one. We take the higher-confidence entry but surface it for user confirmation — we never make financial decisions without consent.
