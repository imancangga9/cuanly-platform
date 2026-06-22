"use client"

import { useActionState, useState } from "react"
import { updateProfile, uploadLogo, updateAccountName, updateAccountEmail, updatePassword } from "@/actions/profile"
import { calculatePrice } from "@/actions/pricing"
import type { Channel } from "@/actions/channels"
import { calculateChannelPrice } from "@/actions/channels"
import { ChannelManager } from "@/components/channel-manager"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calculator, Store, LayoutList, User, Upload } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Profile {
  store_name: string | null
  logo: string | null
}

export function SettingsClient({
  profile,
  channels,
  userEmail,
  userFullName,
}: {
  profile: Profile | null
  channels: Channel[]
  userEmail: string
  userFullName: string
}) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, undefined)
  const [logoState, logoAction, logoPending] = useActionState(uploadLogo, undefined)
  const [nameState, nameAction, namePending] = useActionState(updateAccountName, undefined)
  const [emailState, emailAction, emailPending] = useActionState(updateAccountEmail, undefined)
  const [passwordState, passwordAction, passwordPending] = useActionState(updatePassword, undefined)

  const [calcForm, setCalcForm] = useState({
    cost_price: "",
    margin_percent: "40",
    marketplace_fee: "5",
    extra_cost: "0",
  })

  const [calcResult, setCalcResult] = useState<{
    basePrice: number
    marginAmount: number
    feeAmount: number
    finalPrice: number
  } | null>(null)

  const [channelCalcForm, setChannelCalcForm] = useState({
    cost_price: "",
    channel_id: channels[0]?.id || "",
  })

  const [channelCalcResult, setChannelCalcResult] = useState<{
    channelName: string
    factors: { label: string; operation: string; value_type: string; value: number; amount: number }[]
    finalPrice: number
  } | null>(null)

  const handleCalculate = async () => {
    const formData = new FormData()
    formData.set("cost_price", calcForm.cost_price)
    formData.set("margin_percent", calcForm.margin_percent)
    formData.set("marketplace_fee", calcForm.marketplace_fee)
    formData.set("extra_cost", calcForm.extra_cost)
    const result = await calculatePrice(formData)
    setCalcResult(result)
  }

  const handleChannelCalculate = async () => {
    if (!channelCalcForm.channel_id || !channelCalcForm.cost_price) return
    const result = await calculateChannelPrice(channelCalcForm.channel_id, Number(channelCalcForm.cost_price))
    setChannelCalcResult(result)
  }

  const initials = userFullName
    ? userFullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : userEmail[0].toUpperCase()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Pengaturan</h1>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Profil Toko
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <LayoutList className="h-4 w-4" />
            Channel
          </TabsTrigger>
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Akun
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Kalkulator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Logo Toko</CardTitle>
                <CardDescription>Upload logo untuk toko Anda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.logo || ""} />
                    <AvatarFallback className="text-lg">{initials}</AvatarFallback>
                  </Avatar>
                  <form action={logoAction} className="flex items-center gap-2">
                    <Input id="logo" name="logo" type="file" accept="image/*" className="w-48" />
                    <Button type="submit" disabled={logoPending} size="sm">
                      <Upload className="h-4 w-4" />
                      {logoPending ? "Upload..." : "Upload"}
                    </Button>
                  </form>
                </div>
                {logoState?.error && <p className="text-sm text-destructive">{logoState.error}</p>}
                {logoState?.success && <p className="text-sm text-emerald-500">Logo berhasil diupload</p>}
              </CardContent>
            </Card>
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
          </div>
        </TabsContent>

        <TabsContent value="channels" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Penjualan</CardTitle>
              <CardDescription>
                Atur channel penjualan dan faktor perhitungan harga masing-masing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChannelManager channels={channels} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account" className="mt-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Nama Pengguna</CardTitle>
                <CardDescription>Ubah nama tampilan akun Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={nameAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nama Lengkap</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="Nama Anda"
                      defaultValue={userFullName}
                    />
                  </div>
                  {nameState?.error && <p className="text-sm text-destructive">{nameState.error}</p>}
                  {nameState?.success && <p className="text-sm text-emerald-500">Nama berhasil diperbarui</p>}
                  <Button type="submit" disabled={namePending}>Simpan Nama</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email</CardTitle>
                <CardDescription>Email saat ini: {userEmail}. Ubah email akan mengirim link konfirmasi.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={emailAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Baru</Label>
                    <Input id="email" name="email" type="email" placeholder="baru@email.com" required />
                  </div>
                  {emailState?.error && <p className="text-sm text-destructive">{emailState.error}</p>}
                  {emailState?.success && <p className="text-sm text-emerald-500">Link konfirmasi telah dikirim ke email baru</p>}
                  <Button type="submit" disabled={emailPending}>Ubah Email</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Ubah password akun Anda</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={passwordAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password Baru</Label>
                    <Input id="password" name="password" type="password" placeholder="Min. 6 karakter" required minLength={6} />
                  </div>
                  {passwordState?.error && <p className="text-sm text-destructive">{passwordState.error}</p>}
                  {passwordState?.success && <p className="text-sm text-emerald-500">Password berhasil diubah</p>}
                  <Button type="submit" disabled={passwordPending}>Ubah Password</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calculator" className="mt-4">
          <div className="grid gap-4">
            {channels.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Kalkulator per Channel</CardTitle>
                  <CardDescription>
                    Hitung harga jual berdasarkan faktor-faktor channel yang sudah diatur
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="channel_id">Pilih Channel</Label>
                      <Select
                        value={channelCalcForm.channel_id}
                        onValueChange={(value) => setChannelCalcForm({ ...channelCalcForm, channel_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {channels.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="channel_cost_price">Harga Modal (Rp)</Label>
                      <Input
                        id="channel_cost_price"
                        type="number"
                        placeholder="10000"
                        value={channelCalcForm.cost_price}
                        onChange={(e) => setChannelCalcForm({ ...channelCalcForm, cost_price: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleChannelCalculate} className="w-full">
                    Hitung Harga Jual
                  </Button>

                  {channelCalcResult && (
                    <div className="rounded-lg border p-4 space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">Channel: {channelCalcResult.channelName}</p>
                      {channelCalcResult.factors.map((f, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{f.label}</span>
                          <span className="font-medium">
                            {f.operation === "multiply" ? "×" : "+"} {f.value}{f.value_type === "percentage" ? "%" : " Rp"}
                            {" → "}
                            {formatCurrency(f.amount)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-3 flex justify-between">
                        <span className="font-semibold">Harga Jual Rekomendasi</span>
                        <span className="text-lg font-bold text-emerald-500">{formatCurrency(channelCalcResult.finalPrice)}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Kalkulator Sederhana</CardTitle>
                <CardDescription>
                  Hitung harga jual berdasarkan margin dan biaya tetap
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
