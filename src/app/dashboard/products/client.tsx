"use client"

import { useEffect, useState } from "react"
import { deleteProduct } from "@/actions/products"
import { upsertProductChannelPrices } from "@/actions/product-channel-prices"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Package, Trash2, ChevronDown, ChevronUp, Loader2, Target } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface ChannelPrice {
  channelName: string
  price: number
}

interface SavedProductChannelPrice {
  id: string
  channel_name: string
  recommended_price: number
  selling_price: number
}

interface Product {
  id: string
  name: string
  sku: string | null
  category: string | null
  description: string | null
  photo_url: string | null
  cost_price: number
  stock: number
  created_at: string
  channelPrices: ChannelPrice[]
  savedPrices: SavedProductChannelPrice[]
}

interface Channel {
  id: string
  name: string
  factors: any[]
}

// Function to compress and convert image to WebP
async function compressAndConvertToWebP(file: File, maxWidth = 800, quality = 0.8): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img

        if (width > maxWidth) {
          const ratio = maxWidth / width
          width = maxWidth
          height = height * ratio
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height)
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, { type: 'image/webp' })
            resolve(webpFile)
          }
        }, 'image/webp', quality)
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

function ProductItem({ product, expandedId, setExpandedId, onDelete, channels }: { 
  product: Product; 
  expandedId: string | null; 
  setExpandedId: (id: string | null) => void;
  onDelete: (id: string) => void;
  channels: Channel[];
}) {
  const expanded = expandedId === product.id
  const recommendedPrice = product.channelPrices.length > 0 ? product.channelPrices[0].price : null
  const estimatedProfit = recommendedPrice ? recommendedPrice - Number(product.cost_price) : 0
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [openSetPrice, setOpenSetPrice] = useState(false)
  const [openEdit, setOpenEdit] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: product.name,
    sku: product.sku || '',
    category: product.category || '',
    description: product.description || '',
    cost_price: String(product.cost_price),
    stock: String(product.stock),
  })
  const [editImagePreview, setEditImagePreview] = useState<string | null>(product.photo_url)
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const [priceFormData, setPriceFormData] = useState<Record<string, { recommended: number; selling: number }>>({})
  const [savingPrices, setSavingPrices] = useState(false)
  const [priceSaveError, setPriceSaveError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (openSetPrice) {
      const initialData: Record<string, { recommended: number; selling: number }> = {}
      product.channelPrices.forEach((cp) => {
        const saved = product.savedPrices.find(sp => sp.channel_name === cp.channelName)
        initialData[cp.channelName] = {
          recommended: cp.price,
          selling: saved ? Number(saved.selling_price) : cp.price
        }
      })
      setPriceFormData(initialData)
    }
  }, [openSetPrice, product])

  const handleSavePrices = async () => {
    console.log("handleSavePrices called with priceFormData:", priceFormData);
    setSavingPrices(true)
    setPriceSaveError(null)
    try {
      const prices = Object.entries(priceFormData).map(([channelName, data]) => ({
        channelName,
        recommendedPrice: data.recommended,
        sellingPrice: data.selling
      }))
      console.log("Formatted prices to save:", prices);
      const result = await upsertProductChannelPrices(product.id, prices)
      console.log("Result from upsertProductChannelPrices:", result);
      if (result.error) {
        throw new Error(result.error)
      }
      setOpenSetPrice(false)
      setPriceFormData({})
      router.refresh()
    } catch (err) {
      setPriceSaveError(err instanceof Error ? err.message : "Gagal menyimpan harga")
      console.error(err)
    } finally {
      setSavingPrices(false)
    }
  }

  // Handle file selection for edit
  function handleEditFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    if (file) {
      setEditSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setEditImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setEditSelectedFile(null)
      setEditImagePreview(product.photo_url)
    }
  }

  // Handle edit form submission
  async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSavingEdit(true)
    setEditError(null)

    try {
      const formData = new FormData()
      formData.append('product_id', product.id)
      formData.append('name', editFormData.name)
      formData.append('sku', editFormData.sku)
      formData.append('category', editFormData.category)
      formData.append('description', editFormData.description)
      formData.append('cost_price', editFormData.cost_price)
      formData.append('stock', editFormData.stock)
      
      if (editSelectedFile) {
        const compressed = await compressAndConvertToWebP(editSelectedFile)
        formData.set('photo', compressed)
      }

      const response = await fetch('/api/products', {
        method: 'PUT',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update product')
      }

      setOpenEdit(false)
      setEditImagePreview(product.photo_url)
      setEditSelectedFile(null)
      router.refresh()
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSavingEdit(false)
    }
  }

  // Reset edit form when dialog opens/closes
  useEffect(() => {
    if (openEdit) {
      setEditFormData({
        name: product.name,
        sku: product.sku || '',
        category: product.category || '',
        description: product.description || '',
        cost_price: String(product.cost_price),
        stock: String(product.stock),
      })
      setEditImagePreview(product.photo_url)
      setEditSelectedFile(null)
      setEditError(null)
    }
  }, [openEdit, product])
  
  return (
    <>
      <Card key={product.id}>
        <CardContent className="p-4">
          <div className="flex gap-4">
            {/* Photo */}
            {product.photo_url ? (
              <div className="h-24 w-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                <img src={product.photo_url} alt={product.name} className="h-full w-full object-cover" />
              </div>
            ) : (
              <div className="h-24 w-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
            )}

            {/* Product Info */}
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{product.name}</h3>
              <div className="mt-1 flex gap-2 flex-wrap">
                {product.sku && <Badge variant="outline">{product.sku}</Badge>}
                {product.category && <Badge variant="secondary">{product.category}</Badge>}
              </div>

              {/* Key Metrics */}
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Harga Modal</p>
                  <p className="font-medium">{formatCurrency(Number(product.cost_price))}</p>
                  <p className="text-xs text-muted-foreground mt-1">Profit Estimasi</p>
                  <p className="font-medium text-green-600">{formatCurrency(estimatedProfit)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Harga Jual Rekomendasi</p>
                  <p className="font-semibold text-lg text-green-600">
                    {recommendedPrice ? formatCurrency(recommendedPrice) : "-"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Stok</p>
                  <p className="font-medium">{product.stock} pcs</p>
                </div>
              </div>
            </div>

            {/* Expand Button */}
            <button
              onClick={() => setExpandedId(expanded ? null : product.id)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>{expanded ? "Sembunyikan" : "Detail Produk"}</span>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          {/* Expandable Content */}
          {expanded && (
            <div className="mt-4 pt-4 border-t space-y-4">
              {/* Description */}
              {product.description && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Deskripsi Produk</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {showFullDescription ? product.description : `${product.description.slice(0, 150)}${product.description.length > 150 ? "..." : ""}`}
                  </p>
                  {product.description.length > 150 && (
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-xs text-green-600 hover:text-green-700 mt-1"
                    >
                      {showFullDescription ? "Sembunyikan" : "Lihat selengkapnya"}
                    </button>
                  )}
                </div>
              )}

              {/* Channel Prices */}
              {product.channelPrices.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Harga per Channel</p>
                  <div className="mt-2 grid gap-2">
                    {product.channelPrices.map((cp, i) => {
                      const saved = product.savedPrices.find(sp => sp.channel_name === cp.channelName)
                      return (
                        <div key={i} className="flex justify-between items-center bg-muted p-3 rounded-lg">
                          <span className="text-sm font-medium">{cp.channelName}</span>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Rekomendasi</p>
                              <p className="text-sm font-medium">{formatCurrency(cp.price)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Harga Jual</p>
                              <p className="text-sm font-semibold text-green-600">
                                {saved ? formatCurrency(saved.selling_price) : "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => setOpenEdit(true)}>Edit Produk</Button>
                <Button variant="outline" size="sm">Duplikat</Button>
                <Button variant="default" size="sm" onClick={() => setOpenSetPrice(true)}>
                  <Target className="h-4 w-4 mr-2" />
                  Tetapkan Harga Jual
                </Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(product.id)}>Hapus</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tetapkan Harga Jual Dialog */}
      <Dialog open={openSetPrice} onOpenChange={setOpenSetPrice}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Tetapkan Harga Jual</DialogTitle>
            <p className="text-sm text-muted-foreground">{product.name}</p>
            {product.sku && <p className="text-sm">SKU: {product.sku}</p>}
          </DialogHeader>
          {priceSaveError && <p className="text-sm text-destructive">{priceSaveError}</p>}
          <div className="space-y-4">
            {product.channelPrices.map((cp, i) => {
              const saved = product.savedPrices.find(sp => sp.channel_name === cp.channelName)
              const currentData = priceFormData[cp.channelName] || { recommended: cp.price, selling: cp.price }
              const hasRecommendationChange = saved && Number(saved.recommended_price) !== cp.price
              
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="font-medium">{cp.channelName}</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Harga Rekomendasi</Label>
                      <div className="p-2 bg-muted rounded-md text-sm font-medium">
                        {formatCurrency(cp.price)}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Harga Jual</Label>
                      <Input 
                        type="number" 
                        value={currentData.selling}
                        onChange={(e) => setPriceFormData(prev => ({
                          ...prev,
                          [cp.channelName]: { ...currentData, selling: Number(e.target.value) }
                        }))}
                      />
                    </div>
                  </div>

                  {hasRecommendationChange && (
                    <div className="p-2 bg-yellow-50 text-yellow-800 rounded-md text-xs">
                      ⚠️ Harga rekomendasi baru. Harga jual aktif masih menggunakan nilai lama.
                      <button 
                        className="ml-2 text-blue-600 hover:underline"
                        onClick={() => setPriceFormData(prev => ({
                          ...prev,
                          [cp.channelName]: { ...currentData, selling: cp.price }
                        }))}
                      >
                        Gunakan harga rekomendasi baru
                      </button>
                    </div>
                  )}



                  {i < product.channelPrices.length - 1 && <Separator className="my-2" />}
                </div>
              )
            })}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpenSetPrice(false)}>Batal</Button>
            <Button onClick={handleSavePrices} disabled={savingPrices}>
              {savingPrices ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Harga Jual"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Produk Dialog */}
      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Produk</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Produk</Label>
              <Input 
                id="edit-name" 
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                required 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-sku">SKU</Label>
                <Input 
                  id="edit-sku" 
                  value={editFormData.sku}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, sku: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Kategori</Label>
                <Input 
                  id="edit-category" 
                  value={editFormData.category}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Deskripsi</Label>
              <textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Deskripsi produk..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-photo">Foto Produk</Label>
              <Input 
                id="edit-photo" 
                type="file" 
                accept="image/*" 
                onChange={handleEditFileChange} 
              />
              {editImagePreview && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                  <img src={editImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-cost_price">Harga Modal (Rp)</Label>
                <Input 
                  id="edit-cost_price" 
                  type="number" 
                  value={editFormData.cost_price}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, cost_price: e.target.value }))}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stok</Label>
                <Input 
                  id="edit-stock" 
                  type="number" 
                  value={editFormData.stock}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, stock: e.target.value }))}
                  required 
                />
              </div>
            </div>
            {editError && <p className="text-sm text-destructive">{editError}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpenEdit(false)}>Batal</Button>
              <Button type="submit" disabled={savingEdit}>
                {savingEdit ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export function ProductsClient({ products, channels }: { products: Product[]; channels: Channel[] }) {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Handle file selection and preview
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setSelectedFile(null)
      setImagePreview(null)
    }
  }

  // Custom form submit handler
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      
      if (selectedFile) {
        const compressed = await compressAndConvertToWebP(selectedFile)
        formData.set('photo', compressed)
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create product')
      }

      setOpen(false)
      setImagePreview(null)
      setSelectedFile(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setPending(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Hapus produk ini?")) {
      await deleteProduct(id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Produk</h1>
        <Dialog open={open} onOpenChange={(newOpen) => {
          setOpen(newOpen)
          if (!newOpen) {
            setImagePreview(null)
            setSelectedFile(null)
          }
        }}>
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
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Deskripsi produk..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Foto Produk</Label>
                <Input id="photo" name="photo" type="file" accept="image/*" onChange={handleFileChange} />
                {imagePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                  </div>
                )}
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
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Produk"
                )}
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
            <Dialog open={open} onOpenChange={(newOpen) => {
              setOpen(newOpen)
              if (!newOpen) {
                setImagePreview(null)
                setSelectedFile(null)
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline">Tambah Produk Pertama</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Produk Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi</Label>
                    <textarea
                      id="description"
                      name="description"
                      placeholder="Deskripsi produk..."
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="photo">Foto Produk</Label>
                    <Input id="photo" name="photo" type="file" accept="image/*" onChange={handleFileChange} />
                    {imagePreview && (
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                      </div>
                    )}
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
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <Button type="submit" className="w-full" disabled={pending}>
                    {pending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Produk"
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold">{products.length} Produk</h2>
          {products.map((product) => (
            <ProductItem 
              key={product.id} 
              product={product} 
              expandedId={expandedId} 
              setExpandedId={setExpandedId} 
              onDelete={handleDelete}
              channels={channels}
            />
          ))}
        </div>
      )}
    </div>
  )
}
