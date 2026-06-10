import { getExpenses } from "@/actions/expenses"
import { ExpensesClient } from "./client"

export default async function ExpensesPage() {
  const expenses = await getExpenses()
  return <ExpensesClient expenses={expenses} />
}
