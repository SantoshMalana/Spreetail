# SCOPE: Anomaly Log & Database Schema

## Anomaly Detection & Resolution Log

Our CSV importer (`src/app/api/import/route.ts`) actively looks for and sanitizes the following anomalies found in the provided spreadsheet:

1. **Blank Amounts or Missing Descriptions**
   - **Problem:** Data rows occasionally missed a total amount or description.
   - **Resolution:** The engine skips the row rather than creating an invalid 0-amount expense.

2. **Malformed Numeric Values**
   - **Problem:** Amounts were stored as strings with commas (e.g., `"1,200"`) or had high-precision weird floats (e.g., `899.995`).
   - **Resolution:** Sanitized using string replacement (`.replace(/,/g, '')`) and rounded to integer cents (`Math.round(val * 100)`) for strict integer arithmetic in the database to prevent floating point drift.

3. **Inconsistent Date Formats**
   - **Problem:** Dates were supplied as `"15-Feb"`, `"01/03/2026"`, `"Mar 14"`.
   - **Resolution:** Used regex to normalize `DD/MM/YYYY` to `MM/DD/YYYY` which JavaScript handles gracefully. Invalid dates default to `new Date()`.

4. **Missing or Inconsistent Currency**
   - **Problem:** Rows had blank currency values, or mismatched cases (`" usd "`, `"inr"`).
   - **Resolution:** Stripped whitespace, converted to uppercase, and defaulted any missing value to `"INR"`. Provided a mocked exchange rate (`USD = 83.0`) to convert foreign currency into an `inrEquivalentCents` base.

5. **Settlements Disguised as Expenses**
   - **Problem:** The CSV logged a payment (e.g., "Rahul paid Aisha back") as a standard expense, which would double-charge someone.
   - **Resolution:** The engine detects when `split_type` is blank, `split_with` is a single user, and the description contains words like "paid" or "deposit". It aborts the Expense creation and instead natively creates a `Settlement` record in the database.

6. **Users Joining / Leaving Mid-Trip**
   - **Problem:** "Meera left the trip in March" but appeared on April bills. "Sam joined in April" but appeared on February bills.
   - **Resolution:** The engine filters the `split_with` list based on the month of the `expenseDate`. It strictly drops Meera from any expense occurring after March, and drops Sam from any expense occurring before April, recalculating the split dynamically among the remaining users.

7. **Mismatched Split Type (Claimed EQUAL, but provided SHARES)**
   - **Problem:** The type was declared as `EQUAL`, but the details column provided exact shares (`"Rahul 2; Aisha 1"`).
   - **Resolution:** The engine overrides the split type to `SHARE` and respects the detailed values.

8. **Percentages Exceeding 100%**
   - **Problem:** A percentage split mathematically summed to 110%.
   - **Resolution:** The engine sums the total percentages provided and calculates a normalized percentage (`pct / totalPct`) to ensure it perfectly equates to 100% of the bill, eliminating infinite loops or overdrafts.

---

## Database Schema Design (Prisma)

The application uses an extremely robust integer-based accounting system stored in PostgreSQL.

### 1. `User` Model
Stores authentication and basic profile info.
- `id` (UUID), `name`, `email`, `passwordHash`, `avatarUrl`

### 2. `Group` & `GroupMember` Models
Manages many-to-many relationships.
- **Group:** `id` (UUID), `name`, `description`
- **GroupMember:** Connects `Group` and `User`. Tracks `joinedAt` and `leftAt` dates to handle the edge cases of users entering or leaving a group midway through its lifecycle.

### 3. `Expense` & `ExpenseSplit` Models
The core accounting engine. 
- **Expense:** Represents a physical bill paid. Stores `amountCents` (original), `currency`, `fxRate` (exchange rate at time of purchase), and `inrEquivalentCents` (the normalized accounting value). It also contains the `paidById`.
- **ExpenseSplit:** Defines exactly how the `Expense` is divided. Contains the final computed `amountOwedCents` (which strictly sums up to `Expense.inrEquivalentCents`). Retains the original `splitType` (EQUAL, PERCENTAGE, etc.) and `splitValue` for auditing.

### 4. `Settlement` Model
Records when a user pays back their debt.
- Contains `payerId`, `payeeId`, `amountCents`. These are factored directly into the `calculateSimplifiedDebts` algorithm.

### 5. `ExpenseComment` Model
Enables real-time chat on individual expenses.
- Tied to `expenseId` and `userId`.
