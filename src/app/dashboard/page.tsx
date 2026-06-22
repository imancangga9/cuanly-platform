import { createClient } from "@/lib/supabase/server"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Package, ShoppingCart, Receipt } from "lucide-react"
import { cn, formatCurrency, formatDate } from "@/lib/utils"
import { DashboardChart } from "./chart"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: transactions } = await supabase
    .from("transactions")
    .select(`
      *,
      transaction_items(*),
      transaction_adjustments(*)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100)

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .eq("user_id", user.id)

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)

  // Calculate totals from V2 transactions schema
  const totalRevenue = (transactions || []).reduce((s, t) => s + Number(t.subtotal), 0)
  const totalProfit = (transactions || []).reduce((s, t) => s + Number(t.net_profit), 0)
  const totalExpenses = (expenses || []).reduce((s, e) => s + Number(e.amount), 0)
  const totalProducts = (products || []).length
  const totalTransactions = (transactions || []).length
  const netProfit = totalProfit - totalExpenses

  // Daily profit from net_profit
  const dailyProfit = (transactions || []).reduce<Record<string, number>>((acc, t) => {
    const day = new Date(t.created_at).toISOString().slice(0, 10)
    acc[day] = (acc[day] || 0) + Number(t.net_profit)
    return acc
  }, {})

  const chartData = Object.entries(dailyProfit)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-30)
    .map(([date, profit]) => ({ date, profit }))

  // Product sales from transaction_items
  const productSales = (transactions || []).reduce<Record<string, number>>((acc, t) => {
    if (t.transaction_items) {
      for (const item of t.transaction_items) {
        const name = item.product_name_snapshot || "Unknown"
        acc[name] = (acc[name] || 0) + Number(item.qty)
      }
    }
    return acc
  }, {})

  const topProducts = Object.entries(productSales)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const recentTransactions = (transactions || []).slice(0, 5)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Revenue" value={formatCurrency(totalRevenue)} icon={DollarSign} trend="up" />
        <StatCard title="Gross Profit" value={formatCurrency(totalProfit)} icon={TrendingUp} />
        <StatCard title="Biaya" value={formatCurrency(totalExpenses)} icon={Receipt} trend={totalExpenses > 0 ? "down" : undefined} description={`${expenses?.length || 0} pengeluaran`} />
        <StatCard title="Net Profit" value={formatCurrency(netProfit)} icon={netProfit >= 0 ? TrendingUp : TrendingDown} description={`Dari ${totalTransactions} transaksi`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Profit Harian</CardTitle>
          </CardHeader>
          <CardContent>
            <DashboardChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map(([name, qty]) => (
                  <div key={name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{name}</span>
                    </div>
                    <Badge variant="secondary">{qty} terjual</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaksi Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada transaksi</p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((t) => {
                // Get first product name for display
                const firstProductName = t.transaction_items?.[0]?.product_name_snapshot || "Produk"
                const hasMultipleItems = t.transaction_items && t.transaction_items.length > 1
                
                return (
                  <div key={t.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">
                        {firstProductName}
                        {hasMultipleItems && <span className="text-muted-foreground"> +{t.transaction_items.length - 1} lainnya</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t.channel || "-"} &middot; {t.invoice_number ? `#${t.invoice_number}` : ""} {formatDate(t.created_at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(Number(t.subtotal))}</p>
                      <p className={cn("text-xs", Number(t.net_profit) >= 0 ? "text-emerald-500" : "text-red-500")}>
                        {Number(t.net_profit) >= 0 ? "+" : ""}{formatCurrency(Number(t.net_profit))}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

