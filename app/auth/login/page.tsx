"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { Loader2, LogIn } from "lucide-react"

const demoAccounts = [
  { role: "Owner", email: "owner@sathiyatex.com", password: "owner123" },
  { role: "Customer", email: "hari@gmail.com", password: "customer123" },
  { role: "Employee", email: "employee@sathiyatex.com", password: "employee123" },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await login(formData.email, formData.password)

    if (!result.success) {
      setError(result.error ?? "Invalid email or password")
      return
    }

    const signedInUser = result.user
    if (!signedInUser) return

    switch (signedInUser.role) {
      case "owner":
        router.push("/dashboard/owner")
        break
      case "customer":
        router.push("/dashboard/customer")
        break
      case "employee":
        router.push("/dashboard/employee")
        break
    }
  }

  const handleDemoLogin = async (email: string, password: string) => {
    setFormData({ email, password })
    const result = await login(email, password)
    if (!result.success) {
      setError(result.error ?? "Invalid email or password")
      return
    }

    const signedInUser = result.user
    if (!signedInUser) return

    switch (signedInUser.role) {
      case "owner":
        router.push("/dashboard/owner")
        break
      case "customer":
        router.push("/dashboard/customer")
        break
      case "employee":
        router.push("/dashboard/employee")
        break
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">ST</span>
            </div>
            <span className="text-xl font-bold text-foreground">Sathiya Tex</span>
          </Link>
          <Link href="/auth/signup">
            <Button variant="ghost" size="sm">
              {"Don't have an account? Sign Up"}
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to your Sathiya Tex account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
