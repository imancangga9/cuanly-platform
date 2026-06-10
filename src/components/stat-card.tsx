import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  description?: string
  trend?: "up" | "down"
}

export function StatCard({ title, value, icon: Icon, description, trend }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={cn(
            "rounded-full p-2",
            trend === "up" ? "bg-emerald-500/10" : trend === "down" ? "bg-red-500/10" : "bg-primary/10",
          )}>
            <Icon className={cn(
              "h-4 w-4",
              trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-primary",
            )} />
          </div>
        </div>
        <p className="mt-2 text-2xl font-bold">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
