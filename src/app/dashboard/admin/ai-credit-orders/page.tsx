import { getAllAICreditOrders } from "@/actions/ai-credit";
import { AdminAICreditOrdersClient } from "./client";

export default async function AdminAICreditOrdersPage() {
  const orders = await getAllAICreditOrders();

  return <AdminAICreditOrdersClient orders={orders} />;
}
