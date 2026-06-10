"use client"

import { useActionState, useState } from "react"
import { updateProfile } from "@/actions/profile"
import { upsertPricingSettings, calculatePrice } from "@/actions/pricing"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, Store, Settings2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Profile {
  store_name: string | null
}

interface Pricing {
  margin_percent: number
  marketplace_fee: number
  extra_cost: number
}

export function SettingsClient({
  profile,
  pricing,
}: {
  profile: Profile | null
  pricing: Pricing | null
}) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, undefined)
  const [pricingState, pricingAction, pricingPending] = useActionState(upsertPricingSettings, undefined)

  const [calcResult, setCalcResult] = useState<{
    basePrice: number
    marginAmount: number
    feeAmount: number
    finalPrice: number
  } | null>(null)

  const [calcForm, setCalcForm] = useState({
    cost_price: "",
    margin_percent: String(pricing?.margin_percent || 40),
    marketplace_fee: String(pricing?.marketplace_fee || 5),
    extra_cost: String(pricing?.extra_cost || 0),
  })

  const handleCalculate = async () => {
    const formData = new FormData()
    formData.set("cost_price", calcForm.cost_price)
    formData.set("margin_percent", calcForm.margin_percent)
    formData.set("marketplace_fee", calcForm.marketplace_fee)
    formData.set("extra_cost", calcForm.extra_cost)
    const result = await calculatePrice(formData)
    setCalcResult(result)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Profil Toko
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Aturan Harga
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Kalkulator Harga
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bisnis</CardTitle>
              <CardDescription>Atur informasi toko Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={profileAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="store_name">Nama Toko</Label>
                  <Input
                    id="store_name"
                    name="store_name"
                    placeholder="Toko Keren"
                    defaultValue={profile?.store_name || ""}
                  />
                </div>
                {profileState?.error && <p className="text-sm text-destructive">{profileState.error}</p>}
                {profileState?.success && <p className="text-sm text-emerald-500">Profil berhasil diperbarui</p>}
                <Button type="submit" disabled={profilePending}>
                  {profilePending ? "Menyimpan..." : "Simpan Profil"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Aturan Harga Default</CardTitle>
              <CardDescription>
                Atur default margin dan biaya marketplace untuk kalkulasi harga
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={pricingAction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="margin_percent">Margin Keuntungan (%)</Label>
                  <Input
                    id="margin_percent"
                    name="margin_percent"
                    type="number"
                    placeholder="40"
                    defaultValue={pricing?.margin_percent ?? 40}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketplace_fee">Biaya Marketplace (%)</Label>
                  <Input
                    id="marketplace_fee"
                    name="marketplace_fee"
                    type="number"
                    placeholder="5"
                    defaultValue={pricing?.marketplace_fee ?? 5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extra_cost">Biaya Tambahan (Rp)</Label>
                  <Input
                    id="extra_cost"
                    name="extra_cost"
                    type="number"
                    placeholder="0"
                    defaultValue={pricing?.extra_cost ?? 0}
                  />
                </div>
                {pricingState?.error && <p className="text-sm text-destructive">{pricingState.error}</p>}
                {pricingState?.success && <p className="text-sm text-emerald-500">Aturan harga berhasil disimpan</p>}
                <Button type="submit" disabled={pricingPending}>
                  {pricingPending ? "Menyimpan..." : "Simpan Aturan"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Pricing Calculator</CardTitle>
              <CardDescription>
                Hitung harga jual rekomendasi berdasarkan modal, margin, dan biaya marketplace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Harga Modal (Rp)</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    placeholder="10000"
                    value={calcForm.cost_price}
                    onChange={(e) => setCalcForm({ ...calcForm, cost_price: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="margin_percent">Margin (%)</Label>
                  <Input
                    id="margin_percent"
                    type="number"
                    placeholder="40"
                    value={calcForm.margin_percent}
                    onChange={(e) => setCalcForm({ ...calcForm, margin_percent: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marketplace_fee">Fee Marketplace (%)</Label>
                  <Input
                    id="marketplace_fee"
                    type="number"
                    placeholder="5"
                    value={calcForm.marketplace_fee}
                    onChange={(e) => setCalcForm({ ...calcForm, marketplace_fee: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extra_cost">Biaya Tambahan (Rp)</Label>
                  <Input
                    id="extra_cost"
                    type="number"
                    placeholder="0"
                    value={calcForm.extra_cost}
                    onChange={(e) => setCalcForm({ ...calcForm, extra_cost: e.target.value })}
                  />
                </div>
              </div>

              <Button onClick={handleCalculate} className="w-full">
                Hitung Harga Jual
              </Button>

              {calcResult && (
                <div className="rounded-lg border p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Harga Dasar</span>
                    <span className="font-medium">{formatCurrency(calcResult.basePrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Profit ({calcForm.margin_percent}%)</span>
                    <span className="font-medium">{formatCurrency(calcResult.marginAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Biaya Marketplace ({calcForm.marketplace_fee}%)</span>
                    <span className="font-medium">{formatCurrency(calcResult.feeAmount)}</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Harga Jual Rekomendasi</span>
                    <span className="text-lg font-bold text-emerald-500">{formatCurrency(calcResult.finalPrice)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
