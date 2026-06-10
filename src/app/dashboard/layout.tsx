import { createClient } from "@/lib/supabase/server"
import { DashboardLayout } from "@/components/dashboard-layout"
import { redirect } from "next/navigation"

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("store_name")
    .eq("user_id", user.id)
    .single()

  return (
    <DashboardLayout
      userName={user.user_metadata?.full_name}
      storeName={profile?.store_name}
    >
      {children}
    </DashboardLayout>
  )
}
