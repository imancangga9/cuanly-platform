import { getProfile } from "@/actions/profile"
import { getPricingSettings } from "@/actions/pricing"
import { SettingsClient } from "./client"

export default async function SettingsPage() {
  const [profile, pricing] = await Promise.all([getProfile(), getPricingSettings()])
  return <SettingsClient profile={profile} pricing={pricing} />
}
