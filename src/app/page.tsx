'use client'

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
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
  const [showAllFaqs, setShowAllFaqs] = useState(false)
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
      question: "Apa itu Cuanly?",
      answer: "Cuanly adalah platform untuk membantu seller dan UMKM mengelola bisnis dalam satu dashboard. Mulai dari menghitung harga jual, mencatat transaksi, memantau keuntungan, hingga membalas customer lebih cepat menggunakan AI Seller Assistant."
    },
    {
      question: "Apakah Cuanly benar-benar gratis?",
      answer: "Ya. Semua fitur utama seperti Kelola Produk, Smart Pricing Calculator, Pencatatan Transaksi, Laporan Profit dapat digunakan gratis tanpa batas. Anda hanya membayar jika ingin menggunakan AI Seller Assistant lebih banyak melalui sistem AI Credit."
    },
    {
      question: "Apa itu AI Seller Assistant?",
      answer: "AI Seller Assistant adalah fitur AI yang membantu membuat balasan customer berdasarkan informasi produk yang Anda miliki. Cukup pilih produk, masukkan pertanyaan customer, lalu AI akan membuat jawaban yang siap dikirim dalam hitungan detik."
    },
    {
      question: "Bagaimana cara kerja AI Credit?",
      answer: "Setiap kali AI membuat satu balasan customer, akan menggunakan 1 AI Credit. Contoh: 1 Balasan AI = 1 AI Credit, 25 Balasan AI = 25 AI Credit. Dengan sistem ini, Anda hanya membayar sesuai penggunaan AI."
    },
    {
      question: "Berapa AI Credit gratis yang saya dapatkan?",
      answer: "Setiap akun mendapatkan 25 AI Credit gratis setiap bulan. Credit ini dapat digunakan untuk mencoba AI Seller Assistant tanpa biaya tambahan."
    },
    {
      question: "Bagaimana jika AI Credit saya habis?",
      answer: "Anda tetap dapat menggunakan seluruh fitur gratis Cuanly seperti mengelola produk, menghitung harga jual, mencatat transaksi, dan melihat laporan profit. Jika ingin terus menggunakan AI Seller Assistant, Anda cukup membeli paket AI Credit sesuai kebutuhan."
    },
    {
      question: "Apakah AI menjawab sesuai produk saya?",
      answer: "Ya. AI menggunakan informasi yang Anda simpan, seperti Nama Produk, Deskripsi Produk, Product Knowledge, Custom Prompt Customer Service. Sehingga jawaban yang dihasilkan lebih relevan, akurat, dan sesuai dengan produk yang sedang ditanyakan customer."
    },
    {
      question: "Bahasa apa saja yang didukung oleh AI Seller Assistant?",
      answer: "Saat ini Cuanly AI mendukung: 🇮🇩 Bahasa Indonesia, 🇬🇧 English, 🇲🇾 Bahasa Melayu. Kami akan terus menambahkan dukungan bahasa baru pada pembaruan berikutnya."
    },
    {
      question: "Apakah saya bisa mengatur gaya bahasa balasan AI?",
      answer: "Bisa. Anda dapat membuat Custom Prompt agar AI menjawab sesuai karakter bisnis Anda, misalnya Ramah & Santai, Formal & Profesional, Soft Selling, Hard Selling, Fokus Closing, Customer Service Marketplace. Dengan begitu, balasan AI akan tetap konsisten dengan gaya komunikasi brand Anda."
    },
    {
      question: "Apakah data bisnis saya aman?",
      answer: "Ya. Setiap akun hanya dapat mengakses data miliknya sendiri. Seluruh data produk, transaksi, dan pengaturan AI dipisahkan untuk setiap pengguna sehingga tetap aman dan privat."
    },
    {
      question: "Apakah saya bisa menggunakan Cuanly untuk banyak produk?",
      answer: "Tentu. Anda dapat menambahkan dan mengelola produk sebanyak yang dibutuhkan dalam satu akun. AI Seller Assistant juga dapat digunakan untuk semua produk yang telah Anda simpan."
    },
    {
      question: "Apakah saya harus menghubungkan marketplace?",
      answer: "Tidak. Pada versi pertama (V1), Cuanly dapat langsung digunakan tanpa integrasi marketplace. Anda cukup memasukkan produk dan transaksi secara manual. Integrasi dengan marketplace akan hadir pada versi berikutnya."
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
      <header className="flex items-center justify-between border-b border-white/10 py-4 sticky top-0 z-50 bg-[#0a0b0f]/80 backdrop-blur-xl">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/cuanly-logo-green-white.png"
              alt="Cuanly Logo"
              className="h-8 w-auto"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" asChild className="text-white hover:text-white hover:bg-white/10">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild className="bg-[#0fdc78] hover:bg-[#0cd66a] text-[#0a0b0f] font-semibold">
              <Link href="/register">Daftar Gratis</Link>
            </Button>
          </div>
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

        {/* New Section: Gratis Untuk Mengelola Bisnis */}
        <section className="py-20 lg:py-32 bg-[#F3FDF8]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-[#0a0b0f] mb-4">Gratis Untuk Mengelola Bisnis</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Kelola produk, hitung harga jual, catat transaksi, dan pantau profit secara gratis tanpa batas. Bayar hanya jika ingin menggunakan AI Seller Assistant lebih banyak.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "💰 Harga Jual Tidak Lagi Asal Tebak",
                  desc: "Hitung harga jual yang menguntungkan berdasarkan biaya bisnis Anda."
                },
                {
                  title: "📊 Profit Terlihat Lebih Jelas",
                  desc: "Ketahui berapa keuntungan yang benar-benar masuk ke kantong Anda."
                },
                {
                  title: "📦 Semua Data Bisnis Tersimpan Rapi",
                  desc: "Produk, transaksi, dan laporan dalam satu dashboard."
                },
                {
                  title: "🤖 Customer Terlayani Lebih Cepat",
                  desc: "AI membantu membuat balasan yang siap kirim dalam hitungan detik."
                },
                {
                  title: "⚡ Mudah Digunakan Sejak Hari Pertama",
                  desc: "Tidak perlu belajar sistem yang rumit atau membuat spreadsheet sendiri."
                },
                {
                  title: "🎁 Gratis Untuk Mulai Berkembang",
                  desc: "Gunakan fitur bisnis utama tanpa biaya dan rasakan manfaatnya sebelum upgrade AI."
                }
              ].map((point, i) => (
                <Card key={i} className="bg-white shadow-lg border-none">
                  <CardContent className="pt-6">
                    <h3 className="text-xl font-bold text-[#0a0b0f] mb-3">{point.title}</h3>
                    <p className="text-gray-600">{point.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* AI SELLER ASSISTANT Section */}
        <section className="py-20 lg:py-32 bg-[#0fdc78] text-[#0a0b0f]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-[#0a0b0f]/20 text-[#0a0b0f] hover:bg-[#0a0b0f]/30 border-none">✨ AI SELLER ASSISTANT</Badge>
              <h2 className="text-3xl lg:text-5xl font-bold mb-4">
                Customer Bertanya.<br />
                AI Membantu Menjawab.
              </h2>
              <p className="text-[#0a0b0f]/80 max-w-2xl mx-auto text-lg mb-12">
                Tidak perlu mengetik jawaban yang sama berulang kali.<br />
                Pilih produk yang ditanyakan customer, lalu biarkan Cuanly AI membuat balasan yang cepat, akurat, dan sesuai informasi produk Anda.
              </p>
              
              {/* Chat Demo */}
              <div className="max-w-3xl mx-auto mb-16">
                <Card className="bg-white border-none shadow-xl p-6">
                  <CardContent className="space-y-6">
                    {/* Customer Message */}
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 shadow-md max-w-[80%]">
                        <p className="text-[#0a0b0f]">Kak, produk ini aman untuk keramik?</p>
                      </div>
                    </div>
                    {/* AI Message */}
                    <div className="flex gap-3 justify-end">
                      <div className="bg-[#0fdc78] rounded-2xl rounded-tr-none p-4 max-w-[80%] text-right">
                        <p className="text-[#0a0b0f] font-medium">Halo Kak 😊</p>
                        <p className="text-[#0a0b0f] mt-2">
                          Produk ini aman digunakan untuk keramik dan berbagai permukaan rumah tangga lainnya. Formula aktifnya membantu mengangkat kerak dan noda membandel tanpa merusak permukaan.
                        </p>
                        <p className="text-[#0a0b0f] mt-2">Jika ada pertanyaan lain, saya siap membantu ya Kak 🙏</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* 3 Benefits */}
              <div className="grid md:grid-cols-3 gap-8 mb-16">
                {[
                  {
                    icon: Zap,
                    title: "Balas Customer Dalam Hitungan Detik",
                    desc: "Tidak perlu mengetik ulang jawaban yang sama setiap hari.",
                  },
                  {
                    icon: Bot,
                    title: "Jawaban Sesuai Produk",
                    desc: "AI menggunakan informasi produk yang Anda simpan di Cuanly.",
                  },
                  {
                    icon: Check,
                    title: "Konsisten & Lebih Profesional",
                    desc: "Memberikan jawaban yang rapi, sopan, dan siap kirim ke customer.",
                  },
                ].map((benefit, i) => {
                  const Icon = benefit.icon;
                  return (
                    <Card key={i} className="bg-white border-none shadow-lg hover:shadow-xl transition-shadow text-center">
                      <CardContent className="pt-6">
                        <div className="w-12 h-12 rounded-full bg-[#0fdc78]/20 flex items-center justify-center mb-4 mx-auto">
                          <Icon className="text-[#0fdc78]" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-[#0a0b0f]">{benefit.title}</h3>
                        <p className="text-gray-600">{benefit.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        
        {/* Common Questions Section */}
        <section className="py-20 lg:py-32 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h3 className="text-2xl lg:text-3xl font-bold mb-8 text-[#0a0b0f]">Bayangkan Jika Anda Harus Menjawab Ini Setiap Hari...</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {[
                  "Kak ready?",
                  "Kak aman untuk kulit sensitif?",
                  "Kak cara pakainya gimana?",
                  "Kak ada COD?",
                  "Kak bisa untuk keramik?",
                  "Kak berapa lama hasilnya terlihat?",
                ].map((question, i) => (
                    <div key={i} className="bg-[#0fdc78]/20 hover:bg-[#0fdc78] transition-colors rounded-xl px-6 py-4">
                      <p className="font-medium text-[#0a0b0f]">{question}</p>
                    </div>
                  ))}
              </div>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">
                Dengan Cuanly AI Seller Assistant, cukup pilih produk dan kirim pertanyaan customer.<br />
                Balasan siap digunakan dalam beberapa detik.
              </p>
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
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                {/* Left Content */}
                <div className="flex-1">
                  <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-white">Jualan Lebih Cerdas.<br />Mulai Dengan AI Seller Assistant.</h2>
                  <p className="text-white/70 mb-8 text-lg">
                    Cukup pilih produk dan masukkan pertanyaan customer. Cuanly AI akan membantu membuat balasan yang siap dikirim dalam hitungan detik.
                  </p>
                  <Button size="lg" asChild className="bg-[#0fdc78] hover:bg-[#0cd66a] text-[#0a0b0f] font-semibold whitespace-nowrap mb-6">
                    <Link href="/register">Dapatkan 25 AI Credit Gratis</Link>
                  </Button>
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0fdc78]" />
                      <span className="text-white/70 text-sm">25 AI Credit Gratis Setiap Bulan</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0fdc78]" />
                      <span className="text-white/70 text-sm">Tidak Perlu Kartu Kredit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#0fdc78]" />
                      <span className="text-white/70 text-sm">Siap Digunakan Dalam 1 Menit</span>
                    </div>
                  </div>
                </div>
                
                {/* Right Card */}
                <Card className="w-full lg:w-80 bg-white/5 border-white/10">
                  <CardContent className="p-8">
                    <div className="text-center mb-6">
                      <div className="text-3xl mb-2">🎁</div>
                      <h3 className="text-xl font-bold text-white">Free Plan</h3>
                    </div>
                    <div className="space-y-4 mb-8">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-[#0fdc78]">25 AI Credit</div>
                        <div className="text-white/60">/ Bulan</div>
                      </div>
                      <div className="text-center text-white/70">
                        ≈ 25 Balasan Customer
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-white/70">
                          <Check className="w-4 h-4 text-[#0fdc78]" />
                          <span>Gratis Selamanya</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/70">
                          <Check className="w-4 h-4 text-[#0fdc78]" />
                          <span>Tanpa Kartu Kredit</span>
                        </div>
                      </div>
                    </div>
                    <Button asChild className="w-full bg-[#0fdc78] hover:bg-[#0cd66a] text-[#0a0b0f] font-semibold">
                      <Link href="/register">Daftar Gratis</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-20 lg:py-32 bg-white text-[#0a0b0f]">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">Semua yang Perlu Anda Ketahui Tentang Cuanly</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Masih ada pertanyaan? Berikut beberapa hal yang paling sering ditanyakan oleh seller sebelum mulai menggunakan Cuanly.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4">
              {(showAllFaqs ? faqs : faqs.slice(0, 5)).map((faq, i) => (
                <Card key={i} className="bg-gray-50 border-none">
                  <CardContent className="p-6">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between text-left"
                    >
                      <span className="font-semibold text-lg text-[#0a0b0f]">{faq.question}</span>
                      {openFaq === i ? (
                        <ChevronUp className="w-5 h-5 text-[#0fdc78]" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {openFaq === i && (
                      <div className="mt-4 text-gray-600">
                        {faq.answer}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {!showAllFaqs && faqs.length > 5 && (
              <div className="text-center mt-12">
                <Button
                  onClick={() => setShowAllFaqs(true)}
                  variant="ghost"
                  className="text-[#0a0b0f] hover:text-[#0fdc78] hover:bg-[#0fdc78]/10"
                >
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Lihat Semua Pertanyaan
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 bg-[#0a0b0f]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/cuanly-logo-green-white.png"
              alt="Cuanly Logo"
              className="h-6 w-auto"
            />
          </div>
          <p className="text-sm text-white/50">
            © 2026 Cuanly. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}