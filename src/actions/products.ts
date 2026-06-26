"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function getProducts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from("products")
    .select("*, savedPrices:product_channel_prices(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return data || []
}

export async function createProduct(_prevStateOrFormData: { error?: string; success?: boolean } | undefined | FormData, formDataParam?: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const formData = _prevStateOrFormData instanceof FormData ? _prevStateOrFormData : formDataParam
  if (!formData) return { error: "Form data is required" }

  let photoUrl: string | null = null
  const photoFile = formData.get("photo") as File | null

  if (photoFile && photoFile.size > 0) {
    // Upload to Supabase Storage
    const fileExt = photoFile.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

    const { error: uploadError, data } = await supabase.storage
      .from("product-photos")
      .upload(fileName, photoFile)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: "Gagal mengunggah foto: " + uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("product-photos")
      .getPublicUrl(fileName)

    photoUrl = publicUrl
  }

  const { data, error } = await supabase.from("products").insert({
    user_id: user.id,
    name: formData.get("name") as string,
    sku: (formData.get("sku") as string) || null,
    category: (formData.get("category") as string) || null,
    description: (formData.get("description") as string) || null,
    photo_url: photoUrl,
    cost_price: Number(formData.get("cost_price")),
    stock: Number(formData.get("stock")) || 0,
  }).select().single()

  if (error) return { error: error.message }
  revalidatePath("/dashboard/products")
  return { success: true, data }
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Get product to find photo URL
  const { data: product } = await supabase
    .from("products")
    .select("photo_url")
    .eq("id", id)
    .single()

  // Delete from storage first if photo exists
  if (product?.photo_url) {
    const bucketName = "product-photos"
    const urlParts = product.photo_url.split("/")
    const fileName = urlParts.slice(-2).join("/") // user-id/filename.ext

    await supabase.storage.from(bucketName).remove([fileName])
  }

  const { error } = await supabase.from("products").delete().eq("id", id)
  if (!error) revalidatePath("/dashboard/products")
  return { error: error?.message }
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  // Get current product
  const { data: currentProduct } = await supabase
    .from("products")
    .select("photo_url")
    .eq("id", productId)
    .single()

  let photoUrl: string | null = currentProduct?.photo_url || null
  const photoFile = formData.get("photo") as File | null

  // Handle new photo upload
  if (photoFile && photoFile.size > 0) {
    // Delete old photo if exists
    if (currentProduct?.photo_url) {
      const bucketName = "product-photos"
      const urlParts = currentProduct.photo_url.split("/")
      const fileName = urlParts.slice(-2).join("/")
      await supabase.storage.from(bucketName).remove([fileName])
    }

    // Upload new photo
    const fileExt = photoFile.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("product-photos")
      .upload(fileName, photoFile)

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return { error: "Gagal mengunggah foto: " + uploadError.message }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("product-photos")
      .getPublicUrl(fileName)

    photoUrl = publicUrl
  }

  // Update product in database
  const { error } = await supabase.from("products").update({
    name: formData.get("name") as string,
    sku: formData.get("sku") as string || null,
    category: formData.get("category") as string || null,
    description: formData.get("description") as string || null,
    photo_url: photoUrl,
    cost_price: Number(formData.get("cost_price")),
    stock: Number(formData.get("stock")),
  }).eq("id", productId)

  if (error) return { error: error.message }
  revalidatePath("/dashboard/products")
  return { success: true }
}
