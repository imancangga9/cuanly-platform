"use client";

import { useState } from "react";
import { Settings, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { updateGlobalSetting } from "@/actions/global-settings";

interface GlobalSettings {
  [key: string]: {
    id: string;
    key: string;
    value: string;
    description?: string;
    created_at: string;
    updated_at: string;
  };
}

export function SettingsClient({
  settings,
}: {
  settings: GlobalSettings | null;
}) {
  const [defaultCustomPrompt, setDefaultCustomPrompt] = useState(
    settings?.default_custom_prompt?.value || ""
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSavePrompt = async () => {
    setIsSaving(true);
    try {
      const result = await updateGlobalSetting(
        "default_custom_prompt",
        defaultCustomPrompt
      );
      if (result.error) {
        alert(result.error);
        return;
      }
      alert("Pengaturan berhasil disimpan!");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan pengaturan!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="h-8 w-8 text-[#0fdc78]" />
        <h1 className="text-2xl font-bold">Pengaturan Global</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Default Custom Prompt AI</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Prompt ini akan menjadi default untuk semua user baru yang mendaftar
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Masukkan default custom prompt..."
              value={defaultCustomPrompt}
              onChange={(e) => setDefaultCustomPrompt(e.target.value)}
              rows={10}
            />
          </div>

          <Button
            onClick={handleSavePrompt}
            disabled={isSaving}
            className="bg-[#0fdc78] hover:bg-[#0cd66a] text-black"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Menyimpan..." : "Simpan Pengaturan"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
