"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth, UserRole } from "@/lib/auth-context"
import { Building2, ShoppingBag, HardHat, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"

const roles: { value: UserRole; label: string; description: string; icon: React.ElementType }[] = [
  {
    value: "owner",
    label: "Business Owner",
    description: "Manage inventory, employees, and orders",
    icon: Building2,
  },
  {
    value: "customer",
    label: "Customer",
    description: "Browse products and place orders",
    icon: ShoppingBag,
  },
  {
    value: "employee",
    label: "Employee",
    description: "View assignments and update work status",
    icon: HardHat,
  },
]

export default function SignupPage() {
  const router = useRouter()
  const { signup, isLoading } = useAuth()
  const [step, setStep] = useState(1)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    department: "",
  })
  const [error, setError] = useState("")

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setStep(2)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    if (!selectedRole) return

    const result = await signup({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: selectedRole,
      department: selectedRole === "employee" ? formData.department : undefined,
      skills: selectedRole === "employee" ? [] : undefined,
    })

    if (!result.success) {
      setError(result.error ?? "Email already exists. Please try a different email.")
      return
    }

    switch (selectedRole) {
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
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Already have an account? Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-xl">
          {step === 1 ? (
            <div>
              <div className="mb-8 text-center">
                <h1 className="mb-2 text-3xl font-bold text-foreground">Create Your Account</h1>
                <p className="text-muted-foreground">Choose how you want to use Sathiya Tex</p>
              </div>
              <div className="grid gap-4">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value)}
                    className="group flex items-center gap-4 rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-primary hover:shadow-md"
                  >
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <role.icon className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground">{role.label}</h3>
                      <p className="text-sm text-muted-foreground">{role.description}</p>
                    </div>
                    <ArrowLeft className="h-5 w-5 rotate-180 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <Card className="border-border">
              <CardHeader>
                <button
                  onClick={() => setStep(1)}
                  className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to role selection
                </button>
                <CardTitle className="text-2xl">
                  Sign up as {roles.find((r) => r.value === selectedRole)?.label}
                </CardTitle>
                <CardDescription>Fill in your details to create your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
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
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {selectedRole === "employee" && (
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        name="department"
                        placeholder="e.g., Weaving, Quality Control, Production"
                        value={formData.department}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
