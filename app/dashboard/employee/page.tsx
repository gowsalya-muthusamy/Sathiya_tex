"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ClipboardList, Package, Clock, CheckCircle2, TrendingUp } from "lucide-react"

export default function EmployeeDashboard() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { orders, employees, products } = useData()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "employee")) {
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

  // Find employee details
  const employeeDetails = employees.find(
    (e) => e.email === user.email || e.name === user.name
  )

  // Find assigned tasks (case-insensitive)
  const assignedOrders = orders.filter(
    (o) => 
      o.assignedEmployee?.toLowerCase() === user.name.toLowerCase() || 
      o.assignedEmployee?.toLowerCase() === employeeDetails?.name.toLowerCase()
  )

  const pendingTasks = assignedOrders.filter((o) => o.status === "pending" || o.status === "processing")
  const completedTasks = assignedOrders.filter((o) => o.status === "shipped" || o.status === "delivered")

  // Calculate dynamic workload: 20% per active task (pending, processing, shipped)
  const activeTaskCount = assignedOrders.filter(o => o.status !== "delivered").length
  const dynamicWorkload = Math.min(100, activeTaskCount * 20)

  const stats = [
    {
      title: "Assigned Tasks",
      value: assignedOrders.length,
      icon: ClipboardList,
      description: "Total assignments",
    },
    {
      title: "Pending",
      value: pendingTasks.length,
      icon: Clock,
      description: "Tasks to complete",
    },
    {
      title: "Completed",
      value: completedTasks.length,
      icon: CheckCircle2,
      description: "Tasks finished",
    },
    {
      title: "Workload",
      value: `${dynamicWorkload}%`,
      icon: TrendingUp,
      description: "Current capacity",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Welcome, {user.name}</h1>
            <p className="text-muted-foreground">
              {employeeDetails?.department || "Department"} Department
            </p>
          </div>
          {employeeDetails && (
            <Badge
              className={
                employeeDetails.status === "active"
                  ? "bg-accent/10 text-accent"
                  : employeeDetails.status === "on-leave"
                  ? "bg-chart-5/10 text-chart-5"
                  : "bg-muted text-muted-foreground"
              }
            >
              {employeeDetails.status}
            </Badge>
          )}
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
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workload Indicator */}
        {employeeDetails && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Current Workload</CardTitle>
              <CardDescription>Your capacity utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Capacity</span>
                  <span className="font-medium">{dynamicWorkload}%</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      dynamicWorkload > 80
                        ? "bg-destructive"
                        : dynamicWorkload > 60
                        ? "bg-chart-5"
                        : "bg-accent"
                    }`}
                    style={{ width: `${dynamicWorkload}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {dynamicWorkload > 80
                    ? "High workload - Consider delegating tasks"
                    : dynamicWorkload > 60
                    ? "Moderate workload - Good balance"
                    : "Light workload - Available for more tasks"}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {employeeDetails && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
              <CardDescription>Registered competencies</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {employeeDetails.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Tasks */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Active Tasks</CardTitle>
            <CardDescription>Orders assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="mb-4 h-12 w-12 text-accent" />
                <p className="font-medium text-foreground">No pending tasks</p>
                <p className="text-sm text-muted-foreground">{"You're all caught up!"}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingTasks.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-lg border border-border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{order.id}</p>
                          <Badge
                            className={
                              order.status === "pending"
                                ? "bg-chart-5/10 text-chart-5"
                                : "bg-primary/10 text-primary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Customer: {order.customerName}
                        </p>
                      </div>
                      <span className="font-medium text-foreground">
                        ₹{order.total.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-medium text-muted-foreground">Items:</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {order.products.map((item, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {item.productName} ({item.quantity})
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert for employees */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
            <CardDescription>Products that need attention</CardDescription>
          </CardHeader>
          <CardContent>
            {products.filter((p) => p.stock <= p.minStock).length === 0 ? (
              <div className="flex items-center gap-3 rounded-lg bg-accent/10 p-4">
                <CheckCircle2 className="h-5 w-5 text-accent" />
                <p className="text-sm text-foreground">All inventory levels are healthy</p>
              </div>
            ) : (
              <div className="space-y-3">
                {products
                  .filter((p) => p.stock <= p.minStock)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-destructive" />
                        <div>
                          <p className="font-medium text-foreground">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-destructive">
                          {product.stock} {product.unit}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Min: {product.minStock}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
