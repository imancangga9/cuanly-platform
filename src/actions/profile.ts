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
    .single()

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

  const { error } = await supabase.from("profiles").upsert({
    user_id: user.id,
    store_name: formData.get("store_name") as string,
  })

  if (error) return { error: error.message }
  revalidatePath("/dashboard/settings")
  return { success: true }
}
