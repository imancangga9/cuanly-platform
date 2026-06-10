import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChartNoAxesCombined, Calculator, BarChart3, Shield } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <ChartNoAxesCombined className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold">Cuanly</span>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" asChild>
            <Link href="/login">Masuk</Link>
          </Button>
          <Button asChild>
            <Link href="/register">Daftar Gratis</Link>
          </Button>
        </div>
      </header>
      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center px-6 py-24 text-center">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Hitung Harga, Kelola Profit, Kembangkan Bisnis
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Platform all-in-one untuk UMKM menghitung harga jual, mencatat transaksi, dan menganalisa keuntungan secara real-time.
          </p>
          <div className="mt-8 flex gap-4">
            <Button size="lg" asChild>
              <Link href="/register">Mulai Gratis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
          </div>
        </section>
        <section className="container mx-auto grid gap-6 px-6 pb-24 sm:grid-cols-3">
          <div className="rounded-xl border p-6 text-center">
            <Calculator className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Smart Pricing</h3>
            <p className="text-sm text-muted-foreground">Hitung harga jual otomatis dengan kalkulasi modal, margin, dan biaya marketplace.</p>
          </div>
          <div className="rounded-xl border p-6 text-center">
            <BarChart3 className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Dashboard Real-time</h3>
            <p className="text-sm text-muted-foreground">Pantau revenue, profit, dan biaya marketing dalam satu tampilan dashboard.</p>
          </div>
          <div className="rounded-xl border p-6 text-center">
            <Shield className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h3 className="mb-2 font-semibold">Data Terisolasi</h3>
            <p className="text-sm text-muted-foreground">Setiap user memiliki data bisnis sendiri yang aman dan terenkripsi.</p>
          </div>
        </section>
      </main>
    </div>
  )
}
