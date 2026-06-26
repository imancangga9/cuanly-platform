"use server";

import { redirect } from "next/navigation";
import { createClient, createServiceRoleClient } from "@/lib/supabase/server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  try {
    const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? createServiceRoleClient() 
      : null;

    if (supabaseAdmin) {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
        redirect("/dashboard");
      }
    } else {
      // Fallback: Try with regular client if service role not available
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (profileError || !profile || !['admin', 'super_admin'].includes(profile.role)) {
        redirect("/dashboard");
      }
    }
  } catch (error) {
    console.error("Error checking admin role:", error);
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background px-4 sm:px-6">
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Admin Panel</h1>
          </div>
        </header>
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
