"use server"

import { revalidatePath } from "next/cache"
import { createClient, createServiceRoleClient } from "@/lib/supabase/server"

// Get setup status
export async function getSetupStatus() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("setup_completed, current_setup_step, setup_completed_at")
    .eq("user_id", user.id)
    .maybeSingle()

  return profile
}

// Update setup progress
export async function updateSetupProgress(step: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("profiles")
    .update({ current_setup_step: step })
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  
  revalidatePath("/siapkan-toko")
  revalidatePath("/dashboard")
  return { success: true }
}

// Complete setup
export async function completeSetup() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("profiles")
    .update({ 
      setup_completed: true, 
      setup_completed_at: new Date().toISOString() 
    })
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  
  revalidatePath("/siapkan-toko")
  revalidatePath("/dashboard")
  return { success: true }
}

// Reset setup (untuk development)
export async function resetSetup() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("profiles")
    .update({ 
      setup_completed: false, 
      current_setup_step: 1,
      setup_completed_at: null 
    })
    .eq("user_id", user.id)

  if (error) return { error: error.message }
  
  revalidatePath("/siapkan-toko")
  revalidatePath("/dashboard")
  return { success: true }
}
