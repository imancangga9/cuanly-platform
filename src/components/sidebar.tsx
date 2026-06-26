"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ArrowRightLeft,
  Receipt,
  Settings,
  LogOut,
  ChartNoAxesCombined,
  X,
  Bot,
  CreditCard,
  Shield,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { signOut } from "@/actions/auth"
import { getAIWallet } from "@/actions/ai-credit"
import { useAdminCheck } from "@/components/admin-check"

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Produk", href: "/dashboard/products", icon: Package },
  { label: "Transaksi", href: "/dashboard/transactions", icon: ArrowRightLeft },
  { label: "Biaya", href: "/dashboard/expenses", icon: Receipt },
  { label: "AI Customer Service", href: "/dashboard/ai", icon: Bot },
  { label: "AI Credit", href: "/dashboard/ai-credit", icon: CreditCard },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings },
]

const adminNavItems = [
  { label: "Admin Dashboard", href: "/dashboard/admin", icon: Shield },
  { label: "User Management", href: "/dashboard/admin/users", icon: Users },
  { label: "Verifikasi Kredit", href: "/dashboard/admin/ai-credit-orders", icon: CreditCard },
  { label: "Pengaturan Global", href: "/dashboard/admin/settings", icon: Settings },
];

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [balance, setBalance] = useState<number | null>(null)
  const { isAdminUser, loading: adminLoading } = useAdminCheck()

  useEffect(() => {
    async function fetchBalance() {
      const wallet = await getAIWallet()
      if (wallet) {
        setBalance(wallet.balance)
      }
    }
    
    // Initial fetch
    fetchBalance()
    
    // Poll every 2 seconds for updates
    const intervalId = setInterval(fetchBalance, 2000)
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId)
  }, [])

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "flex w-64 flex-col border-r bg-[oklch(0.145_0_0)] text-[oklch(0.985_0_0)] transition-transform duration-200 lg:static",
          open ? "fixed inset-y-0 left-0 z-50 translate-x-0" : "fixed inset-y-0 left-0 z-50 -translate-x-full lg:translate-x-0 lg:static",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-[oklch(0.269_0_0)] px-6">
          <img
            src="/cuanly-logo-green-white.png"
            alt="Cuanly Logo"
            className="h-8 w-auto"
          />
        </div>

        {/* Credit Display */}
        <div className="px-3 py-4 border-b border-[oklch(0.269_0_0)]">
          <Link href="/dashboard/ai-credit" onClick={onClose}>
            <div className="bg-[#0fdc78]/10 rounded-lg p-3 flex items-center justify-between hover:bg-[#0fdc78]/20 transition-colors">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-[#0fdc78]" />
                <span className="text-sm font-medium">AI Credit</span>
              </div>
              <span className="bg-[#0fdc78] text-black px-2 py-1 rounded text-sm font-bold">
                {balance ?? 0}
              </span>
            </div>
          </Link>
        </div>

        <ScrollArea className="flex-1 py-4 [&_[data-radix-scroll-area-thumb]]:bg-[oklch(0.35_0_0)] [&_[data-radix-scroll-area-thumb]]:hover:bg-[oklch(0.45_0_0)]">
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-[#0fdc78] text-[oklch(0.9791_0_0)]"
                      : "text-[oklch(0.708_0_0)] hover:bg-[oklch(0.269_0_0)] hover:text-[oklch(0.985_0_0)]",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}

            {/* Admin Menu */}
            {isAdminUser && (
              <>
                <Separator className="my-2 bg-[oklch(0.269_0_0)]" />
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-[oklch(0.5_0_0)] uppercase tracking-wider">
                    Admin
                  </p>
                </div>
                {adminNavItems.map((item) => {
                  const Icon = item.icon
                  const active = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-[#0fdc78] text-[oklch(0.9791_0_0)]"
                          : "text-[oklch(0.708_0_0)] hover:bg-[oklch(0.269_0_0)] hover:text-[oklch(0.985_0_0)]",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </>
            )}
          </nav>

          <Separator className="my-4 bg-[oklch(0.269_0_0)]" />

          <div className="px-3">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-[oklch(0.708_0_0)] hover:text-[oklch(0.985_0_0)] hover:bg-[oklch(0.269_0_0)]"
              onClick={async () => {
                onClose()
                await signOut()
              }}
            >
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}
