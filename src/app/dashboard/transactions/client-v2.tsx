"use client"

import { useState } from "react"
import { Plus, Trash2, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"
import { createTransactionV2 } from "@/actions/transactions-v2"

interface Product {
  id: string
  name: string
  cost_price: number | string
  savedPrices: Array<{ channel_name: string, selling_price: number }>
}

interface TransactionItem {
  product_name_snapshot: string
  qty: number
  selling_price: number
  subtotal: number
  hpp_price: number
  total_hpp: number
  profit: number
  products?: { photo_url: string | null }
}

interface TransactionAdjustment {
  title: string
  amount: number
}

interface Transaction {
  id: string
  invoice_number: string
  channel: string
  transaction_date: string
  subtotal: number
  total_deduction: number
  gross_profit: number
  total_hpp: number
  net_profit: number
  transaction_items: TransactionItem[]
  transaction_adjustments: TransactionAdjustment[]
  created_at: string
}

export function TransactionsClientV2({ products, channels, transactions }: { products: Product[], channels: Array<{ id: string, name: string }>, transactions: Transaction[] }) {
  const [open, setOpen] = useState(false)
  const [openDetail, setOpenDetail] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [channel, setChannel] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [items, setItems] = useState<Array<{ id: string, productId?: string, productName: string, qty: number, sellingPrice: number, hppPrice: number }>>([])
  const [adjustments, setAdjustments] = useState<Array<{ id: string, title: string, amount: number }>>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // When channel changes, update selling prices for all items with product selected
  const handleChannelChange = (newChannel: string) => {
    setChannel(newChannel)
    setItems(items.map(item => {
      if (item.productId) {
        const product = products.find(p => p.id === item.productId)
        if (product) {
          const savedPrice = product.savedPrices?.find(sp => sp.channel_name === newChannel)
          return {
            ...item,
            sellingPrice: savedPrice?.selling_price || item.sellingPrice
          }
        }
      }
      return item
    }))
  }

  const addItem = () => {
    setItems([
      ...items,
      { id: crypto.randomUUID(), productName: "", qty: 1, sellingPrice: 0, hppPrice: 0 }
    ])
  }

  const updateItem = (id: string, updates: Partial<typeof items[0]>) => {
    setItems(items.map(i => i.id === id ? { ...i, ...updates } : i))
  }

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.id !== id))
  }

  const addAdjustment = () => {
    setAdjustments([
      ...adjustments,
      { id: crypto.randomUUID(), title: "", amount: 0 }
    ])
  }

  const updateAdjustment = (id: string, updates: Partial<typeof adjustments[0]>) => {
    setAdjustments(adjustments.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const removeAdjustment = (id: string) => {
    setAdjustments(adjustments.filter(a => a.id !== id))
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.sellingPrice), 0)
  const totalDeduction = adjustments.reduce((sum, adj) => sum + adj.amount, 0)
  const totalHpp = items.reduce((sum, item) => sum + (item.qty * item.hppPrice), 0)
  const grossProfit = subtotal - totalDeduction
  const netProfit = grossProfit - totalHpp

  const handleSubmit = async () => {
    if (!channel || items.length === 0) {
      alert("Pilih channel dan tambahkan setidaknya satu produk")
      return
    }

    setLoading(true)
    try {
      const result = await createTransactionV2({
        channel,
        invoiceNumber,
        items: items.map(i => ({
          productId: i.productId,
          productName: i.productName,
          qty: i.qty,
          sellingPrice: i.sellingPrice,
          hppPrice: i.hppPrice
        })),
        adjustments: adjustments
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }

      setOpen(false)
      setChannel("")
      setInvoiceNumber("")
      setItems([])
      setAdjustments([])
      router.refresh()
    } catch (err) {
      console.error("Transaction Error:", err)
      alert(`Gagal menyimpan transaksi: ${err instanceof Error ? err.message : "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Transaksi</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#0fdc78] hover:bg-[#0cd66a]">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Transaksi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden w-full">
            <DialogHeader>
              <DialogTitle>Tambah Transaksi Baru</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Channel */}
              <div>
                <Label>Channel</Label>
                <Select value={channel} onValueChange={handleChannelChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map(ch => (
                      <SelectItem key={ch.id} value={ch.name}>{ch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Invoice / Transaction ID */}
              <div>
                <Label>ID Transaksi / Invoice (dari Channel)</Label>
                <Input 
                  placeholder="Contoh: INV-2026-001 atau Order ID dari marketplace" 
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                />
              </div>

              {/* Items */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="font-semibold">Produk</Label>
                  <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Produk
                  </Button>
                </div>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3 items-start border p-3 rounded-lg">
                      <div className="flex-1 space-y-3">
                        {/* Product Select */}
                        <div className="w-full max-w-full">
                          <Label>Produk</Label>
                          <Select 
                            value={item.productId || ""} 
                            onValueChange={(productId) => {
                              const product = products.find(p => p.id === productId)
                              if (product) {
                                // Auto-fill selling price from saved prices based on selected channel
                                const savedPrice = product.savedPrices?.find(sp => sp.channel_name === channel)
                                
                                updateItem(item.id, {
                                  productId,
                                  productName: product.name,
                                  hppPrice: Number(product.cost_price),
                                  sellingPrice: savedPrice?.selling_price || 0
                                })
                              }
                            }}
                          >
                            <SelectTrigger className="w-full max-w-full overflow-hidden">
                              <SelectValue placeholder="Pilih produk" />
                            </SelectTrigger>
                            <SelectContent className="w-full max-w-full" align="start" sideOffset={4}>
                              {products.map(p => (
                                <SelectItem 
                                  key={p.id} 
                                  value={p.id}
                                  className="flex flex-col items-start gap-1 py-3 w-full max-w-full overflow-hidden"
                                >
                                  <span className="w-full max-w-full whitespace-normal break-words">
                                    {p.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {formatCurrency(Number(p.cost_price))}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Qty and Selling Price */}
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <Label>Jumlah</Label>
                            <Input 
                              type="number" 
                              min="1"
                              value={item.qty} 
                              onChange={(e) => updateItem(item.id, { qty: Math.max(1, Number(e.target.value) || 1) })} 
                            />
                          </div>
                          <div className="flex-1">
                            <Label>Harga Jual</Label>
                            <Input 
                              type="number" 
                              min="0"
                              value={item.sellingPrice} 
                              onChange={(e) => updateItem(item.id, { sellingPrice: Number(e.target.value) || 0 })} 
                            />
                          </div>
                          <div className="flex-1">
                            <Label>Subtotal</Label>
                            <div className="py-2 font-medium">{formatCurrency(item.qty * item.sellingPrice)}</div>
                          </div>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeItem(item.id)}
                        className="mt-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adjustments */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="font-semibold">Pengurang</Label>
                  <Button type="button" variant="secondary" size="sm" onClick={addAdjustment}>
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Faktor
                  </Button>
                </div>
                <div className="space-y-2">
                  {adjustments.map((adj) => (
                    <div key={adj.id} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label>Nama Faktor</Label>
                        <Input 
                          placeholder="Contoh: Admin Marketplace"
                          value={adj.title}
                          onChange={(e) => updateAdjustment(adj.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="flex-1">
                        <Label>Jumlah</Label>
                        <Input 
                          type="number"
                          min="0"
                          value={adj.amount}
                          onChange={(e) => updateAdjustment(adj.id, { amount: Number(e.target.value) || 0 })}
                        />
                      </div>
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => removeAdjustment(adj.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Pengurang</span>
                  <span className="font-medium">{formatCurrency(totalDeduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Profit</span>
                  <span className={grossProfit >= 0 ? "font-medium" : "font-medium text-red-600"}>
                    {formatCurrency(grossProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total HPP</span>
                  <span className="font-medium">{formatCurrency(totalHpp)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Net Profit</span>
                  <span className={netProfit >= 0 ? "text-[#0fdc78]" : "text-red-600"}>
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </div>

              <Button 
                className="w-full bg-[#0fdc78] hover:bg-[#0cd66a]"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan Transaksi
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Belum ada transaksi
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => {
              const firstTransactionItem = transaction.transaction_items?.[0]
              const firstProductName = firstTransactionItem?.product_name_snapshot
              const firstProductPhoto = firstTransactionItem?.products?.photo_url
              const hasMultipleItems = transaction.transaction_items && transaction.transaction_items.length > 1
              
              return (
                <Card 
                  key={transaction.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
                  onClick={() => {
                    setSelectedTransaction(transaction)
                    setOpenDetail(true)
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      {/* Product Photo */}
                      {firstProductPhoto ? (
                        <img 
                          src={firstProductPhoto} 
                          alt={firstProductName || "Product"} 
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0 shadow-sm"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2">
                          <p className="font-semibold text-foreground truncate">{firstProductName || "Transaksi"}</p>
                          {hasMultipleItems && (
                            <span className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                              +{transaction.transaction_items.length - 1} lainnya
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-medium text-primary">{transaction.channel}</span>
                          {transaction.invoice_number && (
                            <>
                              <span className="text-xs text-muted-foreground">&middot;</span>
                              <span className="text-xs text-muted-foreground">#{transaction.invoice_number}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-lg text-foreground">{formatCurrency(transaction.subtotal)}</p>
                        <p className={`text-xs font-medium mt-1 ${transaction.net_profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                          {transaction.net_profit >= 0 ? "+" : ""}{formatCurrency(transaction.net_profit)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Transaction Detail Dialog */}
      <Dialog open={openDetail} onOpenChange={setOpenDetail}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden w-full">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              {/* Transaction Header Info */}
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Channel</p>
                    <p className="font-medium">{selectedTransaction.channel}</p>
                  </div>
                  {selectedTransaction.invoice_number && (
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Invoice</p>
                      <p className="font-medium">#{selectedTransaction.invoice_number}</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-muted-foreground">Tanggal</p>
                    <p className="font-medium">{new Date(selectedTransaction.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              </div>

              {/* Transaction Items */}
              <div>
                <p className="font-semibold mb-3">Produk</p>
                <div className="space-y-3">
                  {selectedTransaction.transaction_items?.map((item, index) => (
                    <div key={item.id || index} className="flex gap-3 items-start border p-3 rounded-lg">
                      {item.products?.photo_url ? (
                        <img 
                          src={item.products.photo_url} 
                          alt={item.product_name_snapshot} 
                          className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                          <Package className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.product_name_snapshot}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm mt-1">
                          <div>
                            <span className="text-muted-foreground">Jumlah:</span> {item.qty}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Harga Jual:</span> {formatCurrency(item.selling_price)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">HPP:</span> {formatCurrency(item.hpp_price)}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Subtotal:</span> {formatCurrency(item.subtotal)}
                          </div>
                        </div>
                        <div className="mt-1">
                          <span className={`text-sm ${item.profit >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                            Profit: {item.profit >= 0 ? "+" : ""}{formatCurrency(item.profit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adjustments */}
              {selectedTransaction.transaction_adjustments?.length > 0 && (
                <div>
                  <p className="font-semibold mb-3">Pengurang</p>
                  <div className="space-y-2">
                    {selectedTransaction.transaction_adjustments.map((adj, index) => (
                      <div key={adj.id || index} className="flex justify-between items-center">
                        <p>{adj.title}</p>
                        <p className="text-red-500 font-medium">-{formatCurrency(adj.amount)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(selectedTransaction.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Pengurang</span>
                  <span className="font-medium">{formatCurrency(selectedTransaction.total_deduction)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gross Profit</span>
                  <span className={selectedTransaction.gross_profit >= 0 ? "font-medium" : "font-medium text-red-600"}>
                    {formatCurrency(selectedTransaction.gross_profit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total HPP</span>
                  <span className="font-medium">{formatCurrency(selectedTransaction.total_hpp)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Net Profit</span>
                  <span className={selectedTransaction.net_profit >= 0 ? "text-[#0fdc78]" : "text-red-600"}>
                    {formatCurrency(selectedTransaction.net_profit)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
