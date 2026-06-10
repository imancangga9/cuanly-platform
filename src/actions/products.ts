"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function getProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return data || []
}

export async function createProduct(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.from("products").insert({
    user_id: user.id,
    name: formData.get("name") as string,
    sku: formData.get("sku") as string,
    category: formData.get("category") as string,
    cost_price: Number(formData.get("cost_price")),
    stock: Number(formData.get("stock")),
  })

  if (error) return { error: error.message }
  revalidatePath("/dashboard/products")
  return { success: true }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("products").delete().eq("id", id)
  if (!error) revalidatePath("/dashboard/products")
  return { error: error?.message }
}
