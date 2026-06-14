interface Split {
  userId: string
  amountOwedCents: number
}

interface Expense {
  paidById: string
  inrEquivalentCents: number
  splits: Split[]
}

interface Settlement {
  payerId: string
  payeeId: string
  amountCents: number
}

export interface SimplifiedDebt {
  fromUserId: string
  toUserId: string
  amountCents: number
}

export function calculateSimplifiedDebts(expenses: Expense[], settlements: Settlement[]): SimplifiedDebt[] {
  const balances: Record<string, number> = {}

  // 1. Calculate net balances from expenses
  for (const expense of expenses) {
    // Payer is owed money (positive)
    balances[expense.paidById] = (balances[expense.paidById] || 0) + expense.inrEquivalentCents

    // Anyone involved in split owes money (negative)
    for (const split of expense.splits) {
      balances[split.userId] = (balances[split.userId] || 0) - split.amountOwedCents
    }
  }

  // 2. Adjust balances from settlements
  for (const settlement of settlements) {
    // Payer paid their debt, so their balance goes up (closer to 0)
    balances[settlement.payerId] = (balances[settlement.payerId] || 0) + settlement.amountCents
    // Payee received money, so their balance goes down (closer to 0)
    balances[settlement.payeeId] = (balances[settlement.payeeId] || 0) - settlement.amountCents
  }

  // 3. Separate into debtors and creditors
  const debtors: { userId: string; amount: number }[] = []
  const creditors: { userId: string; amount: number }[] = []

  for (const [userId, balance] of Object.entries(balances)) {
    if (balance < -1) { // -1 to account for 1 cent rounding drift
      debtors.push({ userId, amount: Math.abs(balance) })
    } else if (balance > 1) {
      creditors.push({ userId, amount: balance })
    }
  }

  // Sort: biggest debtors first, biggest creditors first
  debtors.sort((a, b) => b.amount - a.amount)
  creditors.sort((a, b) => b.amount - a.amount)

  // 4. Greedy match
  const simplifiedDebts: SimplifiedDebt[] = []
  let d = 0
  let c = 0

  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d]
    const creditor = creditors[c]

    const amount = Math.min(debtor.amount, creditor.amount)
    
    // Ignore floating point tiny drifts under a cent
    if (amount >= 1) {
      simplifiedDebts.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amountCents: amount
      })
    }

    debtor.amount -= amount
    creditor.amount -= amount

    // Move to next if settled
    if (Math.abs(debtor.amount) < 1) d++
    if (Math.abs(creditor.amount) < 1) c++
  }

  return simplifiedDebts
}
