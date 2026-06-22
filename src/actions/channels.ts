"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type Factor = {
  id: string
  channel_id: string
  label: string
  operation: "multiply" | "add"
  value_type: "percentage" | "fixed"
  value: number
  sort_order: number
}

export type Channel = {
  id: string
  user_id: string
  name: string
  factors: Factor[]
  created_at: string
}

export async function getChannels() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: channels } = await supabase
    .from("channels")
    .select("*, factors:channel_factors(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  return (channels || []) as unknown as Channel[]
}

export async function createChannel(_prevState: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.from("channels").insert({
    user_id: user.id,
    name: formData.get("name") as string,
  })

  if (error) return { error: error.message }
  revalidatePath("/dashboard/settings")
  revalidatePath("/dashboard/transactions")
  return { success: true }
}

export async function deleteChannel(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("channels").delete().eq("id", id)
  if (!error) {
    revalidatePath("/dashboard/settings")
    revalidatePath("/dashboard/transactions")
  }
  return { error: error?.message }
}

export async function addFactor(_prevState: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient()
  const channelId = formData.get("channel_id") as string

  const { error } = await supabase.from("channel_factors").insert({
    channel_id: channelId,
    label: formData.get("label") as string,
    operation: formData.get("operation") as string,
    value_type: formData.get("value_type") as string,
    value: Number(formData.get("value")),
    sort_order: Number(formData.get("sort_order")),
  })

  if (error) return { error: error.message }
  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateFactor(_prevState: { error?: string } | undefined, formData: FormData) {
  const supabase = await createClient()
  const id = formData.get("id") as string

  const { error } = await supabase.from("channel_factors").update({
    label: formData.get("label") as string,
    operation: formData.get("operation") as string,
    value_type: formData.get("value_type") as string,
    value: Number(formData.get("value")),
    sort_order: Number(formData.get("sort_order")),
  }).eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function deleteFactor(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("channel_factors").delete().eq("id", id)
  if (!error) revalidatePath("/dashboard/settings")
  return { error: error?.message }
}

export async function calculateChannelPrice(channelId: string, costPrice: number) {
  const supabase = await createClient()
  const { data: channel } = await supabase
    .from("channels")
    .select("*, factors:channel_factors(*)")
    .eq("id", channelId)
    .single()

  if (!channel) return null

  const factors = (channel.factors || []).sort((a: Factor, b: Factor) => a.sort_order - b.sort_order)

  let price = costPrice

  for (const factor of factors) {
    if (factor.operation === "multiply" && factor.value_type === "percentage") {
      price = price * (1 + factor.value / 100)
    } else if (factor.operation === "multiply" && factor.value_type === "fixed") {
      price = price * factor.value
    } else if (factor.operation === "add" && factor.value_type === "percentage") {
      price = price + (price * factor.value / 100)
    } else if (factor.operation === "add" && factor.value_type === "fixed") {
      price = price + factor.value
    }
  }

  return {
    channelName: channel.name,
    factors: factors.map((f: Factor) => ({
      label: f.label,
      operation: f.operation,
      value_type: f.value_type,
      value: f.value,
      amount: f.operation === "multiply" && f.value_type === "percentage"
        ? costPrice * (f.value / 100)
        : f.operation === "multiply" && f.value_type === "fixed"
          ? costPrice * f.value - costPrice
          : f.operation === "add" && f.value_type === "percentage"
            ? costPrice * (f.value / 100)
            : f.value
    })),
    finalPrice: Math.round(price),
  }
}
