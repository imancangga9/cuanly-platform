"use client"

import { useActionState, useEffect, useState } from "react"
import type { Channel } from "@/actions/channels"
import { createChannel, deleteChannel, addFactor, updateFactor, deleteFactor } from "@/actions/channels"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, GripVertical, Pencil, X } from "lucide-react"

export function ChannelManager({ channels }: { channels: Channel[] }) {
  const [channelOpen, setChannelOpen] = useState(false)
  const [factorOpen, setFactorOpen] = useState<string | null>(null)
  const [editingFactor, setEditingFactor] = useState<string | null>(null)
  const [channelState, channelAction, channelPending] = useActionState(createChannel, undefined)
  const [factorState, factorAction, factorPending] = useActionState(addFactor, undefined)
  const [updateFactorState, updateFactorAction, updatePending] = useActionState(updateFactor, undefined)

  useEffect(() => {
    if (channelState?.success) {
      const id = setTimeout(() => setChannelOpen(false))
      return () => clearTimeout(id)
    }
  }, [channelState])

  useEffect(() => {
    if (factorState?.success) {
      const id = setTimeout(() => setFactorOpen(null))
      return () => clearTimeout(id)
    }
  }, [factorState])

  useEffect(() => {
    if (updateFactorState?.success) {
      const id = setTimeout(() => setEditingFactor(null))
      return () => clearTimeout(id)
    }
  }, [updateFactorState])

  const handleDeleteChannel = async (id: string) => {
    if (confirm("Hapus channel ini?")) await deleteChannel(id)
  }

  const handleDeleteFactor = async (id: string) => {
    if (confirm("Hapus faktor ini?")) await deleteFactor(id)
  }

  const operationLabel = (op: string) => op === "multiply" ? "×" : "+"
  const typeLabel = (t: string) => t === "percentage" ? "%" : "Rp"

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div></div>
        <Dialog open={channelOpen} onOpenChange={setChannelOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Tambah Channel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Channel Penjualan</DialogTitle>
            </DialogHeader>
            <form action={channelAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Channel</Label>
                <Input id="name" name="name" placeholder="Tokopedia" required />
              </div>
              {channelState?.error && <p className="text-sm text-destructive">{channelState.error}</p>}
              <Button type="submit" className="w-full" disabled={channelPending}>
                {channelPending ? "Menyimpan..." : "Simpan"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {channels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <p className="text-muted-foreground">Belum ada channel</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {channels.map((channel) => {
            const sortedFactors = [...channel.factors].sort((a, b) => a.sort_order - b.sort_order)
            return (
              <Card key={channel.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg">{channel.name}</CardTitle>
                  <div className="flex gap-2">
                    <Dialog open={factorOpen === channel.id} onOpenChange={(open) => setFactorOpen(open ? channel.id : null)}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4" />
                          Faktor
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Tambah Faktor - {channel.name}</DialogTitle>
                        </DialogHeader>
                        <form action={factorAction} className="space-y-4">
                          <input type="hidden" name="channel_id" value={channel.id} />
                          <input type="hidden" name="sort_order" value={sortedFactors.length} />
                          <div className="space-y-2">
                            <Label htmlFor="label">Nama Faktor</Label>
                            <Input id="label" name="label" placeholder="Margin Keuntungan" required />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="operation">Operasi</Label>
                              <Select name="operation" defaultValue="multiply">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiply">× (Kali)</SelectItem>
                                  <SelectItem value="add">+ (Tambah)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="value_type">Jenis Nilai</Label>
                              <Select name="value_type" defaultValue="percentage">
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">% (Persen)</SelectItem>
                                  <SelectItem value="fixed">Rp (Rupiah)</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="value">Nilai</Label>
                            <Input id="value" name="value" type="number" step="any" placeholder="40" required />
                          </div>
                          {factorState?.error && <p className="text-sm text-destructive">{factorState.error}</p>}
                          <Button type="submit" className="w-full" disabled={factorPending}>
                            {factorPending ? "Menyimpan..." : "Tambah Faktor"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteChannel(channel.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {sortedFactors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Belum ada faktor. Tambah faktor untuk menghitung harga.</p>
                  ) : (
                    <div className="divide-y rounded-lg border">
                      {sortedFactors.map((factor) => (
                        <div key={factor.id} className="flex items-center justify-between px-4 py-3">
                          {editingFactor === factor.id ? (
                            <form
                              action={updateFactorAction}
                              className="flex w-full items-center gap-2"
                              onSubmit={() => setEditingFactor(null)}
                            >
                              <input type="hidden" name="id" value={factor.id} />
                              <Input name="label" defaultValue={factor.label} className="h-8 w-32" />
                              <Select name="operation" defaultValue={factor.operation}>
                                <SelectTrigger className="h-8 w-20">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="multiply">×</SelectItem>
                                  <SelectItem value="add">+</SelectItem>
                                </SelectContent>
                              </Select>
                              <Select name="value_type" defaultValue={factor.value_type}>
                                <SelectTrigger className="h-8 w-16">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="percentage">%</SelectItem>
                                  <SelectItem value="fixed">Rp</SelectItem>
                                </SelectContent>
                              </Select>
                              <Input
                                name="value"
                                type="number"
                                step="any"
                                defaultValue={factor.value}
                                className="h-8 w-20"
                              />
                              <input type="hidden" name="sort_order" value={factor.sort_order} />
                              <Button type="submit" size="sm" variant="default" disabled={updatePending}>
                                Simpan
                              </Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setEditingFactor(null)}>
                                <X className="h-4 w-4" />
                              </Button>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">{factor.label}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {operationLabel(factor.operation)} {factor.value}{typeLabel(factor.value_type)}
                                </span>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingFactor(factor.id)}>
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDeleteFactor(factor.id)}>
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
