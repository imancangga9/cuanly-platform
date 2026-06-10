"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function getTransactions() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("transactions")
    .select("*, products(name)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return data || []
}

export async function createTransaction(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const productId = formData.get("product_id") as string
  const qty = Number(formData.get("qty"))
  const sellingPrice = Number(formData.get("selling_price"))
  const revenue = qty * sellingPrice

  let profit = 0
  if (productId) {
    const { data: product } = await supabase
      .from("products")
      .select("cost_price")
      .eq("id", productId)
      .single()

    if (product) {
      profit = revenue - (qty * Number(product.cost_price))
    }
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    product_id: productId || null,
    qty,
    selling_price: sellingPrice,
    revenue,
    profit,
    channel: formData.get("channel") as string,
  })

  if (error) return { error: error.message }
  revalidatePath("/dashboard/transactions")
  revalidatePath("/dashboard")
  return { success: true }
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
