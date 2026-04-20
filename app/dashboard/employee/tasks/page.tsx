"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Package, Truck, CheckCircle2, ClipboardList } from "lucide-react"

export default function EmployeeTasksPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { orders, employees, updateOrder } = useData()

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

  const employeeDetails = employees.find(
    (e) => e.email === user.email || e.name === user.name
  )

  // Find assigned tasks (case-insensitive)
  const assignedOrders = orders.filter(
    (o) => 
      o.assignedEmployee?.toLowerCase() === user.name.toLowerCase() || 
      o.assignedEmployee?.toLowerCase() === employeeDetails?.name.toLowerCase()
  )

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

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = ["pending", "processing", "shipped", "delivered"]
    const currentIndex = statusFlow.indexOf(currentStatus)
    return currentIndex < statusFlow.length - 1 ? statusFlow[currentIndex + 1] : null
  }

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    updateOrder(orderId, { status: newStatus as "pending" | "processing" | "shipped" | "delivered" })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Tasks</h1>
          <p className="text-muted-foreground">Manage and update your assigned orders</p>
        </div>

        {/* Task Summary */}
        <div className="grid gap-4 sm:grid-cols-4">
          {["pending", "processing", "shipped", "delivered"].map((status) => (
            <Card key={status} className="border-border">
              <CardContent className="flex items-center gap-3 pt-6">
                {getStatusIcon(status)}
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {assignedOrders.filter((o) => o.status === status).length}
                  </p>
                  <p className="text-sm capitalize text-muted-foreground">{status}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tasks List */}
        {assignedOrders.length === 0 ? (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <ClipboardList className="mb-4 h-16 w-16 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-medium text-foreground">No tasks assigned</h3>
              <p className="text-center text-muted-foreground">
                Tasks will appear here when assigned by the owner
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {assignedOrders.map((order) => {
              const nextStatus = getNextStatus(order.status)
              return (
                <Card key={order.id} className="border-border">
                  <CardHeader>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(order.status)}
                        <div>
                          <CardTitle className="text-lg">{order.id}</CardTitle>
                          <CardDescription>
                            Customer: {order.customerName} | Created: {order.createdAt}
                          </CardDescription>
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
                  <CardContent className="space-y-4">
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

                    {/* Action Button */}
                    {nextStatus && (
                      <div className="flex justify-end">
                        <Button
                          onClick={() => handleUpdateStatus(order.id, nextStatus)}
                          className="gap-2"
                        >
                          {nextStatus === "processing" && (
                            <>
                              <Package className="h-4 w-4" />
                              Start Processing
                            </>
                          )}
                          {nextStatus === "shipped" && (
                            <>
                              <Truck className="h-4 w-4" />
                              Mark as Shipped
                            </>
                          )}
                          {nextStatus === "delivered" && (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              Mark as Delivered
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {order.status === "delivered" && (
                      <div className="flex items-center gap-2 rounded-lg bg-accent/10 p-3">
                        <CheckCircle2 className="h-5 w-5 text-accent" />
                        <span className="text-sm font-medium text-accent">
                          Order completed successfully
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
