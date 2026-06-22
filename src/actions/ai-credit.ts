"use server";

import { revalidatePath } from "next/cache";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

// ------------------------------
// Admin Check Action
// ------------------------------
export async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  return profile?.role === "admin" || profile?.role === "super_admin";
}

// ------------------------------
// AI Credit Packages Actions
// ------------------------------
export async function getAICreditPackages() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_credit_packages")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });

  if (error) {
    console.error("Error fetching AI credit packages:", error);
    return [];
  }

  return data || [];
}

// ------------------------------
// AI Wallet Actions
// ------------------------------
export async function getAIWallet() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  let { data, error } = await supabase
    .from("ai_wallet")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code === "PGRST116") {
    // Create wallet if not exists
    const { data: newWallet, error: insertError } = await supabase
      .from("ai_wallet")
      .insert({ user_id: user.id, balance: 25 })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating AI wallet:", insertError);
      return null;
    }
    return newWallet;
  }

  if (error) {
    console.error("Error fetching AI wallet:", error);
    return null;
  }

  return data;
}

export async function checkAICredit(): Promise<boolean> {
  const wallet = await getAIWallet();
  return wallet ? wallet.balance > 0 : false;
}

// ------------------------------
// AI Credit Order Actions
// ------------------------------
function generateOrderNumber(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(2, 10).replace(/-/g, "");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `CU${dateStr}${random}`;
}

function generateUniqueCode(): number {
  return Math.floor(Math.random() * 200) + 1;
}

export async function createAICreditOrder(packageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Get package
  const { data: pkg, error: pkgError } = await supabase
    .from("ai_credit_packages")
    .select("*")
    .eq("id", packageId)
    .single();

  if (pkgError || !pkg) {
    console.error("Error fetching package:", pkgError);
    console.error("Package ID:", packageId);
    return { error: "Package not found" };
  }
  console.log("Package found:", pkg);

  const uniqueCode = generateUniqueCode();
  const totalPayment = pkg.price - uniqueCode;
  const orderNumber = generateOrderNumber();

  // Create order with expires_at (24 hours from now)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const { data: order, error: orderError } = await supabase
    .from("ai_credit_orders")
    .insert({
      order_number: orderNumber,
      user_id: user.id,
      package_id: pkg.id,
      package_name: pkg.name,
      package_price: pkg.price,
      credit_amount: pkg.credit_amount,
      unique_code: uniqueCode,
      total_payment: totalPayment,
      status: "pending",
      expires_at: expiresAt
    })
    .select()
    .single();

  if (orderError) {
    console.error("Error creating order:", orderError);
    console.error("Order error details:", JSON.stringify(orderError, null, 2));
    return { error: "Failed to create order: " + orderError.message };
  }

  revalidatePath("/dashboard/ai-credit");
  revalidatePath("/dashboard/admin/ai-credit-orders");
  revalidatePath("/dashboard/admin");
  return { success: true, order };
}

export async function getAICreditOrders() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("ai_credit_orders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    return [];
  }

  return data || [];
}

export async function getAICreditOrderById(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("ai_credit_orders")
    .select("*")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching order:", error);
    return null;
  }

  return data;
}

export async function uploadPaymentProof(orderId: string, proofImageUrl: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("ai_credit_orders")
    .update({ proof_image_url: proofImageUrl })
    .eq("id", orderId)
    .eq("user_id", user.id);

  if (error) {
    console.error("Error uploading proof:", error);
    return { error: "Failed to upload proof" };
  }

  revalidatePath("/dashboard/ai-credit");
  return { success: true };
}

// Upload file image to Supabase Storage
export async function uploadPaymentProofFile(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const file = formData.get("file") as File;

  if (!orderId || !file) {
    return { error: "Order ID and file are required" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  // Upload file to Supabase Storage
  const fileName = `${user.id}/${Date.now()}-${file.name}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("payment_proofs")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (uploadError) {
    console.error("Error uploading file:", uploadError);
    return { error: "Failed to upload file" };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("payment_proofs")
    .getPublicUrl(fileName);

  // Update order with proof URL and set payment_status to waiting_verify
  const { error: updateError } = await supabase
    .from("ai_credit_orders")
    .update({ 
      proof_image_url: publicUrl,
      payment_status: "waiting_verify",
      status: "waiting_verify" // Also update main status for consistency
    })
    .eq("id", orderId)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Error updating order:", updateError);
    return { error: "Failed to update order" };
  }

  // Send notification to admin
  try {
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-payment-notification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
  } catch (emailError) {
    console.error("Error sending payment notification:", emailError);
    // Don't fail the upload if email fails
  }

  // Create notification for user
  try {
    await supabase.from("notifications").insert({
      user_id: user.id,
      type: "payment_submitted",
      title: "Bukti Pembayaran Dikirim",
      message: "Bukti pembayaran Anda telah berhasil dikirim dan sedang menunggu verifikasi admin.",
      data: { order_id: orderId }
    });
  } catch (notifError) {
    console.error("Error creating user notification:", notifError);
  }

  revalidatePath("/dashboard/ai-credit");
  revalidatePath("/dashboard/admin/ai-credit-orders");
  revalidatePath("/dashboard/admin");
  return { success: true };
}

// ------------------------------
// AI Credit Transactions Actions
// ------------------------------
export async function getAICreditTransactions() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("ai_credit_transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }

  return data || [];
}

// ------------------------------
// Use Credit Action
// ------------------------------
export async function useAICredit() {
  console.log("=== useAICredit called ===");
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    console.log("useAICredit: Unauthorized - no user");
    return { error: "Unauthorized" };
  }
  
  console.log("useAICredit: User found:", user.id);

  // Try with regular client first (works if RLS allows)
  let dbClient = supabase;
  let clientType = "regular";
  
  // Use service role client only if available
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    dbClient = createServiceRoleClient();
    clientType = "service role";
  }
  console.log("useAICredit: Using client type:", clientType);

  // Get current wallet
  console.log("useAICredit: Fetching wallet...");
  const { data: wallet, error: walletError } = await dbClient
    .from("ai_wallet")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (walletError || !wallet) {
    console.error("useAICredit: Wallet error:", walletError);
    return { error: "Wallet not found" };
  }
  
  console.log("useAICredit: Wallet found, balance:", wallet.balance);

  if (wallet.balance <= 0) {
    console.log("useAICredit: Insufficient credit");
    return { error: "Insufficient AI credit" };
  }

  // Update wallet
  console.log("useAICredit: Updating wallet...");
  const { error: updateError } = await dbClient
    .from("ai_wallet")
    .update({ balance: wallet.balance - 1, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (updateError) {
    console.error("useAICredit: Error updating wallet:", updateError);
    return { error: "Failed to use credit" };
  }
  
  console.log("useAICredit: Wallet updated successfully!");

  // Create transaction record
  console.log("useAICredit: Creating transaction...");
  const { error: txError } = await dbClient
    .from("ai_credit_transactions")
    .insert({
      user_id: user.id,
      type: "usage",
      amount: -1,
      description: "AI Response Generation"
    });

  if (txError) {
    console.error("useAICredit: Error creating transaction:", txError);
  } else {
    console.log("useAICredit: Transaction created successfully!");
  }

  console.log("useAICredit: Revalidating paths...");
  revalidatePath("/dashboard/ai");
  revalidatePath("/dashboard/ai-credit");
  
  console.log("useAICredit: Done successfully!");
  return { success: true };
}

// ------------------------------
// Admin Actions
// ------------------------------
export async function getAllAICreditOrders(adminOnly = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const supabaseAdmin = createServiceRoleClient();

  // Check admin role
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
    return [];
  }

  // Get all orders (simple, no join)
  const { data: orders, error: ordersError } = await supabaseAdmin
    .from("ai_credit_orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error fetching all orders:", ordersError);
    return [];
  }

  // Get all auth users for email
  const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    console.error("Error fetching auth users for orders:", authError);
  }

  // Combine orders with email
  const ordersWithEmail = orders?.map(order => {
    const authUser = authUsers?.find(u => u.id === order.user_id);
    return {
      ...order,
      email: authUser?.email || "-",
    };
  });

  return ordersWithEmail || [];
}

export async function approveAICreditOrder(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const supabaseAdmin = createServiceRoleClient();

  // Check admin role
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { error: "Not authorized" };
  }

  // Get order
  const { data: order, error: orderError } = await supabaseAdmin
    .from("ai_credit_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return { error: "Order not found" };
  }

  if (!['pending', 'waiting_verify'].includes(order.status)) {
    return { error: "Order already processed" };
  }

  // Update order status
  const { error: updateOrderError } = await supabaseAdmin
    .from("ai_credit_orders")
    .update({ 
      status: "approved", 
      payment_status: "verified",
      approved_at: new Date().toISOString() 
    })
    .eq("id", orderId);

  if (updateOrderError) {
    console.error("Error updating order:", updateOrderError);
    return { error: "Failed to approve order" };
  }

  // Get user's wallet
  const { data: wallet, error: walletError } = await supabaseAdmin
    .from("ai_wallet")
    .select("*")
    .eq("user_id", order.user_id)
    .single();

  if (walletError || !wallet) {
    return { error: "Wallet not found" };
  }

  // Add credit to wallet
  const { error: updateWalletError } = await supabaseAdmin
    .from("ai_wallet")
    .update({ 
      balance: wallet.balance + order.credit_amount,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", order.user_id);

  if (updateWalletError) {
    console.error("Error updating wallet:", updateWalletError);
    return { error: "Failed to update wallet" };
  }

  // Create transaction
  const { error: txError } = await supabaseAdmin
    .from("ai_credit_transactions")
    .insert({
      user_id: order.user_id,
      type: "topup",
      amount: order.credit_amount,
      description: `Topup ${order.package_name} Package`,
      order_id: order.id
    });

  if (txError) {
    console.error("Error creating transaction:", txError);
  }

  // Create notification for user
  try {
    await supabaseAdmin.from("notifications").insert({
      user_id: order.user_id,
      type: "payment_approved",
      title: "Pembayaran Diverifikasi",
      message: `Pembayaran untuk pesanan ${order.order_number} telah diverifikasi! ${order.credit_amount} AI Credit telah ditambahkan ke akun Anda.`,
      data: { order_id: orderId }
    });
  } catch (notifError) {
    console.error("Error creating user notification:", notifError);
  }

  revalidatePath("/dashboard/admin/ai-credit-orders");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/ai-credit");
  return { success: true };
}

export async function rejectAICreditOrder(orderId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const supabaseAdmin = createServiceRoleClient();

  // Check admin role
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { error: "Not authorized" };
  }

  // Get order first
  const { data: order } = await supabaseAdmin
    .from("ai_credit_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  const { error } = await supabaseAdmin
    .from("ai_credit_orders")
    .update({ 
      status: "rejected", 
      payment_status: "rejected",
      rejected_at: new Date().toISOString() 
    })
    .eq("id", orderId);

  if (error) {
    console.error("Error rejecting order:", error);
    return { error: "Failed to reject order" };
  }

  // Create notification for user
  if (order) {
    try {
      await supabaseAdmin.from("notifications").insert({
        user_id: order.user_id,
        type: "payment_rejected",
        title: "Pembayaran Ditolak",
        message: `Maaf, pembayaran untuk pesanan ${order.order_number} tidak dapat diverifikasi. Silakan hubungi admin untuk informasi lebih lanjut.`,
        data: { order_id: orderId }
      });
    } catch (notifError) {
      console.error("Error creating user notification:", notifError);
    }
  }

  revalidatePath("/dashboard/admin/ai-credit-orders");
  revalidatePath("/dashboard/admin");
  revalidatePath("/dashboard/ai-credit");
  return { success: true };
}

// ============================================
// User Management Actions
// ============================================
export async function getTotalUsers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const supabaseAdmin = createServiceRoleClient();

  // Check admin role
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
    return 0;
  }

  // Count users from auth (admin only)
  const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (authError) {
    console.error("Error counting users:", authError);
    return 0;
  }
  
  return users.length;
}

export async function getAllUsers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const supabaseAdmin = createServiceRoleClient();

  // Check admin role
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
    return [];
  }

  // Get profiles and wallets separately
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (profilesError) {
    console.error("Error fetching users:", profilesError);
    return [];
  }

  // Get wallets
  const userIds = profiles?.map(p => p.user_id) || [];
  const { data: wallets, error: walletsError } = await supabaseAdmin
    .from("ai_wallet")
    .select("*")
    .in("user_id", userIds);

  if (walletsError) {
    console.error("Error fetching wallets:", walletsError);
  }

  // Get auth users for email and user metadata
  const { data: { users: authUsers }, error: authError } = await supabaseAdmin.auth.admin.listUsers();

  if (authError) {
    console.error("Error fetching auth users:", authError);
  }

  // Combine all data
  const profilesWithWallets = profiles?.map(profile => {
    const wallet = wallets?.find(w => w.user_id === profile.user_id);
    const authUser = authUsers?.find(u => u.id === profile.user_id);
    
    return {
      ...profile,
      email: authUser?.email || profile.email || null,
      full_name: authUser?.user_metadata?.full_name || null,
      ai_wallet: wallet ? [{ balance: wallet.balance }] : []
    };
  });

  return profilesWithWallets || [];
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const supabaseAdmin = createServiceRoleClient();

  // Check admin role
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
    return { error: "Not authorized" };
  }

  // Update role
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: newRole })
    .eq("user_id", userId);

  if (error) {
    console.error("Error updating role:", error);
    return { error: "Failed to update role" };
  }

  revalidatePath("/dashboard/admin/users");
  return { success: true };
}
