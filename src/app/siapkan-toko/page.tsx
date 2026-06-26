"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Upload,
  Store,
  ShoppingBag,
  Calculator,
  MessageSquare,
  Bot,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Loader2,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { getSetupStatus, updateSetupProgress, completeSetup } from "@/actions/setup"
import { getProfile, updateProfile, uploadLogo } from "@/actions/profile"
import { getChannels, createChannel, addFactor } from "@/actions/channels"
import { createProduct, getProducts } from "@/actions/products"
import { createProductChannelPrice } from "@/actions/product-channel-prices"
import { calculateChannelPrice } from "@/actions/channels"
import { generateAIAnswer } from "@/actions/ai"
import { getAIWallet } from "@/actions/ai-credit"

type SetupStep = 1 | 2 | 3 | 4 | 5 | 6

interface SetupData {
  step1?: {
    store_name: string
    logo: string | null
    language: string
    timezone: string
  }
  step2?: {
    selected_channels: string[]
  }
  step3?: {
    [channelId: string]: any[]
  }
  step4?: {
    product: any
  }
  step5?: {
    prices: any[]
  }
}

const steps = [
  { id: 1, title: "Profil Toko", icon: Store },
  { id: 2, title: "Channel Penjualan", icon: ShoppingBag },
  { id: 3, title: "Rumus Harga", icon: Calculator },
  { id: 4, title: "Produk Pertama", icon: ShoppingBag },
  { id: 5, title: "Simpan Harga Jual", icon: CheckCircle2 },
  { id: 6, title: "AI Seller Assistant", icon: Bot },
]

const defaultChannels = [
  { name: "Tokopedia", slug: "tokopedia" },
  { name: "Shopee", slug: "shopee" },
  { name: "TikTok Shop", slug: "tiktok-shop" },
  { name: "Lazada", slug: "lazada" },
  { name: "WhatsApp", slug: "whatsapp" },
  { name: "Website", slug: "website" },
]

const defaultFactors = [
  { label: "Admin Marketplace", operation: "multiply", value_type: "percentage", value: 5 },
  { label: "Target Profit", operation: "multiply", value_type: "percentage", value: 40 },
  { label: "Buffer Diskon", operation: "multiply", value_type: "percentage", value: 10 },
  { label: "Biaya Operasional", operation: "add", value_type: "fixed", value: 1000 },
]

export default function SetupWizardPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<SetupStep>(1)
  const [setupData, setSetupData] = useState<SetupData>({})
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [channels, setChannels] = useState<any[]>([])
  const [aiAnswer, setAiAnswer] = useState("")
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const setupStatus = await getSetupStatus()
      const profile = await getProfile()
      const existingChannels = await getChannels()
      const existingProducts = await getProducts()

      if (setupStatus?.current_setup_step) {
        setCurrentStep(setupStatus.current_setup_step as SetupStep)
      }
      
      if (profile?.store_name) {
        setSetupData(prev => ({
          ...prev,
          step1: {
            store_name: profile.store_name,
            logo: profile.logo,
            language: "id",
            timezone: "Asia/Jakarta"
          }
        }))
      }

      if (existingChannels.length > 0) {
        setChannels(existingChannels)
        setSetupData(prev => ({
          ...prev,
          step2: { selected_channels: existingChannels.map((c: any) => c.id) }
        }))
      }

      if (existingProducts.length > 0) {
        setProducts(existingProducts)
        setSetupData(prev => ({
          ...prev,
          step4: { product: existingProducts[0] }
        }))
      }

      setLoading(false)
    }
    init()
  }, [])

  const handleNextStep = async () => {
    if (currentStep < 6) {
      const nextStep = (currentStep + 1) as SetupStep
      await updateSetupProgress(nextStep)
      setCurrentStep(nextStep)
    } else {
      await completeSetup()
      router.push("/dashboard")
    }
  }

  const handlePrevStep = async () => {
    if (currentStep > 1) {
      const prevStep = (currentStep - 1) as SetupStep
      await updateSetupProgress(prevStep)
      setCurrentStep(prevStep)
    }
  }

  const progress = (currentStep / 6) * 100

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1 setupData={setupData} setSetupData={setSetupData} onComplete={handleNextStep} />
      case 2:
        return <Step2 setupData={setupData} setSetupData={setSetupData} channels={channels} setChannels={setChannels} onComplete={handleNextStep} />
      case 3:
        return <Step3 setupData={setupData} setSetupData={setSetupData} channels={channels} onComplete={handleNextStep} />
      case 4:
        return <Step4 setupData={setupData} setSetupData={setSetupData} products={products} setProducts={setProducts} onComplete={handleNextStep} />
      case 5:
        return <Step5 setupData={setupData} setSetupData={setSetupData} channels={channels} products={products} onComplete={handleNextStep} />
      case 6:
        return <Step6 setupData={setupData} products={products} aiAnswer={aiAnswer} setAiAnswer={setAiAnswer} aiLoading={aiLoading} setAiLoading={setAiLoading} onComplete={handleNextStep} />
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#0fdc78] rounded flex items-center justify-center">
            <Store className="h-5 w-5 text-white" />
          </div>
          <h2 className="text-xl font-bold">Siapkan Toko Anda ⭐</h2>
        </div>

        <div className="space-y-4 flex-1">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep

            return (
              <div key={step.id} className={`flex items-center gap-3 ${isActive ? "text-[#0fdc78]" : isCompleted ? "text-muted-foreground" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${isActive ? "border-[#0fdc78] bg-[#0fdc78]/10" : isCompleted ? "border-[#0fdc78] bg-[#0fdc78] text-white" : "border-border"}`}>
                  {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-sm font-medium">{step.id}</span>}
                </div>
                <span className={`text-sm ${isActive ? "font-semibold" : ""}`}>{step.title}</span>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-8 space-y-2">
          <div className="h-2 bg-border rounded-full overflow-hidden">
            <div className="h-full bg-[#0fdc78] transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm text-muted-foreground text-center">{Math.round(progress)}% selesai</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
          {renderStepContent()}
        </div>
      </div>
    </div>
  )
}

// Step 1: Profil Toko
function Step1({ setupData, setSetupData, onComplete }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const storeName = formData.get("store_name") as string
    const language = formData.get("language") as string
    const timezone = formData.get("timezone") as string
    const logoFile = formData.get("logo") as File

    let logoUrl = setupData.step1?.logo || null

    if (logoFile && logoFile.size > 0) {
      const logoFormData = new FormData()
      logoFormData.append("logo", logoFile)
      const result = await uploadLogo(undefined, logoFormData)
      if (result?.url) {
        logoUrl = result.url
      }
    }

    await updateProfile(undefined, new FormData())
    const profileFormData = new FormData()
    profileFormData.append("store_name", storeName)
    await updateProfile(undefined, profileFormData)

    setSetupData({
      ...setupData,
      step1: { store_name: storeName, logo: logoUrl, language, timezone }
    })

    onComplete()
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Profil Toko</h1>
        <p className="text-muted-foreground">Mari mulai dengan informasi toko Anda.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Logo Toko</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={setupData.step1?.logo || ""} />
                <AvatarFallback className="text-lg">
                  {setupData.step1?.store_name ? setupData.step1.store_name[0].toUpperCase() : "T"}
                </AvatarFallback>
              </Avatar>
              <div>
                <Input id="logo" name="logo" type="file" accept="image/*" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi Toko</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store_name">Nama Toko</Label>
              <Input id="store_name" name="store_name" defaultValue={setupData.step1?.store_name} placeholder="Toko Keren" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Bahasa Default AI</Label>
                <Select name="language" defaultValue={setupData.step1?.language || "id"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="id">Bahasa Indonesia</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Zona Waktu</Label>
                <Select name="timezone" defaultValue={setupData.step1?.timezone || "Asia/Jakarta"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Jakarta">WIB (Jakarta)</SelectItem>
                    <SelectItem value="Asia/Singapore">WITA (Makassar)</SelectItem>
                    <SelectItem value="Asia/Jayapura">WIT (Jayapura)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-[#0fdc78] hover:bg-[#0cd66a]" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Lanjut"}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </form>
    </div>
  )
}

// Step 2: Channel Penjualan
function Step2({ setupData, setSetupData, channels, setChannels, onComplete }: any) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(setupData.step2?.selected_channels || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleChannel = (channelName: string) => {
    setSelectedChannels(prev => {
      if (prev.includes(channelName)) {
        return prev.filter(c => c !== channelName)
      } else {
        return [...prev, channelName]
      }
    })
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    const newChannels = []
    for (const channelName of selectedChannels) {
      const result = await createChannel(channelName)
      if (result?.data) {
        newChannels.push(result.data)
      }
    }

    setChannels([...channels, ...newChannels])
    setSetupData({
      ...setupData,
      step2: { selected_channels: selectedChannels }
    })

    onComplete()
    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Channel Penjualan</h1>
        <p className="text-muted-foreground">Tambahkan marketplace atau channel tempat Anda berjualan.</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4">
            {defaultChannels.map((channel) => {
              const isSelected = selectedChannels.includes(channel.name) || channels.some((c: any) => c.name === channel.name)
              const isAlreadyCreated = channels.some((c: any) => c.name === channel.name)

              return (
                <div
                  key={channel.slug}
                  onClick={() => {
                    if (isAlreadyCreated) return
                    if (isSelected) {
                      setSelectedChannels(prev => prev.filter(c => c !== channel.name))
                    } else {
                      setSelectedChannels(prev => [...prev, channel.name])
                    }
                  }}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${isSelected ? "border-[#0fdc78] bg-[#0fdc78]/5" : "border-border hover:border-[#0fdc78]/50"}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (isAlreadyCreated) return
                        e.stopPropagation()
                        if (e.target.checked) {
                          setSelectedChannels(prev => [...prev, channel.name])
                        } else {
                          setSelectedChannels(prev => prev.filter(c => c !== channel.name))
                        }
                      }}
                      disabled={isAlreadyCreated}
                      className="h-4 w-4 rounded border-gray-300 text-[#0fdc78] focus:ring-[#0fdc78]"
                    />
                    <span className="font-medium">{channel.name}</span>
                    {isAlreadyCreated && <span className="text-xs text-[#0fdc78] ml-auto">✓ Sudah ada</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSubmit} className="w-full bg-[#0fdc78] hover:bg-[#0cd66a]" disabled={isSubmitting || selectedChannels.length === 0}>
        {isSubmitting ? "Menyimpan..." : "Simpan & Lanjut"}
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}

// Step 3: Rumus Harga
function Step3({ setupData, setSetupData, channels, onComplete }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    for (const channel of channels) {
      for (let i = 0; i < defaultFactors.length; i++) {
        const factor = defaultFactors[i]
        await addFactor({
          channel_id: channel.id,
          label: factor.label,
          operation: factor.operation,
          value_type: factor.value_type,
          value: factor.value,
          sort_order: i
        })
      }
    }

    onComplete()
    setIsSubmitting(false)
  }

  if (channels.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Atur Rumus Harga</h1>
          <p className="text-muted-foreground">Silakan buat channel terlebih dahulu.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Atur Rumus Harga</h1>
        <p className="text-muted-foreground">Setiap marketplace memiliki biaya admin yang berbeda. Kita gunakan rumus standar terlebih dahulu, bisa diedit nanti di pengaturan.</p>
      </div>

      {channels.map((channel: any) => (
        <Card key={channel.id}>
          <CardHeader>
            <CardTitle>{channel.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {defaultFactors.map((factor) => (
                <div key={factor.label} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span>{factor.label}</span>
                  <span className="text-muted-foreground">
                    {factor.operation === "multiply" ? "×" : "+"} {factor.value}{factor.value_type === "percentage" ? "%" : " Rp"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Button onClick={handleSubmit} className="w-full bg-[#0fdc78] hover:bg-[#0cd66a]" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Simpan & Lanjut"}
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}

// Step 4: Produk Pertama
function Step4({ setupData, setSetupData, products, setProducts, onComplete }: any) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (products.length > 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Produk Pertama</h1>
          <p className="text-muted-foreground">Anda sudah memiliki produk!</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              {products[0].photo_url && <img src={products[0].photo_url} alt={products[0].name} className="w-16 h-16 object-cover rounded" />}
              <div>
                <h3 className="font-medium">{products[0].name}</h3>
                <p className="text-sm text-muted-foreground">{formatCurrency(products[0].cost_price)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Button onClick={onComplete} className="w-full bg-[#0fdc78] hover:bg-[#0cd66a]">
          Lanjut
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const result = await createProduct(formData)
    
    if (result?.data) {
      const updatedProducts = await getProducts()
      setProducts(updatedProducts)
      setSetupData({
        ...setupData,
        step4: { product: result.data }
      })
      onComplete()
    }

    setIsSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Tambahkan Produk Pertama</h1>
        <p className="text-muted-foreground">Produk adalah dasar dari seluruh fitur Cuanly.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Produk</Label>
              <Input id="name" name="name" placeholder="Contoh: Skincare Glow" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" placeholder="SKU-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost_price">Harga Modal</Label>
                <Input id="cost_price" name="cost_price" type="number" placeholder="25000" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Input id="category" name="category" placeholder="Kecantikan" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" name="description" placeholder="Deskripsi produk..." />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-[#0fdc78] hover:bg-[#0cd66a]" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Tambah Produk"}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </form>
    </div>
  )
}

// Step 5: Simpan Harga Jual
function Step5({ setupData, setSetupData, channels, products, onComplete }: any) {
  const [prices, setPrices] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saved, setSaved] = useState(false)
  const product = products[0]

  useEffect(() => {
    const calculatePrices = async () => {
      if (!product) return

      const priceResults = []
      for (const channel of channels) {
        const result = await calculateChannelPrice(channel.id, Number(product.cost_price))
        if (result) {
          priceResults.push({ ...result, channel })
        }
      }
      setPrices(priceResults)
    }

    calculatePrices()
  }, [product, channels])

  const handleSubmit = async () => {
    setIsSubmitting(true)

    for (const priceData of prices) {
      await createProductChannelPrice({
        product_id: product.id,
        channel_id: priceData.channel.id,
        selling_price: priceData.finalPrice
      })
    }

    setSaved(true)
    setIsSubmitting(false)
  }

  if (!product) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Simpan Harga Jual</h1>
          <p className="text-muted-foreground">Silakan buat produk terlebih dahulu.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!saved ? (
        <>
          <div className="text-center space-y-2">
            <div className="text-4xl mb-4">🎉</div>
            <h1 className="text-3xl font-bold">Produk berhasil dibuat!</h1>
            <p className="text-muted-foreground">Sekarang tentukan harga jualnya.</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-6">
                {product.photo_url && <img src={product.photo_url} alt={product.name} className="w-16 h-16 object-cover rounded" />}
                <div>
                  <h3 className="font-medium text-lg">{product.name}</h3>
                </div>
              </div>

              <div className="space-y-4">
                {prices.map((priceData, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{priceData.channel.name}</span>
                      <span className="text-lg font-bold text-[#0fdc78]">{formatCurrency(priceData.finalPrice)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Modal: {formatCurrency(product.cost_price)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSubmit} className="w-full bg-[#0fdc78] hover:bg-[#0cd66a]" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan..." : "Simpan Harga Jual"}
          </Button>
        </>
      ) : (
        <>
          <div className="text-center space-y-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-[#0fdc78] mx-auto" />
            <h1 className="text-2xl font-bold">Harga jual berhasil disimpan!</h1>
            <Button onClick={onComplete} className="bg-[#0fdc78] hover:bg-[#0cd66a]">
              Lanjut ke AI Seller Assistant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// Step 6: WOW Momen AI
function Step6({ setupData, products, aiAnswer, setAiAnswer, aiLoading, setAiLoading, onComplete }: any) {
  const [customerQuestion, setCustomerQuestion] = useState("Kak ini aman untuk keramik?")
  const product = products[0]

  const handleGenerateAnswer = async () => {
    if (!product) return

    setAiLoading(true)
    const result = await generateAIAnswer(product.id, customerQuestion, "", "id")
    
    if (result?.answer) {
      setAiAnswer(result.answer)
    }
    
    setAiLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#065F34] to-[#0a0b0f] rounded-2xl p-8 text-white">
        <div className="text-center space-y-4 mb-8">
          <Bot className="h-16 w-16 mx-auto text-[#0fdc78]" />
          <h1 className="text-3xl font-bold">AI Seller Assistant Siap Digunakan</h1>
          <p className="text-white/80">Selamat! Sekarang AI sudah memahami produk yang baru saja Anda buat. Silakan coba bertanya seperti customer Anda.</p>
        </div>

        {product && (
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-3">
                {product.photo_url && <img src={product.photo_url} alt={product.name} className="w-12 h-12 object-cover rounded" />}
                <div>
                  <h3 className="font-medium">{product.name}</h3>
                  <p className="text-sm text-white/60">Produk aktif</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-2xl mx-auto space-y-4">
          <div>
            <Label className="text-white/80">Customer bertanya...</Label>
            <Textarea
              value={customerQuestion}
              onChange={(e) => setCustomerQuestion(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder-white/40"
              placeholder="Tulis pertanyaan customer..."
              rows={3}
            />
          </div>
          <Button
            onClick={handleGenerateAnswer}
            className="w-full bg-[#0fdc78] hover:bg-[#0cd66a] text-black font-medium"
            disabled={aiLoading}
          >
            {aiLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menghasilkan Jawaban...
              </>
            ) : (
              "Generate Jawaban"
            )}
          </Button>

          {aiAnswer && (
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Bot className="h-6 w-6 text-[#0fdc78] flex-shrink-0 mt-1" />
                <div className="text-white/90 whitespace-pre-wrap">{aiAnswer}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {aiAnswer && (
        <>
          <div className="text-center space-y-2 py-6">
            <div className="text-4xl">🎉</div>
            <h2 className="text-xl font-bold">Selamat!</h2>
            <p className="text-muted-foreground">Anda baru saja menggunakan AI Seller Assistant pertama.</p>
          </div>
          <Button onClick={onComplete} className="w-full bg-[#0fdc78] hover:bg-[#0cd66a] text-black font-medium text-lg py-6">
            Masuk Dashboard →
          </Button>
        </>
      )}
    </div>
  )
}
