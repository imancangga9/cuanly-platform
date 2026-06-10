"use client"

import { Suspense, useActionState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartNoAxesCombined } from "lucide-react"

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const [state, formAction, pending] = useActionState(signIn, undefined)

  return (
    <>
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="nama@email.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" placeholder="••••••••" required />
        </div>
        {(state?.error || error) && (
          <p className="text-sm text-destructive">{state?.error || (error === "auth_callback_error" ? "Gagal verifikasi. Coba lagi." : error)}</p>
        )}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Memproses..." : "Masuk"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Belum punya akun?{" "}
        <Link href="/register" className="text-primary underline-offset-4 hover:underline">
          Daftar
        </Link>
      </p>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-2">
              <ChartNoAxesCombined className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Cuanly</span>
            </div>
          </div>
          <CardTitle className="text-xl">Masuk</CardTitle>
          <CardDescription>Masukkan email dan password anda</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Memuat...</p>}>
            <LoginForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
