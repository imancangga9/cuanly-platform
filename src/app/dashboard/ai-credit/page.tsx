import { getAICreditPackages, getAIWallet, getAICreditOrders, getAICreditTransactions } from "@/actions/ai-credit";
import { AICreditClient } from "./client";

export default async function AICreditPage() {
  const [packages, wallet, orders, transactions] = await Promise.all([
    getAICreditPackages(),
    getAIWallet(),
    getAICreditOrders(),
    getAICreditTransactions()
  ]);

  return (
    <AICreditClient
      packages={packages}
      wallet={wallet}
      orders={orders}
      transactions={transactions}
    />
  );
}
