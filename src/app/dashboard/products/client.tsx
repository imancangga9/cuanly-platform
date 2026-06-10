"use client"

import { useActionState } from "react"
import { createProduct, deleteProduct } from "@/actions/products"
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
import { Plus, Package, Trash2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Product {
  id: string
  name: string
  sku: string | null
  category: string | null
  cost_price: number
  stock: number
  created_at: string
}

export function ProductsClient({ products }: { products: Product[] }) {
  const [state, formAction, pending] = useActionState(createProduct, undefined)

  const handleDelete = async (id: string) => {
    if (confirm("Hapus produk ini?")) {
      await deleteProduct(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Produk</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Produk</Label>
                <Input id="name" name="name" placeholder="Nama produk" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" name="sku" placeholder="SKU-001" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Input id="category" name="category" placeholder="Kopi" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Harga Modal (Rp)</Label>
                  <Input id="cost_price" name="cost_price" type="number" placeholder="10000" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stok</Label>
                  <Input id="stock" name="stock" type="number" placeholder="100" required />
                </div>
              </div>
              {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan Produk"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Package className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada produk</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Tambah Produk Pertama</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Produk Baru</DialogTitle>
                </DialogHeader>
                <form action={formAction} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Produk</Label>
                    <Input id="name" name="name" placeholder="Nama produk" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sku">SKU</Label>
                      <Input id="sku" name="sku" placeholder="SKU-001" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Input id="category" name="category" placeholder="Kopi" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cost_price">Harga Modal (Rp)</Label>
                      <Input id="cost_price" name="cost_price" type="number" placeholder="10000" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stok</Label>
                      <Input id="stock" name="stock" type="number" placeholder="100" required />
                    </div>
                  </div>
                  {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
                  <Button type="submit" className="w-full" disabled={pending}>
                    {pending ? "Menyimpan..." : "Simpan Produk"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{products.length} Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <div className="mt-1 flex gap-2">
                      {product.sku && <Badge variant="outline">{product.sku}</Badge>}
                      {product.category && <Badge variant="secondary">{product.category}</Badge>}
                      <span className="text-xs text-muted-foreground">Stok: {product.stock}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(Number(product.cost_price))}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(product.created_at)}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}>
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
