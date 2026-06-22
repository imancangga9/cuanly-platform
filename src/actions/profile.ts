"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!profile) {
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({ user_id: user.id })
      .select()
      .single()

    return newProfile
  }

  return profile
}

export async function updateProfile(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const storeName = formData.get("store_name") as string

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ store_name: storeName })
    .eq("user_id", user.id)

  if (updateError) {
    if (updateError.code === "PGRST116") {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ user_id: user.id, store_name: storeName })

      if (insertError) return { error: insertError.message }
    } else {
      return { error: updateError.message }
    }
  }

  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function uploadLogo(_prevState: { error?: string; success?: boolean; url?: string } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const file = formData.get("logo") as File
  if (!file) return { error: "No file provided" }

  const fileExt = file.name.split(".").pop()
  const filePath = `${user.id}/logo.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("logos")
    .upload(filePath, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: { publicUrl } } = supabase.storage
    .from("logos")
    .getPublicUrl(filePath)

  const { error: dbError } = await supabase
    .from("profiles")
    .update({ logo: publicUrl })
    .eq("user_id", user.id)

  if (dbError) return { error: dbError.message }

  revalidatePath("/dashboard/settings")
  return { success: true, url: publicUrl }
}

export async function updateAccountName(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const fullName = formData.get("full_name") as string

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  })

  if (error) return { error: error.message }
  revalidatePath("/dashboard/settings")
  return { success: true }
}

export async function updateAccountEmail(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const email = formData.get("email") as string

  const { error } = await supabase.auth.updateUser({ email })

  if (error) return { error: error.message }
  return { success: true }
}

export async function resetPassword() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase.auth.resetPasswordForEmail(user.email!)

  if (error) return { error: error.message }
  return { success: true }
}

export async function updatePassword(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const password = formData.get("password") as string

  const { error } = await supabase.auth.updateUser({ password })

  if (error) return { error: error.message }
  return { success: true }
}
