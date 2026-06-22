import { getAllUsers } from "@/actions/ai-credit";
import { UsersClient } from "./client";

export default async function AdminUsersPage() {
  const users = await getAllUsers();
  return <UsersClient users={users} />;
}
