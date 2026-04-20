"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react"

export default function OwnerDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { products, employees, orders } = useData()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "owner")) {
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

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock)
  const activeEmployees = employees.filter((e) => e.status === "active")
  const pendingOrders = orders.filter((o) => o.status === "pending")
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

  const stats = [
    {
      title: "Total Products",
      value: products.length,
      icon: Package,
      description: `${lowStockProducts.length} low stock`,
      trend: lowStockProducts.length > 0 ? "warning" : "success",
    },
    {
      title: "Active Employees",
      value: activeEmployees.length,
      icon: Users,
      description: `${employees.length} total`,
      trend: "success",
    },
    {
      title: "Pending Orders",
      value: pendingOrders.length,
      icon: ShoppingCart,
      description: `${orders.length} total orders`,
      trend: pendingOrders.length > 3 ? "warning" : "success",
    },
    {
      title: "Total Revenue",
      value: `₹${(totalRevenue / 100000).toFixed(1)}L`,
      icon: TrendingUp,
      description: "All time",
      trend: "success",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">{"Here's what's happening with your business today."}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trend === "warning" ? (
                    <AlertTriangle className="h-3 w-3 text-chart-5" />
                  ) : (
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                  )}
                  <span className="text-muted-foreground">{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Orders & Low Stock */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest orders from customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="font-medium text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        ₹{order.total.toLocaleString()}
                      </p>
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.status === "pending"
                            ? "bg-chart-5/10 text-chart-5"
                            : order.status === "processing"
                            ? "bg-primary/10 text-primary"
                            : order.status === "shipped"
                            ? "bg-chart-4/10 text-chart-4"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Low Stock Alerts</CardTitle>
              <CardDescription>Products that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="mb-2 h-12 w-12 text-accent" />
                  <p className="text-muted-foreground">All products are well stocked!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-destructive">
                          {product.stock} {product.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Min: {product.minStock} {product.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Employee Overview */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Employee Workload</CardTitle>
            <CardDescription>Current workload distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employees.filter((e) => e.status === "active").map((employee) => (
                <div key={employee.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">
                          {employee.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{employee.name}</p>
                        <p className="text-xs text-muted-foreground">{employee.department}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-foreground">{employee.workload}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        employee.workload > 80
                          ? "bg-destructive"
                          : employee.workload > 60
                          ? "bg-chart-5"
                          : "bg-accent"
                      }`}
                      style={{ width: `${employee.workload}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
