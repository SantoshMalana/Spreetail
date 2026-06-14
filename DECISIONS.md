# DECISIONS: Architectural & Implementation Choices

This document outlines the significant technical and product decisions made during the development of this Splitwise clone.

## 1. Using Integer Cents over Floats for Financial Data
**Options Considered:**
- Float (`DECIMAL` or `FLOAT` in SQL)
- Integer representing cents (`Int` in Prisma)

**Decision:** Integer (Cents).
**Why:** Floating-point math in JavaScript can lead to precision loss (e.g., `0.1 + 0.2 = 0.30000000000000004`), which is catastrophic in a financial app. We store everything in `amountCents` (e.g., $10.00 is stored as 1000). All math and splitting is done safely on integers, with any remaining modulo drift strictly assigned to users deterministically (alphabetically) to ensure total splits exactly match the bill.

## 2. Server Components vs. Client Components (Next.js App Router)
**Options Considered:**
- Build everything as Client Components (`'use client'`).
- Build everything as Server Components, relying heavily on Server Actions.
- Hybrid Approach (Server-first, Client leaves).

**Decision:** Hybrid Approach.
**Why:** We leaned heavily into React Server Components (RSC) to fetch database records securely and efficiently. We only used Client Components (`'use client'`) at the deepest possible level (e.g., `AddExpenseModal.tsx`, `ExpenseChat.tsx`) where user interaction, local state, or live form handling was required. This keeps our JavaScript bundle extremely small and our app blazing fast.

## 3. Database Choice & ORM
**Options Considered:**
- MongoDB (NoSQL) with Mongoose.
- PostgreSQL (SQL) with Prisma.

**Decision:** PostgreSQL with Prisma.
**Why:** A financial splitting app is highly relational. A `Group` has many `Members`, an `Expense` has many `Splits`, and `Settlements` link two users together. A relational SQL database guarantees referential integrity. Prisma was chosen for its best-in-class TypeScript safety, allowing us to catch data-shape errors at compile time rather than runtime.

## 4. Debt Simplification Algorithm
**Options Considered:**
- Basic Ledger: Just sum up who owes who for every single transaction (results in $A \rightarrow B, B \rightarrow C, C \rightarrow A$).
- Graph-based Simplification: Calculate net balances per user, split into "creditors" and "debtors", and greedily match them.

**Decision:** Graph-based Net Balance Simplification.
**Why:** The standard Splitwise feature is "Simplify Debts". We implemented a greedy matching algorithm that calculates the net positive/negative balance for every user in the group. We then continuously pay off the largest debtor with the largest creditor. This mathematically guarantees the absolute minimum number of transactions required to settle the group.

## 5. Handling Multi-Currency in the Database
**Options Considered:**
- Store raw amounts, require the UI to convert on the fly.
- Store everything in a single base currency only.
- Store original amount + original currency + FX Rate + normalized base currency.

**Decision:** Store original amount + FX Rate + normalized base currency (`inrEquivalentCents`).
**Why:** Users want to see the original receipt value (e.g., "Dinner in Paris: 50 EUR"). However, the algorithm needs a single normalized currency to calculate net debts. By locking the FX rate at the time the expense is created, we preserve the historical context while allowing the simplification algorithm to run perfectly on a unified base currency (INR).

## 6. The "Any" Type Eradication
**Options Considered:**
- Use `any` in `catch` blocks and CSV parsers to save time.
- Enforce strict typing via `eslint` (`@typescript-eslint/no-explicit-any`).

**Decision:** Strict TypeScript enforcement (0 `any` types).
**Why:** Relying on `any` leads to runtime crashes that are difficult to debug, especially when parsing unpredictable CSV files. We enforced strict interfaces (`Record<string, string>`) for CSV rows and strict error boundaries (`err instanceof Error`) in catch blocks. This significantly raised the stability of the application.
