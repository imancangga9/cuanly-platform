"use client"

import { useState } from "react"
import { createTransactionWithDetails, deleteTransaction } from "@/actions/transactions"
import type { Channel } from "@/actions/channels"
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
import { Separator } from "@/components/ui/separator"
import { Plus, ShoppingCart, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Product {
  id: string
  name: string
  cost_price: number
  savedPrices?: any[]
}

interface SavedPrice {
  id: string
  channel_name: string
  recommended_price: number
  selling_price: number
}

interface TransactionDeduction {
  id: string
  title: string
  amount: number
}

interface TransactionCost {
  id: string
  title: string
  amount: number
}

interface Transaction {
  id: string
  product_id: string | null
  channel_price_id: string | null
  qty: number
  selling_price: number
  created_at: string
  products: { name: string; cost_price: number } | null
  product_channel_prices: { channel_name: string } | null
  transaction_deductions: TransactionDeduction[]
  transaction_costs: TransactionCost[]
}

export function TransactionsClient({
  transactions,
  products,
  channels,
}: {
  transactions: Transaction[]
  products: Product[]
  channels: Channel[]
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedProductId, setSelectedProductId] = useState("")
  const [selectedSavedPriceId, setSelectedSavedPriceId] = useState("")
  const [qty, setQty] = useState(1)
  const [sellingPrice, setSellingPrice] = useState(0)
  const [deductions, setDeductions] = useState<{ title: string; amount: number }[]>([])
  const [costs, setCosts] = useState<{ title: string; amount: number }[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const selectedProduct = products.find(p => p.id === selectedProductId)
  const selectedSavedPrice = selectedProduct?.savedPrices?.find(sp => sp.id === selectedSavedPriceId)

  // Calculate totals for UI
  const revenue = qty * sellingPrice
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0)
  const totalCosts = costs.reduce((sum, c) => sum + c.amount, 0)
  const costOfGoodsSold = selectedProduct ? qty * selectedProduct.cost_price : 0
  const netProfit = revenue - totalDeductions - totalCosts - costOfGoodsSold

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    createTransactionWithDetails(
      selectedProductId || null,
      selectedSavedPriceId || null,
      selectedSavedPrice?.channel_name || null,
      qty,
      sellingPrice,
      deductions,
      costs
    ).then((result) => {
      if (result.error) setError(result.error)
      else {
        setOpen(false)
        resetForm()
        router.refresh()
      }
    }).catch((err) => {
      setError(err.message)
    }).finally(() => {
      setPending(false)
    })
  }

  const resetForm = () => {
    setSelectedProductId("")
    setSelectedSavedPriceId("")
    setQty(1)
    setSellingPrice(0)
    setDeductions([])
    setCosts([])
  }

  const addDeduction = () => {
    setDeductions([...deductions, { title: "", amount: 0 }])
  }

  const updateDeduction = (index: number, field: keyof typeof deductions[0], value: any) => {
    const newDeductions = [...deductions]
    newDeductions[index] = { ...newDeductions[index], [field]: field === "amount" ? Number(value) : value }
    setDeductions(newDeductions)
  }

  const removeDeduction = (index: number) => {
    setDeductions(deductions.filter((_, i) => i !== index))
  }

  const addCost = () => {
    setCosts([...costs, { title: "", amount: 0 }])
  }

  const updateCost = (index: number, field: keyof typeof costs[0], value: any) => {
    const newCosts = [...costs]
    newCosts[index] = { ...newCosts[index], [field]: field === "amount" ? Number(value) : value }
    setCosts(newCosts)
  }

  const removeCost = (index: number) => {
    setCosts(costs.filter((_, i) => i !== index))
  }

  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId)
    setSelectedSavedPriceId("")
    setSellingPrice(0)
  }

  const handleSavedPriceSelect = (priceId: string) => {
    setSelectedSavedPriceId(priceId)
    const price = selectedProduct?.savedPrices?.find(sp => sp.id === priceId)
    if (price) setSellingPrice(price.selling_price)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Hapus transaksi ini?")) {
      await deleteTransaction(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Transaksi</h1>
        <Dialog open={open} onOpenChange={(newOpen) => {
          setOpen(newOpen)
          if (!newOpen) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Tambah Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Transaksi Baru</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product">Produk</Label>
                <Select value={selectedProductId} onValueChange={handleProductSelect}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Pilih produk (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id} className="max-w-xl">
                        <span className="truncate">{p.name}</span>
                        <span className="text-muted-foreground ml-2"> - {formatCurrency(Number(p.cost_price))}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="space-y-2">
                  <Label htmlFor="channelPrice">Harga Jual Aktif</Label>
                  <Select value={selectedSavedPriceId} onValueChange={handleSavedPriceSelect}>
                    <SelectTrigger id="channelPrice">
                      <SelectValue placeholder="Pilih harga (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProduct.savedPrices?.map((sp) => (
                        <SelectItem key={sp.id} value={sp.id}>
                          {sp.channel_name} - {formatCurrency(Number(sp.selling_price))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qty">Jumlah</Label>
                  <Input id="qty" type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} placeholder="1" required min={1} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selling_price">Harga Jual (Rp)</Label>
                  <Input id="selling_price" type="number" value={sellingPrice} onChange={(e) => setSellingPrice(Number(e.target.value))} placeholder="17500" required />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Potongan</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addDeduction}>
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah Faktor
                  </Button>
                </div>
                {deductions.map((d, index) => (
                  <div key={index} className="grid grid-cols-[2fr_1fr_auto] gap-2">
                    <Input placeholder="Nama potongan (misal. Admin Tokopedia)" value={d.title} onChange={(e) => updateDeduction(index, "title", e.target.value)} />
                    <Input type="number" placeholder="Rp" value={d.amount} onChange={(e) => updateDeduction(index, "amount", e.target.value)} />
                    <Button variant="destructive" size="icon" type="button" onClick={() => removeDeduction(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Biaya Tambahan</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addCost}>
                    <Plus className="h-3 w-3 mr-1" />
                    Tambah Faktor
                  </Button>
                </div>
                {costs.map((c, index) => (
                  <div key={index} className="grid grid-cols-[2fr_1fr_auto] gap-2">
                    <Input placeholder="Nama biaya (misal. Packing)" value={c.title} onChange={(e) => updateCost(index, "title", e.target.value)} />
                    <Input type="number" placeholder="Rp" value={c.amount} onChange={(e) => updateCost(index, "amount", e.target.value)} />
                    <Button variant="destructive" size="icon" type="button" onClick={() => removeCost(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Modal:</span>
                  <span>{formatCurrency(costOfGoodsSold)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-green-600">
                  <span>Profit Bersih:</span>
                  <span>{netProfit >= 0 ? "+" : ""}{formatCurrency(netProfit)}</span>
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

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
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">{transactions.length} Transaksi</h2>
          {transactions.map((t) => {
            const expanded = expandedId === t.id
            const totalDeductions = t.transaction_deductions?.reduce((sum, d) => sum + Number(d.amount), 0) || 0
            const totalCosts = t.transaction_costs?.reduce((sum, c) => sum + Number(c.amount), 0) || 0
            const costOfGoodsSold = t.products ? t.qty * Number(t.products.cost_price) : 0
            const revenue = t.qty * Number(t.selling_price)
            const netProfit = revenue - totalDeductions - totalCosts - costOfGoodsSold
            return (
              <Card key={t.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{t.products?.name || "Produk"}</p>
                      <div className="mt-1 flex gap-2 flex-wrap">
                        {t.product_channel_prices?.channel_name && <Badge variant="outline">{t.product_channel_prices.channel_name}</Badge>}
                        <span className="text-xs text-muted-foreground">{t.qty} terjual</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(revenue)}</p>
                        <p className={cn("text-xs", netProfit >= 0 ? "text-emerald-500" : "text-red-500")}>
                          {netProfit >= 0 ? "+" : ""}{formatCurrency(netProfit)}
                        </p>
                      </div>
                      <button
                        onClick={() => setExpandedId(expanded ? null : t.id)}
                        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors"
                      >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {expanded && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Modal:</span>
                          <span className="ml-2">{formatCurrency(costOfGoodsSold)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Harga Jual:</span>
                          <span className="ml-2">{formatCurrency(Number(t.selling_price))}</span>
                        </div>
                      </div>
                      {t.transaction_deductions?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-red-500">Potongan:</p>
                          <div className="mt-2 grid gap-1 text-sm">
                            {t.transaction_deductions.map((d) => (
                              <div key={d.id} className="flex justify-between">
                                <span>{d.title}</span>
                                <span className="text-red-500">-{formatCurrency(Number(d.amount))}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {t.transaction_costs?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-orange-500">Biaya Tambahan:</p>
                          <div className="mt-2 grid gap-1 text-sm">
                            {t.transaction_costs.map((c) => (
                              <div key={c.id} className="flex justify-between">
                                <span>{c.title}</span>
                                <span className="text-orange-500">-{formatCurrency(Number(c.amount))}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id)}>
                          Hapus
                        </Button>
                      </div>
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
