"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

// ------------------------------
// Get Global Settings
// ------------------------------
export async function getGlobalSettings() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Cek apakah admin/superadmin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile || !["admin", "super_admin"].includes(profile.role)) {
    return null;
  }

  const { data, error } = await supabase
    .from("global_settings")
    .select("*")
    .order("key");

  if (error) {
    console.error("Error fetching global settings:", error);
    return null;
  }

  // Convert array to object for easier use
  const settings = data?.reduce((acc, item) => {
    acc[item.key] = item;
    return acc;
  }, {} as Record<string, any>);

  return settings;
}

// ------------------------------
// Get Single Global Setting by Key
// ------------------------------
export async function getGlobalSettingByKey(key: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("global_settings")
    .select("*")
    .eq("key", key)
    .single();

  if (error) {
    console.error(`Error fetching global setting '${key}':`, error);
    return null;
  }

  return data;
}

// ------------------------------
// Update Global Setting
// ------------------------------
export async function updateGlobalSetting(key: string, value: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Cek apakah admin/superadmin
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile || !["admin", "super_admin"].includes(profile.role)) {
    return { error: "Unauthorized" };
  }

  // Cek apakah setting sudah ada
  const { data: existing, error: checkError } = await supabase
    .from("global_settings")
    .select("id")
    .eq("key", key)
    .single();

  let error;
  
  if (existing) {
    // Update existing
    const result = await supabase
      .from("global_settings")
      .update({
        value,
        updated_at: new Date().toISOString()
      })
      .eq("key", key);
    error = result.error;
  } else {
    // Insert new
    const result = await supabase
      .from("global_settings")
      .insert({
        key,
        value,
        description: key === "default_custom_prompt" ? "Default custom prompt untuk user baru" : undefined
      });
    error = result.error;
  }

  if (error) {
    console.error("Error updating global setting:", error);
    return { error: error.message };
  }

  revalidatePath("/dashboard/admin");
  return { success: true };
}
