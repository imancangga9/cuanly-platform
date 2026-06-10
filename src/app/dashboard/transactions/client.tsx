"use client"

import { useActionState } from "react"
import { createTransaction, deleteTransaction } from "@/actions/transactions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Plus, ShoppingCart, Trash2 } from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"

interface Transaction {
  id: string
  product_id: string | null
  qty: number
  selling_price: number
  revenue: number
  profit: number
  channel: string | null
  created_at: string
  products: { name: string } | null
}

interface Product {
  id: string
  name: string
  cost_price: number
}

export function TransactionsClient({
  transactions,
  products,
}: {
  transactions: Transaction[]
  products: Product[]
}) {
  const [state, formAction, pending] = useActionState(createTransaction, undefined)

  const handleDelete = async (id: string) => {
    if (confirm("Hapus transaksi ini?")) {
      await deleteTransaction(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Tambah Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Transaksi Baru</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product_id">Produk</Label>
                <select
                  id="product_id"
                  name="product_id"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                >
                  <option value="">Pilih produk (opsional)</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {formatCurrency(Number(p.cost_price))}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qty">Jumlah</Label>
                  <Input id="qty" name="qty" type="number" placeholder="1" required min={1} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selling_price">Harga Jual (Rp)</Label>
                  <Input id="selling_price" name="selling_price" type="number" placeholder="17500" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="channel">Channel</Label>
                <Input id="channel" name="channel" placeholder="Tokopedia, Shopee, dll" />
              </div>
              {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan Transaksi"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada transaksi</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Catat Transaksi Pertama</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Transaksi Baru</DialogTitle>
                </DialogHeader>
                <form action={formAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="product_id">Produk</Label>
                    <select
                      id="product_id"
                      name="product_id"
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    >
                      <option value="">Pilih produk (opsional)</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} - {formatCurrency(Number(p.cost_price))}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="qty">Jumlah</Label>
                      <Input id="qty" name="qty" type="number" placeholder="1" required min={1} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="selling_price">Harga Jual (Rp)</Label>
                      <Input id="selling_price" name="selling_price" type="number" placeholder="17500" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="channel">Channel</Label>
                    <Input id="channel" name="channel" placeholder="Tokopedia, Shopee, dll" />
                  </div>
                  {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
                  <Button type="submit" className="w-full" disabled={pending}>
                    {pending ? "Menyimpan..." : "Simpan Transaksi"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{transactions.length} Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{t.products?.name || "Produk"}</p>
                    <div className="mt-1 flex gap-2">
                      {t.channel && <Badge variant="outline">{t.channel}</Badge>}
                      <span className="text-xs text-muted-foreground">{t.qty} terjual</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(Number(t.revenue))}</p>
                      <p className={cn("text-xs", Number(t.profit) >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {Number(t.profit) >= 0 ? "+" : ""}{formatCurrency(Number(t.profit))}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

