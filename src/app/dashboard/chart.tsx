"use client"

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"
import { formatCurrency } from "@/lib/utils"

interface ChartData {
  date: string
  profit: number
}

export function DashboardChart({ data }: { data: ChartData[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        Belum ada data profit
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="oklch(0.6 0.2 150)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="oklch(0.6 0.2 150)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.269 0 0)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: "oklch(0.708 0 0)" }}
          tickFormatter={(v) => new Date(v).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "oklch(0.708 0 0)" }}
          tickFormatter={(v) => formatCurrency(v)}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "oklch(0.205 0 0)",
            border: "1px solid oklch(0.269 0 0)",
            borderRadius: "8px",
            fontSize: "13px",
          }}
          labelFormatter={(v) => new Date(v).toLocaleDateString("id-ID", { dateStyle: "medium" })}
          formatter={(value: number) => [formatCurrency(value), "Profit"]}
        />
        <Area
          type="monotone"
          dataKey="profit"
          stroke="oklch(0.6 0.2 150)"
          strokeWidth={2}
          fill="url(#profitGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
