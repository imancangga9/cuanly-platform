'use client'

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartNoAxesCombined,
  Calculator,
  Check,
  ChevronDown,
  ChevronUp,
  Bot,
  TrendingUp,
  DollarSign,
  Zap,
  MessageSquare,
  Shield,
  BarChart3,
  Globe
} from "lucide-react"

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [modal, setModal] = useState(25200)
  const [margin, setMargin] = useState(40)
  const [adminFee, setAdminFee] = useState(5)

  const calculatePrice = () => {
    const marginAmount = modal * (margin / 100)
    const priceBeforeFee = modal + marginAmount
    const adminFeeAmount = priceBeforeFee * (adminFee / 100)
    return Math.round(priceBeforeFee + adminFeeAmount)
  }

  const faqs = [
    {
      question: "Apakah kalkulator harga gratis?",
      answer: "Ya, Smart Pricing Calculator dapat digunakan unlimited."
    },
    {
      question: "Apakah AI gratis?",
      answer: "Setiap akun mendapat AI credit gratis setiap bulan untuk mencoba."
    },
    {
      question: "Apakah data aman?",
      answer: "Ya, setiap akun memiliki data bisnis sendiri."
    }
  ]

  const pricingPlans = [
    {
      name: "Free",
      price: "Rp0",
      features: [
        "Smart Pricing Unlimited",
        "Produk Unlimited",
        "Transaksi Unlimited"
      ],
      cta: "Mulai Gratis"
    },
    {
      name: "Pro",
      price: "Rp49.000/bulan",
      features: [
        "Semua Free",
        "AI Assistant",
        "1000 AI Credit",
        "AI Knowledge Produk",
        "History Chat"
      ],
      cta: "Upgrade Pro",
      popular: true
    },
    {
      name: "Business",
      price: "Rp149.000/bulan",
      features: [
        "5000 AI Credit",
        "Multi Admin",
        "Team"
      ],
      cta: "Hubungi Kami"
    }
  ]

  const stats = [
    { value: "10K+", label: "Pengguna Aktif" },
    { value: "98%", label: "Tingkat Kepuasan" },
    { value: "500K+", label: "Transaksi Diproses" },
    { value: "100%", label: "Keamanan Data" }
  ]

  const features1 = [
    { icon: Calculator, title: "Hitung Harga Jual Otomatis", desc: "Tentukan harga jual berdasarkan modal, margin, biaya marketplace, dan target keuntungan." },
    { icon: BarChart3, title: "Pantau Keuntungan Bisnis", desc: "Catat transaksi, biaya tambahan, dan lihat profit bersih setiap penjualan." },
    { icon: Bot, title: "Balas Customer Lebih Cepat", desc: "AI membantu membuat jawaban customer berdasarkan informasi produk Anda." }
  ]

  const features2 = [
    { icon: Check, title: "High Quality", desc: "Dibuat dengan standar industri tertinggi untuk keandalan maksimal.", color: "bg-gradient-to-br from-blue-500 to-cyan-500" },
    { icon: Zap, title: "Automated Workflow", desc: "Otomatiskan tugas berulang untuk fokus pada hal yang lebih penting.", color: "bg-gradient-to-br from-purple-500 to-indigo-500" },
    { icon: Shield, title: "Enterprise Security", desc: "Keamanan data tingkat enterprise dengan enkripsi end-to-end.", color: "bg-gradient-to-br from-gray-700 to-gray-900" }
  ]

  const testimonials = [
    {
      name: "Andi Santoso",
      company: "Toko Baju Sejahtera",
      text: "Cuanly mengubah cara saya mengelola bisnis. Sekarang saya tahu pasti profit saya setiap bulan!",
      logo: "TS"
    },
    {
      name: "Siti Nurhaliza",
      company: "Dapur Nenek",
      text: "AI Assistantnya sungguhan membantu! Saya bisa fokus memasak sambil AI balas chat customer.",
      logo: "DN"
    }
  ]

  const logos = [
    "Tokopedia",
    "Shopee",
    "Lazada",
    "Instagram",
    "WhatsApp",
    "TikTok"
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#0a0b0f] text-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-white/10 px-6 py-4 sticky top-0 z-50 bg-[#0a0b0f]/80 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <ChartNoAxesCombined className="h-6 w-6 text-[#0fdc78]" />
          <span className="text-lg font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Cuanly</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-white/70 hover:text-white transition-colors">Fitur</Link>
          <Link href="#pricing" className="text-white/70 hover:text-white transition-colors">Harga</Link>
          <Link href="#testimonials" className="text-white/70 hover:text-white transition-colors">Testimoni</Link>
        </nav>
        <div className="flex gap-3">
          <Button variant="ghost" asChild className="text-white hover:text-white hover:bg-white/10">
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild className="bg-[#0fdc78] hover:bg-[#0cd66a] text-[#0a0b0f] font-semibold">
            <Link href="/register">Daftar Gratis</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          {/* Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#0fdc78]/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-6 bg-white/10 text-white hover:bg-white/20 border-none">✨ Sekarang Lebih Mudah Mengelola Bisnis</Badge>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                Jualan Lebih Cerdas
                <br />
                <span className="bg-gradient-to-r from-[#0fdc78] to-[#06b6d4] bg-clip-text text-transparent"> dengan AI Seller Assistant</span>
              </h1>
              <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
                Tidak perlu bingung menentukan harga jual dan menghitung untung. Cuanly membantu Anda mengelola produk, transaksi, profit, hingga menjawab customer dengan bantuan AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                <Button size="lg" asChild className="bg-[#0fdc78] hover:bg-[#0cd66a] text-[#0a0b0f] font-semibold px-8">
                  <Link href="/register">Coba Sekarang Gratis</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* First Feature Section */}
        <section id="features" className="py-20 lg:py-32 bg-white text-[#0a0b0f]">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left side - mockup */}
              <div className="relative">
                <Card className="bg-[#0fdc78]/5 border-none overflow-hidden shadow-xl">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-12 h-12 rounded-full bg-[#0fdc78]/20 flex items-center justify-center">
                            <Bot className="text-[#0fdc78]" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#0a0b0f]">Cuanly AI</div>
                            <div className="text-xs text-gray-500">Online</div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="bg-gray-200 rounded-2xl rounded-tl-none p-4">
                              <p className="text-[#0a0b0f] text-sm">Kak, aman untuk keramik?</p>
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <div className="bg-[#0fdc78] rounded-2xl rounded-tr-none p-4 max-w-xs">
                              <p className="text-[#0a0b0f] text-sm">Halo kak! 😊 Produk ini cocok banget untuk keramik, lapnya lembut dan tidak menggores permukaan loh!</p>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-[#0fdc78] flex items-center justify-center flex-shrink-0">
                              <Bot className="w-4 h-4 text-[#0a0b0f]" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="hidden lg:block w-1/2">
                        <Card className="bg-[#0fdc78]/10 border-none">
                          <CardHeader>
                            <CardTitle className="text-lg text-[#0a0b0f]">Smart Pricing</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              <div>
                                <div className="text-sm text-gray-600 mb-1">Produk</div>
                                <div className="font-semibold text-[#0a0b0f]">Glow Home Cleaner</div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-gray-600">Harga Modal</div>
                                  <div className="font-bold text-[#0a0b0f]">Rp25.200</div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-600">Rekomendasi</div>
                                  <div className="font-bold text-[#0fdc78]">Rp47.300</div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right side - content */}
              <div>
                <Badge className="mb-6 bg-[#0fdc78]/20 text-[#0fdc78] hover:bg-[#0fdc78]/30 border-none">Conversational AI</Badge>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-[#0a0b0f]">Lebih Dari Sekadar AI Chat</h2>
                <p className="text-gray-600 text-lg mb-8">
                  Cuanly membantu Anda menentukan harga jual, mencatat transaksi, menghitung keuntungan, dan melayani customer lebih cepat dengan bantuan AI.
                </p>
                <div className="space-y-4">
                  {features1.map((feature, i) => {
                    const Icon = feature.icon
                    return (
                      <div key={i} className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-lg bg-[#0fdc78]/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-[#0fdc78]" />
                        </div>
                        <div>
                          <div className="font-semibold text-[#0a0b0f] mb-1">{feature.title}</div>
                          <div className="text-gray-600 text-sm">{feature.desc}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 lg:py-32 bg-[#0fdc78] relative overflow-hidden">
          {/* Grid background effect */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "40px 40px"
          }}></div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-white/20 text-white hover:bg-white/30 border-none">How It Works</Badge>
              <h2 className="text-3xl lg:text-4xl font-bold text-white">Mulai Dalam 3 Langkah</h2>
            </div>
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              {[
                { 
                  image: "/thp1.png", 
                  title: "Tambah Produk", 
                  desc: "Masukkan informasi produk lengkap dengan gambar, modal, dan kategori." 
                },
                { 
                  image: "/thp2.png", 
                  title: "Hitung & Kelola", 
                  desc: "Dapatkan harga jual optimal dan pantau profit secara real-time." 
                },
                { 
                  image: "/thp3.png", 
                  title: "Gunakan AI", 
                  desc: "Jawaban siap kirim dengan cepat dan akurat berdasarkan produk Anda." 
                },
              ].map((step, i) => (
                <div key={i} className="space-y-6">
                  <div className="relative h-80 flex items-center justify-center">
                    <div className="absolute -inset-2 bg-gradient-to-r from-white/20 to-white/10 rounded-3xl blur-xl"></div>
                    <img 
                      src={step.image} 
                      alt={step.title}
                      className="relative w-full h-full object-contain rounded-2xl"
                    />
                  </div>
                  <div className="space-y-3 text-left">
                    <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    <p className="text-white/80">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Logos Section */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#0a0b0f] mb-4">Pusat Kontrol untuk Semua Stack Customer Anda</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Terintegrasi dengan semua platform favorit Anda untuk pengalaman tanpa hambatan.
              </p>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-12 mb-12">
              {logos.map((logo, i) => (
                <div key={i} className="text-2xl font-bold text-gray-400 grayscale hover:grayscale-0 transition-all">
                  {logo}
                </div>
              ))}
            </div>
            <div className="text-center">
              <Button asChild className="bg-[#0fdc78] hover:bg-[#0cd66a] text-[#0a0b0f]">
                <Link href="/register">Mulai Sekarang</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 lg:py-32 bg-gradient-to-br from-[#0a0b0f] to-[#0f1118]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Apa yang Klien Kami Katakan</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((t, i) => (
                <Card key={i} className="bg-white/5 border-white/10">
                  <CardContent className="pt-6">
                    <div className="flex gap-8">
                      <div className="flex-1">
                        <p className="text-white/70 mb-6">"{t.text}"</p>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#0fdc78] flex items-center justify-center font-bold text-[#0a0b0f]">
                            {t.logo}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{t.name}</div>
                            <div className="text-white/60 text-sm">{t.company}</div>
                          </div>
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col gap-4">
                        {["linkedin", "stripe", "dropbox", "atlassian", "zoom"].map((logo, j) => (
                          <div key={j} className="px-4 py-2 rounded-lg bg-[#0fdc78]/10 border border-[#0fdc78]/20">
                            <div className="text-sm font-medium text-white capitalize">{logo}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 lg:py-32 bg-white text-[#0a0b0f]">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-center mb-12">Pilih Paket Anda</h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, i) => (
                <Card key={i} className={`relative border-gray-200 ${plan.popular ? 'border-[#0fdc78] scale-105 shadow-lg shadow-[#0fdc78]/10' : ''}`}>
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <Badge className="bg-[#0fdc78] text-white">POPULER</Badge>
                    </div>
                  )}
                  <CardHeader className="relative">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <p className="text-3xl font-bold text-[#0fdc78] mt-2">{plan.price}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-[#0fdc78]" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button asChild className={`w-full ${plan.popular ? 'bg-[#0fdc78] hover:bg-[#0cd66a] text-[#0a0b0f]' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}>
                      <Link href="/register">{plan.cta}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 lg:py-32 bg-[#0f1118] relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/10 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-white/10 rounded-full"></div>
          </div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div>
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4">Mulai Demo AI Seller Assistant Anda</h2>
                  <p className="text-white/60">
                    Bergabung dengan ribuan seller yang sudah merasakan manfaatnya.
                  </p>
                </div>
                <Button size="lg" asChild className="bg-[#0fdc78] hover:bg-[#0cd66a] text-[#0a0b0f] font-semibold whitespace-nowrap">
                  <Link href="/register">Daftar Gratis</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-[#0a0b0f]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ChartNoAxesCombined className="h-5 w-5 text-[#0fdc78]" />
            <span className="font-bold text-white">Cuanly</span>
          </div>
          <p className="text-sm text-white/50">
            © 2024 Cuanly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}