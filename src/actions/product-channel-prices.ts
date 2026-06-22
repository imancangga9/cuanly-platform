"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getProductChannelPrices(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("product_channel_prices")
    .select("*")
    .eq("product_id", productId)
    .eq("user_id", user.id);

  return data || [];
}

export async function upsertProductChannelPrices(
  productId: string,
  prices: { channelName: string; recommendedPrice: number; sellingPrice: number }[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  console.log("Attempting to save prices:", prices, "for product:", productId, "user:", user.id);

  const { data, error } = await supabase.from("product_channel_prices").upsert(
    prices.map(p => ({
      user_id: user.id,
      product_id: productId,
      channel_name: p.channelName,
      recommended_price: p.recommendedPrice,
      selling_price: p.sellingPrice,
      updated_at: new Date().toISOString()
    })),
    { onConflict: "user_id, product_id, channel_name" }
  ).select();

  console.log("Upsert result:", data, "error:", error);

  if (error) return { error: error.message };
  revalidatePath("/dashboard/products");
  return { success: true };
}
