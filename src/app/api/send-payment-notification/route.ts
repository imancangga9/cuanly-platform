import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createServiceRoleClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const supabaseAdmin = createServiceRoleClient();

    // Get order details
    const { data: order, error: orderError } = await supabaseAdmin
      .from("ai_credit_orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get user email
    const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(order.user_id);

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", order.user_id)
      .single();

    // Get admin emails (users with role admin or super_admin)
    const { data: adminProfiles } = await supabaseAdmin
      .from("profiles")
      .select("user_id")
      .in("role", ["admin", "super_admin"]);

    const adminEmails: string[] = [];
    if (adminProfiles && adminProfiles.length > 0) {
      for (const adminProfile of adminProfiles) {
        const { data: { user: adminUser } } = await supabaseAdmin.auth.admin.getUserById(adminProfile.user_id);
        if (adminUser?.email) {
          adminEmails.push(adminUser.email);
        }
      }
    }

    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }).format(amount);
    };

    const adminDashboardUrl = process.env.NEXT_PUBLIC_APP_URL 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin/ai-credit-orders`
      : "https://your-app-url.com/dashboard/admin/ai-credit-orders";

    // Build email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #0fdc78 0%, #06b6d4 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          .order-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; }
          .btn { display: inline-block; background: #0fdc78; color: #0a0b0f; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px; }
          .proof-image { max-width: 100%; border-radius: 8px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📥 Bukti Pembayaran Baru</h1>
            <p>Ada pembayaran baru yang perlu diverifikasi!</p>
          </div>
          <div class="content">
            <p>Halo Admin,</p>
            <p>Pengguna baru saja mengunggah bukti pembayaran untuk pesanan AI Credit. Berikut detailnya:</p>
            
            <div class="order-details">
              <div class="detail-row">
                <span class="detail-label">Nomor Pesanan:</span>
                <span>${order.order_number}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Nama Pelanggan:</span>
                <span>${profile?.store_name || user.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span>${user.email}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Paket:</span>
                <span>${order.package_name}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Total Pembayaran:</span>
                <span style="color: #0fdc78; font-weight: bold;">${formatCurrency(order.total_payment)}</span>
              </div>
            </div>
            
            ${order.proof_image_url ? `
              <p><strong>Bukti Pembayaran:</strong></p>
              <img src="${order.proof_image_url}" alt="Bukti Pembayaran" class="proof-image" />
            ` : ''}
            
            <p style="text-align: center;">
              <a href="${adminDashboardUrl}" class="btn">Lihat di Dashboard Admin</a>
            </p>
            
            <p style="margin-top: 20px; font-size: 12px; color: #666;">
              Email ini dikirim otomatis oleh sistem Cuanly. Jangan balas email ini.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (adminEmails.length > 0) {
      const { data, error } = await resend.emails.send({
        from: "Cuanly <onboarding@resend.dev>",
        to: adminEmails,
        subject: `[Pembayaran Baru] Pesanan ${order.order_number}`,
        html: emailHtml,
      });

      if (error) {
        console.error("Error sending email:", error);
        return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
      }

      console.log("Email sent successfully:", data);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Notification sent successfully",
      adminEmails,
      orderDetails: {
        orderNumber: order.order_number,
        customerName: profile?.store_name || user.email,
        totalPayment: order.total_payment,
        proofUrl: order.proof_image_url
      }
    });

  } catch (error) {
    console.error("Error in payment notification API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
