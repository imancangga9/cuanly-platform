"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function getTransactions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("transactions")
    .select("*, products(name, cost_price), product_channel_prices(channel_name), transaction_deductions(*), transaction_costs(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return data || []
}

export async function createTransactionWithDetails(
  productId: string | null,
  channelPriceId: string | null,
  channelName: string | null,
  qty: number,
  sellingPrice: number,
  deductions: { title: string; amount: number }[],
  costs: { title: string; amount: number }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // First insert transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      product_id: productId || null,
      channel_price_id: channelPriceId || null,
      qty,
      selling_price: sellingPrice,
    })
    .select()
    .single()

  if (transactionError) return { error: transactionError.message }

  // Now insert deductions
  if (deductions.length > 0) {
    const { error: deductionError } = await supabase.from("transaction_deductions").insert(
      deductions.map(d => ({
        transaction_id: transaction.id,
        title: d.title,
        amount: d.amount
      }))
    )
    if (deductionError) return { error: deductionError.message }
  }

  // Now insert costs
  if (costs.length > 0) {
    const { error: costError } = await supabase.from("transaction_costs").insert(
      costs.map(c => ({
        transaction_id: transaction.id,
        title: c.title,
        amount: c.amount
      }))
    )
    if (costError) return { error: costError.message }
  }

  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard")
  return { success: true, transaction }
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("transactions").delete().eq("id", id)
  if (!error) {
    revalidatePath("/dashboard/transactions")
    revalidatePath("/dashboard")
  }
  return { error: error?.message }
}
