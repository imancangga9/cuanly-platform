"use server";

import { getGlobalSettings } from "@/actions/global-settings";
import { SettingsClient } from "./client";

export default async function AdminSettingsPage() {
  const settings = await getGlobalSettings();
  return <SettingsClient settings={settings} />;
}
