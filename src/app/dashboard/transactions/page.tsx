import { getTransactions } from "@/actions/transactions"
import { getProducts } from "@/actions/products"
import { TransactionsClient } from "./client"

export default async function TransactionsPage() {
  const [transactions, products] = await Promise.all([getTransactions(), getProducts()])
  return <TransactionsClient transactions={transactions} products={products} />
}
