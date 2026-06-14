# BUILD_PLAN.md

## 1. Product Research
- **Splitwise Study:** We reviewed the core mechanics of Splitwise based on product understanding and real-world sample data (`expenses_export.csv`).
- **Core Workflows Identified:**
  - Authenticate -> View Dashboard (global balances)
  - Navigate to Group -> View group-specific balances & expense list
  - Add Expense -> Select Split Type (Equal, Exact, Percentage, Shares) -> Save
  - View Expense -> Chat with group members about the expense
  - Settle Up -> Record a payment to zero out a debt.
- **Assumptions Made:** We will assume a single currency for the MVP to reduce complexity and meet the 2-day deadline. Users must exist in the system to be added to a group (no "ghost" users without accounts).

## 2. Architecture
- **Tech Stack:** Next.js (App Router), Tailwind CSS, React, TypeScript.
- **Database Schema:** Relational model using Supabase (PostgreSQL) tracking Users, Groups, Expenses, Splits, Settlements, and Comments.
- **API Design:** Server Actions in Next.js will handle all mutations (creating expenses, groups, etc.).
- **Frontend Structure:** 
  - `/` -> Dashboard
  - `/groups/[id]` -> Group View
  - `/groups/[id]/expenses/new` -> Add Expense Form
  - `/expenses/[id]` -> Expense Detail & Chat
- **Deployment Approach:** Vercel for seamless Next.js hosting.

## 3. AI Collaboration Process
- The AI was instructed to act as a Senior Developer to guide the architecture.
- We analyzed the provided PDF and CSV to define the scope.
- We established `AI_CONTEXT.md` as the living source of truth.
- The plan evolved to focus heavily on algorithmic correctness (debt simplification and cent-precision storage) to ensure a strong interview performance.

## 4. Tradeoffs
- **Simplified Features:** No multi-currency support, no receipt scanning, no recurring expenses.
- **What is Hardcoded:** We might mock user authentication initially if Supabase setup takes too much time, but the goal is real auth.
- **Future Improvements (with more time):**
  - Implement full graph-based exact min-cost flow algorithm for debt simplification instead of the greedy heuristic.
  - Multi-currency support with exchange rate fetching.
  - Activity feed / audit logs for groups.
