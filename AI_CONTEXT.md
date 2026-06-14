# AI_CONTEXT.md

## Project Definition
This is a cloned implementation of Splitwise built as an internship assignment. The goal is to deploy a simplified version focusing on core functionality within 2 days. 

## Product Understanding
Splitwise is a tool to track shared expenses and balances among friends or roommates. The core value proposition is "who owes whom" simplified to the lowest number of transactions.

## Product Scope
**In Scope (MVP):**
- User Authentication (Email/Password)
- Create and manage groups (add/remove users)
- Add expenses to groups with 4 split types: Equal, Unequal (exact amounts), Percentage, and Shares.
- Real-time chat on specific expenses.
- Balance Engine: Calculate group balances and global balances.
- Settlement: Ability to record a payment from one user to another.

**Out of Scope:**
- Multi-currency support (assume all expenses are in a single base currency, e.g., INR or USD).
- Receipt scanning / OCR.
- Complex nested groups.
- Recurring expenses.

## Implementation Decisions & Tech Stack
- **Framework**: Next.js (App Router) for unified full-stack development.
- **Styling**: Tailwind CSS & shadcn/ui for rapid, clean design.
- **Database & Auth & Real-time**: Supabase (PostgreSQL). Chosen for speed of implementation and built-in real-time subscriptions for the chat feature.
- **ORM**: Prisma for type-safe database queries and migrations.

## Database Schema (Draft)
- `User`: `id`, `email`, `name`, `created_at`
- `Group`: `id`, `name`, `created_at`
- `GroupMember`: `group_id`, `user_id`, `joined_at`
- `Expense`: `id`, `group_id`, `paid_by_user_id`, `description`, `amount_cents`, `created_at`
- `ExpenseSplit`: `id`, `expense_id`, `user_id`, `amount_owed_cents`, `split_type`, `split_value`
- `Settlement`: `id`, `payer_id`, `payee_id`, `group_id`, `amount_cents`, `created_at`
- `ExpenseComment`: `id`, `expense_id`, `user_id`, `content`, `created_at`

## Engineering Requirements
1. **Precision**: All financial amounts must be stored as integers (cents) in the database to avoid floating-point errors.
2. **Algorithm**: Implementing a Greedy Debt Simplification algorithm is critical for the balance engine.
3. **Rounding**: When splitting amounts (especially percentages and equal splits), remainder cents must be distributed predictably so the sum of splits equals the exact total expense.

## Prompts and AI Responses
- **Initial Discussion:** User provided PDF requirements and a sample CSV. AI identified data quality issues in CSV (inconsistent dates, missing currencies) and proposed a Next.js + Supabase architecture.
- **Deep Dive:** AI led a technical breakdown on how to solve the "Debt Simplification" problem using a greedy algorithm and how to handle floating-point precision errors by storing amounts in cents.

## Changes Made During Implementation
*(To be updated as development progresses)*

## Known Limitations
- MVP will not support multiple currencies despite the CSV having mixed currencies (INR/USD). We will assume a single base currency for now to meet the 2-day deadline.
