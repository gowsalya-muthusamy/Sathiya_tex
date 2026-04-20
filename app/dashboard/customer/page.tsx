"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-store"
import Link from "next/link"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  Package, 
  ArrowRight,
  TrendingUp,
  History
} from "lucide-react"

export default function CustomerDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { orders } = useData()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "customer")) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  // Calculate statistics
  const customerOrders = orders.filter(o => o.customerId === user.id)
  const pendingOrders = customerOrders.filter(o => o.status === "pending").length
  const recentOrders = [...customerOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const stats = [
    {
      title: "Total Orders",
      value: customerOrders.length,
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Active Orders",
      value: pendingOrders,
      icon: Clock,
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending": return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">Pending</Badge>
      case "processing": return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Processing</Badge>
      case "shipped": return <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/20">Shipped</Badge>
      case "delivered": return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Delivered</Badge>
      default: return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl bg-primary px-6 py-10 text-primary-foreground sm:px-12 sm:py-16">
          <div className="relative z-10">
            <h1 className="text-3xl font-bold sm:text-4xl">Welcome back, {user.name}!</h1>
            <p className="mt-2 max-w-xl text-primary-foreground/80 sm:text-lg">
              Manage your orders, browse our premium textile collection, and track your shipments all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/dashboard/customer/products">
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                <Link href="/dashboard/customer/orders">View My Orders</Link>
              </Button>
            </div>
          </div>
          <div className="absolute right-0 top-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {stats.map((stat, i) => (
            <Card key={i} className="border-border">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <h3 className="text-2xl font-bold">{stat.value}</h3>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <div>
                <CardTitle className="text-xl font-bold">Recent Orders</CardTitle>
                <CardDescription>Your last few purchases</CardDescription>
              </div>
              <History className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {recentOrders.length > 0 ? (
                <div className="space-y-6">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{order.id}</p>
                          <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">₹{order.total.toLocaleString()}</p>
                        {getStatusBadge(order.status)}
                      </div>
                    </div>
                  ))}
                  <Button asChild variant="ghost" className="w-full text-muted-foreground hover:text-primary">
                    <Link href="/dashboard/customer/orders" className="flex items-center justify-center gap-2">
                      View all orders <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="mb-4 rounded-full bg-muted p-4">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="font-medium text-foreground">No orders yet</p>
                  <p className="text-sm text-muted-foreground">Start shopping to see your orders here!</p>
                  <Button asChild variant="outline" className="mt-4" size="sm">
                    <Link href="/dashboard/customer/products">Browse Products</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Links / Navigation */}
          <div className="space-y-4">
            <Card className="border-border bg-accent/5 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold">Product Categories</CardTitle>
                <CardDescription>Explore our diverse range of fabrics</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                {["Cotton", "Silk", "Linen", "Denim"].map((cat) => (
                  <Button
                    key={cat}
                    variant="outline"
                    className="justify-start border-white/50 bg-white/30 backdrop-blur-sm hover:bg-white/50 h-auto py-4 px-4"
                    asChild
                  >
                    <Link href={`/dashboard/customer/products?search=${cat.toLowerCase()}`}>
                      <div className="flex flex-col items-start gap-1">
                        <span className="font-semibold">{cat}</span>
                        <span className="text-xs text-muted-foreground">Premium quality</span>
                      </div>
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-accent/5 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold">My Profile</CardTitle>
                <CardDescription>Your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Phone</p>
                  <p className="text-sm font-medium">{user.phone || "Not provided"}</p>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                  <Link href="/dashboard/customer/settings">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">ST</span>
                  About Sathiya Tex
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are committed to providing the finest quality textiles to our customers. Our collections are sourced from the best weavers and craftsmen.
                </p>
                <Button variant="link" className="px-0 mt-2 text-primary" asChild>
                  <Link href="/about">Learn more about us <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
