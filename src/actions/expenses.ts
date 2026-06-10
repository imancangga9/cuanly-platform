"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function getExpenses() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  return data || []
}

export async function createExpense(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    name: formData.get("name") as string,
    category: formData.get("category") as string,
    amount: Number(formData.get("amount")),
    date: formData.get("date") as string,
  })

  if (error) return { error: error.message }
  revalidatePath("/dashboard/expenses")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteExpense(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("expenses").delete().eq("id", id)
  if (!error) {
    revalidatePath("/dashboard/expenses")
    revalidatePath("/dashboard")
  }
  return { error: error?.message }
}
