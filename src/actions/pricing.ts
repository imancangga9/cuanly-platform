"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getPricingSettings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("pricing_settings")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return data
}

export async function upsertPricingSettings(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.from("pricing_settings").upsert({
    user_id: user.id,
    margin_percent: Number(formData.get("margin_percent")),
    marketplace_fee: Number(formData.get("marketplace_fee")),
    extra_cost: Number(formData.get("extra_cost")),
  })

  if (error) return { error: error.message }
  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function calculatePrice(formData: FormData) {
  const costPrice = Number(formData.get("cost_price"))
  const margin = Number(formData.get("margin_percent"))
  const marketplaceFee = Number(formData.get("marketplace_fee"))
  const extraCost = Number(formData.get("extra_cost"))

  const basePrice = costPrice + extraCost
  const marginAmount = basePrice * (margin / 100)
  const priceBeforeFee = basePrice + marginAmount
  const feeAmount = priceBeforeFee * (marketplaceFee / 100)
  const finalPrice = priceBeforeFee + feeAmount

  return {
    basePrice: Math.round(basePrice),
    marginAmount: Math.round(marginAmount),
    feeAmount: Math.round(feeAmount),
    finalPrice: Math.round(finalPrice),
  }
}
