"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { Loader2, LogIn, Mail } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"


export default function LoginPage() {
  const router = useRouter()
  const { login, resetPasswordEmail, isLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetStatus, setResetStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [resetError, setResetError] = useState("")

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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return

    setResetStatus("loading")
    setResetError("")

    const result = await resetPasswordEmail(resetEmail)

    if (result.success) {
      setResetStatus("success")
      setTimeout(() => {
        setIsResetDialogOpen(false)
        setResetStatus("idle")
        setResetEmail("")
      }, 3000)
    } else {
      setResetStatus("error")
      setResetError(result.error ?? "Failed to send reset email")
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button 
                      variant="link" 
                      className="h-auto p-0 text-xs text-primary"
                      type="button"
                      onClick={() => setIsResetDialogOpen(true)}
                    >
                      Forgot Password?
                    </Button>
                  </div>
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

          {/* Forgot Password Dialog */}
          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogDescription>
                  Enter your email address and we'll send you a link to reset your password.
                </DialogDescription>
              </DialogHeader>
              {resetStatus === "success" ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/20 text-accent">
                    <Mail className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Check your email</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    We've sent a password reset link to <span className="font-bold">{resetEmail}</span>
                  </p>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="name@example.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  {resetStatus === "error" && (
                    <p className="text-xs text-destructive">{resetError}</p>
                  ) }
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      type="button"
                      onClick={() => setIsResetDialogOpen(false)}
                      disabled={resetStatus === "loading"}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={resetStatus === "loading" || !resetEmail}>
                      {resetStatus === "loading" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </div>
  )
}
