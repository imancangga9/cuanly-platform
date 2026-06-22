import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/actions/profile"
import { getChannels } from "@/actions/channels"
import { SettingsClient } from "./client"

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [profile, channels] = await Promise.all([getProfile(), getChannels()])

  return (
    <SettingsClient
      profile={profile}
      channels={channels}
      userEmail={user?.email || ""}
      userFullName={user?.user_metadata?.full_name || ""}
    />
  )
}
