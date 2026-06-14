# SCOPE.md — Anomaly Log & Database Schema

## Database Schema

### Users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| email | TEXT UNIQUE | |
| name | TEXT | |
| password_hash | TEXT | bcrypt hashed |
| created_at | TIMESTAMPTZ | |

### Groups
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| name | TEXT | |
| created_at | TIMESTAMPTZ | |

### GroupMembers
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| group_id | UUID (FK → Groups) | |
| user_id | UUID (FK → Users) | |
| joined_at | TIMESTAMPTZ | When the member joined |
| left_at | TIMESTAMPTZ NULL | NULL means still active |

> `left_at` is critical: Sam joined April 8. Expenses before that date do not involve Sam.
> Meera left end of March. April expenses cannot include Meera in splits.

### Expenses
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| group_id | UUID (FK → Groups) | |
| paid_by_user_id | UUID (FK → Users) | |
| description | TEXT | |
| amount_cents | INTEGER | All amounts stored as cents to avoid float precision bugs |
| currency | TEXT | 'INR' or 'USD' |
| original_amount | NUMERIC | Raw amount in original currency |
| original_currency | TEXT | The currency as it appeared in the source |
| inr_equivalent_cents | INTEGER | Converted value used for balance calculations |
| fx_rate | NUMERIC NULL | Rate used for conversion if currency != INR |
| expense_date | DATE | Parsed and normalised date |
| created_at | TIMESTAMPTZ | |
| import_row | INTEGER NULL | CSV row number, for traceability |

### ExpenseSplits
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| expense_id | UUID (FK → Expenses, CASCADE DELETE) | |
| user_id | UUID (FK → Users) | |
| amount_owed_cents | INTEGER | Final resolved amount in INR cents |
| split_type | TEXT | EQUAL, EXACT, PERCENTAGE, SHARE |
| split_value | NUMERIC NULL | The % or share count; null for EQUAL/EXACT |

### Settlements
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| payer_id | UUID (FK → Users) | Person paying off their debt |
| payee_id | UUID (FK → Users) | Person receiving the money |
| group_id | UUID NULL (FK → Groups) | Optional group context |
| amount_cents | INTEGER | |
| settlement_date | DATE | |
| created_at | TIMESTAMPTZ | |

### ExpenseComments
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| expense_id | UUID (FK → Expenses, CASCADE DELETE) | |
| user_id | UUID (FK → Users) | |
| content | TEXT | |
| created_at | TIMESTAMPTZ | |

### ImportSessions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| file_name | TEXT | |
| imported_at | TIMESTAMPTZ | |
| total_rows | INTEGER | |
| imported_rows | INTEGER | |
| skipped_rows | INTEGER | |
| anomaly_report | JSONB | Full structured anomaly list |

---

## CSV Anomaly Log (16 Deliberate Data Problems Found)

The file contains at least **16 deliberate data problems**. Below is each one with the detection logic and handling policy.

---

### #1 — EXACT DUPLICATE ENTRY
**Rows:** 5 & 6
**Problem:** Row 5 is "Dinner at Marina Bites" and Row 6 is "dinner - marina bites". Same date (2026-02-08), same payer (Dev), same amount (3200 INR), same split group.
**Detection:** Fuzzy match on (date, payer, amount, members). Description normalised to lowercase and stripped of punctuation before comparison.
**Policy:** Flag both rows. Surface to user with a side-by-side diff. User must approve which one to keep. Default: keep Row 5 (first occurrence), skip Row 6.

---

### #2 — SETTLEMENT LOGGED AS EXPENSE
**Row:** 14
**Problem:** "Rohan paid Aisha back" with split_type blank and notes saying "this is a settlement not an expense??". It is clearly a debt payment, not a shared expense.
**Detection:** Blank split_type AND split_with is a single person AND notes contain the word "settlement".
**Policy:** Automatically reclassify as a Settlement record (payer=Rohan, payee=Aisha, amount=5000). Flag in import report. Do NOT import as an Expense.

---

### #3 — INCONSISTENT DATE FORMATS (THREE FORMATS IN ONE FILE)
**Rows:** All rows
**Problem:** February uses `YYYY-MM-DD`, March uses `DD/MM/YYYY`, and Row 27 uses `Mar 14` (no year).
**Detection:** Attempt all three parsers in sequence. If none match, flag as unparseable.
**Policy:** Parse using the detected format. For `Mar 14` with no year, infer year from surrounding rows (2026). Flag all non-standard dates in the import report for user review.

---

### #4 — AMOUNT WITH COMMA
**Row:** 7
**Problem:** Electricity Feb amount is `"1,200"` — the comma is a thousands separator, not a decimal.
**Detection:** Amount field contains a comma and the field value passes the regex `/^\d{1,3}(,\d{3})*(\.\d+)?$/`.
**Policy:** Strip commas and parse as 1200. Log the transformation in the import report.

---

### #5 — MISSING CURRENCY
**Row:** 28
**Problem:** "Groceries DMart" on 15/03/2026 has no currency value. Notes say "forgot to set currency".
**Detection:** Currency field is empty or null after trim.
**Policy:** Flag. Default to INR (the primary currency for all non-Goa-trip domestic expenses). Note in import report that this assumption was made.

---

### #6 — MULTI-CURRENCY (USD vs INR)
**Rows:** 20, 21, 23, 26
**Problem:** Goa trip expenses (villa, lunch, parasailing, refund) are in USD. The original spreadsheet treats USD=INR which is wrong (Priya's explicit complaint).
**Detection:** Currency column = "USD".
**Policy:** Store both original USD amount and the INR equivalent. At import time, prompt the user to confirm the USD→INR exchange rate for the trip (default: ₹83/USD based on March 2026 approximate rate). The FX rate is stored on the expense for full auditability.

---

### #7 — WHITESPACE IN AMOUNT
**Row:** 29
**Problem:** Electricity Mar amount is `" 1450 "` — leading and trailing spaces.
**Detection:** `amount.trim() !== amount`
**Policy:** Trim whitespace before parsing. Log the transformation silently.

---

### #8 — ZERO AMOUNT EXPENSE
**Row:** 31
**Problem:** "Dinner order Swiggy" has amount=0 and notes say "counted twice earlier - fixing later". This is a placeholder/correction marker, not a real expense.
**Detection:** Parsed amount === 0.
**Policy:** Skip the row entirely. Flag in the import report with the note explaining why it was skipped.

---

### #9 — NEGATIVE AMOUNT (REFUND)
**Row:** 26
**Problem:** "Parasailing refund" = -30 USD. This is a legitimate refund, not an error.
**Detection:** Parsed amount < 0.
**Policy:** Import as a valid expense with negative amount. In the balance engine, negative amounts reduce what people owe. Flag in the import report as "Refund — negative splits applied."

---

### #10 — PERCENTAGES DO NOT SUM TO 100%
**Row:** 15
**Problem:** "Pizza Friday" split percentages: Aisha 30% + Rohan 30% + Priya 30% + Meera 20% = **110%**, not 100%.
**Detection:** Sum of all percentage values in split_details != 100.
**Policy:** Flag. Do NOT silently normalise (that would change financial outcomes). Surface to user showing the sum and ask: (a) correct manually, or (b) normalise proportionally. Default: skip the row and log as "Anomaly — percentages sum to 110%, requires manual correction."

---

### #11 — INCONSISTENT MEMBER NAME SPELLINGS
**Rows:** 9, 11, 27
**Problem:** "priya" (lowercase, Row 9), "Priya S" (surname added, Row 11), "rohan " (trailing space, Row 27).
**Detection:** After normalising (lowercase + trim), the name doesn't exactly match a known member but has a Levenshtein distance of ≤ 2 from a known member.
**Policy:** Fuzzy-match to the closest known member. Log every substitution in the import report. "Priya S" → "Priya", "priya" → "Priya", "rohan " → "Rohan".

---

### #12 — MEMBER INCLUDED IN SPLIT AFTER MOVING OUT
**Row:** 36
**Problem:** April 2 Grocery expense includes "Meera" in the split group. But Meera moved out at end of March (her farewell dinner is Row 33 dated 28/03/2026). Her `left_at` in the DB will be 2026-03-31.
**Detection:** For any expense, check if any member in `split_with` has a `left_at` date before the expense date.
**Policy:** Automatically remove Meera from the split. Redistribute her share equally among the remaining active members. Flag in import report: "Meera removed from split — she was no longer a member on this date."

---

### #13 — DUPLICATE DINNER WITH DIFFERENT AMOUNTS
**Rows:** 24 & 25
**Problem:** "Dinner at Thalassa" (Aisha, ₹2400) and "Thalassa dinner" (Rohan, ₹2450) on the same date for the same group. Row 25 notes say "Aisha also logged this I think hers is wrong."
**Detection:** Fuzzy description match + same date + overlapping split members. Amounts differ.
**Policy:** Flag both rows. Present them side-by-side to the user. The user must pick one. The note on Row 25 explicitly suggests Row 25 is the correct one. Default: keep Row 25 (₹2450, paid by Rohan), skip Row 24. Log in report.

---

### #14 — AMBIGUOUS DATE (DD/MM vs MM/DD)
**Row:** 34
**Problem:** "04/05/2026" — is this April 5 or May 4? The inline note says "format is a mess."
**Detection:** Any date matching DD/MM/YYYY where day ≤ 12 AND month ≤ 12 is ambiguous.
**Policy:** Flag for explicit user confirmation. Cannot be auto-resolved. Import paused for this row until user selects the correct interpretation. Default assumption: DD/MM/YYYY (consistent with all other March dates), so this is **May 4, 2026**. But user must confirm.

---

### #15 — NON-MEMBER IN SPLIT
**Row:** 23
**Problem:** "Dev's friend Kabir" appears in the split_with for Parasailing. Kabir is not a registered member of the flat or the group.
**Detection:** After fuzzy name matching, the name has no match in the known member list.
**Policy:** Flag. Offer three options: (a) Create a new user account for Kabir, (b) Exclude Kabir and redistribute his share among the others, (c) Mark Kabir's share as "external" (no IOU tracked). Default: redistribute Kabir's equal share (1/5 of ₹150 USD) among the four known members and log in report.

---

### #16 — CONFLICTING SPLIT_TYPE AND SPLIT_DETAILS
**Row:** 42
**Problem:** "Furniture for common room" has `split_type=equal` but `split_details="Aisha 1; Rohan 1; Priya 1; Sam 1"` — those are share values, not equal amounts.
**Detection:** split_type = "equal" but split_details is non-empty with numeric values.
**Policy:** split_details take precedence. Reclassify as split_type = "share" since the share values happen to be equal (1 each). Flag in report: "split_type overridden from 'equal' to 'share' based on split_details."

---

### #17 — DEPOSIT/TRANSFER LOGGED AS EXPENSE
**Row:** 38
**Problem:** "Sam deposit share" — Sam paid ₹15,000 to Aisha as a security deposit. This is a financial transfer between two individuals, not a shared group expense.
**Detection:** split_with is a single person (Aisha) and the description contains "deposit."
**Policy:** Reclassify as a Settlement record (payer=Sam, payee=Aisha). Flag in import report. Do NOT create an Expense record.
