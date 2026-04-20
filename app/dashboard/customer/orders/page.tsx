"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Clock, Truck, CheckCircle2, ShoppingBag } from "lucide-react"

export default function CustomerOrdersPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { orders, employees } = useData()

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

  const myOrders = orders.filter((o) => o.customerId === user.id || o.customerName === user.name)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-chart-5" />
      case "processing":
        return <Package className="h-5 w-5 text-primary" />
      case "shipped":
        return <Truck className="h-5 w-5 text-chart-4" />
      case "delivered":
        return <CheckCircle2 className="h-5 w-5 text-accent" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-chart-5/10 text-chart-5"
      case "processing":
        return "bg-primary/10 text-primary"
      case "shipped":
        return "bg-chart-4/10 text-chart-4"
      case "delivered":
        return "bg-accent/10 text-accent"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusSteps = (status: string) => {
    const steps = ["pending", "processing", "shipped", "delivered"]
    const currentIndex = steps.indexOf(status)
    return steps.map((step, index) => ({
      step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }))
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {/* Orders List */}
        {myOrders.length === 0 ? (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No orders yet</h3>
              <p className="text-center text-muted-foreground">
                {"When you place orders, they'll appear here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order) => (
              <Card key={order.id} className="border-border">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-lg">{order.id}</CardTitle>
                        <CardDescription>Placed on {order.createdAt}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                      <span className="text-lg font-semibold text-foreground">
                        ₹{order.total.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Tracker */}
                  <div className="hidden sm:block">
                    <div className="flex items-center justify-between">
                      {getStatusSteps(order.status).map((step, index) => (
                        <div key={step.step} className="flex flex-1 items-center">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                step.completed
                                  ? "bg-accent text-accent-foreground"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {step.completed ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <span className="text-xs">{index + 1}</span>
                              )}
                            </div>
                            <span
                              className={`mt-1 text-xs capitalize ${
                                step.current ? "font-medium text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {step.step}
                            </span>
                          </div>
                          {index < 3 && (
                            <div
                              className={`h-0.5 flex-1 ${
                                step.completed && index < getStatusSteps(order.status).filter((s) => s.completed).length - 1
                                  ? "bg-accent"
                                  : "bg-muted"
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="rounded-lg border border-border">
                    <div className="border-b border-border bg-muted/50 px-4 py-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        Order Items ({order.products.length})
                      </span>
                    </div>
                    <div className="divide-y divide-border">
                      {order.products.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-4 py-3"
                        >
                          <div>
                            <p className="font-medium text-foreground">{item.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantity} units @ ₹{item.price}
                            </p>
                          </div>
                          <span className="font-medium text-foreground">
                            ₹{(item.quantity * item.price).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details (Address, Phone, Payment) */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <Truck className="h-4 w-4" /> Shipping Address
                      </p>
                      <p>{order.address || "No address provided"}</p>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p className="font-medium text-foreground flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4" /> Order Info
                      </p>
                      <p>Contact: {order.phone || "No phone provided"}</p>
                      <p>Payment: <span className="uppercase font-bold">{order.paymentMode || "COD"}</span></p>
                    </div>
                  </div>

                  {/* Assigned Employee */}
                  {order.assignedEmployee && (
                    <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm text-muted-foreground sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <span>Handled by:</span>
                        <Badge variant="outline">{order.assignedEmployee}</Badge>
                      </div>
                      {employees.find(e => e.name === order.assignedEmployee) && (
                        <div className="flex items-center gap-2 text-primary font-medium">
                          <span className="h-1 w-1 rounded-full bg-muted-foreground hidden sm:block" />
                          <span>Contact: {employees.find(e => e.name === order.assignedEmployee)?.phone}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
