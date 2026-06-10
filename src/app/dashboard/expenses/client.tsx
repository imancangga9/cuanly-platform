"use client"

import { useActionState } from "react"
import { createExpense, deleteExpense } from "@/actions/expenses"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Receipt, Trash2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface Expense {
  id: string
  name: string
  category: string
  amount: number
  date: string
}

const categories = [
  { value: "marketing", label: "Marketing" },
  { value: "operasional", label: "Operasional" },
]

export function ExpensesClient({ expenses }: { expenses: Expense[] }) {
  const [state, formAction, pending] = useActionState(createExpense, undefined)

  const handleDelete = async (id: string) => {
    if (confirm("Hapus biaya ini?")) {
      await deleteExpense(id)
    }
  }

  const totalByCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Biaya</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" />
              Tambah Biaya
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Biaya Baru</DialogTitle>
            </DialogHeader>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Biaya</Label>
                <Input id="name" name="name" placeholder="Facebook Ads" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <select
                  id="category"
                  name="category"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  required
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input id="amount" name="amount" type="number" placeholder="50000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Tanggal</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? "Menyimpan..." : "Simpan Biaya"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(totalByCategory).length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.entries(totalByCategory).map(([cat, total]) => (
            <Card key={cat}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground capitalize">{cat}</p>
                <p className="text-2xl font-bold">{formatCurrency(total)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Receipt className="h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Belum ada biaya</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{expenses.length} Pengeluaran</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-medium">{expense.name}</p>
                    <div className="mt-1 flex gap-2">
                      <Badge variant="secondary" className="capitalize">{expense.category}</Badge>
                      <span className="text-xs text-muted-foreground">{formatDate(expense.date)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-medium text-destructive">{formatCurrency(Number(expense.amount))}</p>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
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
