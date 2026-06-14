# AI USAGE: AI Tools, Prompts, and Debugging

This project was built with the assistance of **Antigravity**, an advanced agentic coding AI designed by Google DeepMind. The AI acted as a pair programmer throughout the lifecycle of the project.

## Key Prompts Used

The AI was primarily directed using high-level goal-oriented prompts, allowing it to navigate the codebase and execute changes autonomously. Some of the core prompts included:

1. **Scaffolding:** "Initialize a Next.js 14 project with Tailwind, Prisma, and PostgreSQL. Set up the schema for a Splitwise clone (Users, Groups, Expenses, Splits, Settlements)."
2. **Feature Implementation:** "Build the 'Add Expense' modal. It needs to support 4 split types: Equal, Exact, Percentage, and Shares. Ensure it validates that percentages equal 100% and exact amounts sum up to the total."
3. **Algorithm Generation:** "Write a `calculateSimplifiedDebts` algorithm. It should take an array of Expenses and Settlements, calculate the net balance for each user, and use a greedy algorithm to match creditors to debtors to minimize the number of transactions."
4. **CSV Importer:** "Create an API route `/api/import` that parses a CSV using PapaParse. Implement an 'Anomaly Resolution Engine' that handles missing currencies, string amounts with commas, differing date formats, and automatically excludes users who left the group before the expense date."
5. **Code Polish:** "Go through the codebase and fix all possible bugs. Run `eslint`, fix all React state-in-effect warnings, remove all unescaped entities, and replace any usage of the `any` type with strict TypeScript interfaces."

## Instances Where the AI Erred & How It Was Caught/Fixed

While highly capable, the AI occasionally made mistakes that required human review and correction.

### 1. The React `useEffect` Infinite Loop Bug
**What happened:** When building the `AddExpenseModal`, the AI wrote a `useEffect` hook that updated the `includedUserIds` state whenever the `expenseDate` changed (to exclude users who weren't in the group at that time).
**How it was caught:** The Next.js compiler/linter immediately flagged a `react-hooks/exhaustive-deps` and `set-state-in-effect` warning, noting that setting state synchronously inside an effect can cause cascading re-renders and performance degradation.
**The Fix:** I instructed the AI to remove the `useEffect` entirely. Instead, we shifted the logic into the render phase by computing the `actualIncludedUserIds` intersection on the fly using `useMemo`. This cleanly resolved the linter error and improved modal performance.

### 2. The `any` Type Regex Replacement Mishap
**What happened:** During the final polish phase, I asked the AI to remove all `catch (err: any)` instances. The AI wrote a Node.js script using Regex (`.replace()`) to batch replace the strings across 11 files. However, the regex was slightly overly aggressive and accidentally renamed a Prisma model import from `ExpenseComment` to `Comment` in one of the API routes.
**How it was caught:** We ran `npm run lint` and the TypeScript compiler immediately caught the error: `Property 'comment' does not exist on type 'PrismaClient'`.
**The Fix:** We reviewed the Prisma schema, confirmed the model was indeed `ExpenseComment`, and manually targeted the `api/.../comments/route.ts` file to restore the correct model name.

### 3. Disguised Settlements Logic Flaw
**What happened:** When building the CSV anomaly engine, the AI was told to handle "Settlements disguised as expenses" (e.g. "Rahul paid Aisha back"). Initially, the AI just dropped these rows entirely to prevent double-charging.
**How it was caught:** During testing with the `complex_expenses.csv` file, I noticed that the group's "Simplified Debts" balances were completely wrong because the payback transactions were being erased rather than credited.
**The Fix:** I prompted the AI to rewrite the anomaly block. Instead of just skipping the row, the AI wrote logic to explicitly detect these rows, extract the payer and payee, and natively insert a `prisma.settlement.create` record into the database so the debt algorithm could correctly factor it in.
