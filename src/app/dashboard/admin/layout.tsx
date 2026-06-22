"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

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

  // TODO: Check if user is admin - for now, let's just check a flag or let all access
  // Later, add proper admin role check

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
