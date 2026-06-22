"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createTransactionV2(data: {
  channel: string,
  invoiceNumber?: string,
  items: Array<{
    productId?: string,
    productName: string,
    qty: number,
    sellingPrice: number,
    hppPrice: number
  }>,
  adjustments: Array<{
    title: string,
    amount: number
  }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Calculate subtotal, total deduction, total hpp, etc.
  let subtotal = 0
  let totalDeduction = 0
  let totalHpp = 0

  for (const item of data.items) {
    const itemSubtotal = item.qty * item.sellingPrice
    const itemTotalHpp = item.qty * item.hppPrice
    subtotal += itemSubtotal
    totalHpp += itemTotalHpp
  }

  for (const adj of data.adjustments) {
    totalDeduction += adj.amount
  }

  const grossProfit = subtotal - totalDeduction
  const netProfit = grossProfit - totalHpp

  // 1. Insert transaction header
  const { data: transaction, error: txError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      invoice_number: data.invoiceNumber || `TRX-${Date.now()}`,
      channel: data.channel,
      subtotal,
      total_deduction: totalDeduction,
      gross_profit: grossProfit,
      total_hpp: totalHpp,
      net_profit: netProfit
    })
    .select()
    .single()

  if (txError) {
    console.error("Error inserting transaction:", txError)
    return { error: txError.message }
  }

  // 2. Insert transaction items
  for (const item of data.items) {
    const itemSubtotal = item.qty * item.sellingPrice
    const itemTotalHpp = item.qty * item.hppPrice
    const itemProfit = itemSubtotal - itemTotalHpp

    const { error: itemError } = await supabase
      .from("transaction_items")
      .insert({
        transaction_id: transaction.id,
        product_id: item.productId,
        product_name_snapshot: item.productName,
        qty: item.qty,
        selling_price: item.sellingPrice,
        subtotal: itemSubtotal,
        hpp_price: item.hppPrice,
        total_hpp: itemTotalHpp,
        profit: itemProfit
      })

    if (itemError) {
      console.error("Error inserting transaction item:", itemError)
      return { error: itemError.message }
    }
  }

  // 3. Insert transaction adjustments
  for (const adj of data.adjustments) {
    const { error: adjError } = await supabase
      .from("transaction_adjustments")
      .insert({
        transaction_id: transaction.id,
        title: adj.title,
        type: "deduction",
        amount: adj.amount
      })

    if (adjError) {
      console.error("Error inserting adjustment:", adjError)
      return { error: adjError.message }
    }
  }

  revalidatePath("/dashboard/transactions")
  return { success: true }
}

export async function getTransactionsV2() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      id,
      invoice_number,
      channel,
      transaction_date,
      subtotal,
      total_deduction,
      gross_profit,
      total_hpp,
      net_profit,
      created_at,
      transaction_items(*, products(photo_url)),
      transaction_adjustments(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return transactions || []
}
