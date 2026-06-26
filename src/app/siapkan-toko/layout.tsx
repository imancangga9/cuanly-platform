import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSetupStatus } from "@/actions/setup"

export default async function SetupLayout({
  children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const setupStatus = await getSetupStatus()
  
  // Jika setup sudah selesai, redirect ke dashboard
  if (setupStatus?.setup_completed) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
