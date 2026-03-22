"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Search, Package, AlertTriangle, CheckCircle2, Edit2 } from "lucide-react"

export default function EmployeeInventoryPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { products, updateProduct } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [newStock, setNewStock] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const canUpdateStock = user?.department?.toLowerCase() === "control"

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

  const handleUpdateStock = () => {
    if (editingProduct && newStock !== "") {
      updateProduct(editingProduct.id, { stock: Number(newStock) })
      setIsDialogOpen(false)
      setEditingProduct(null)
      setNewStock("")
    }
  }

  const openEditDialog = (product: any) => {
    setEditingProduct(product)
    setNewStock(String(product.stock))
    setIsDialogOpen(true)
  }

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || p.category === filterCategory
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "low" && p.stock <= p.minStock) ||
      (filterStatus === "ok" && p.stock > p.minStock)
    return matchesSearch && matchesCategory && matchesStatus
  })

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
            <p className="text-muted-foreground">Manage and update stock levels</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-border">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{products.length}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {totalStock.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Stock Units</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{lowStockCount}</p>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ok">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const isLowStock = product.stock <= product.minStock
            return (
              <Card
                key={product.id}
                className={`border-border flex flex-col ${isLowStock ? "border-destructive/30" : ""}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{product.name}</CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </div>
                    <Badge
                      className={
                        isLowStock
                           ? "bg-destructive/10 text-destructive"
                          : "bg-accent/10 text-accent"
                      }
                    >
                      {isLowStock ? "Low Stock" : "In Stock"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 flex-1">
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Current Stock</span>
                      <span className={`font-medium ${isLowStock ? "text-destructive" : "text-foreground"}`}>
                        {product.stock.toLocaleString()} {product.unit}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Minimum Required</span>
                      <span className="font-medium text-foreground">
                        {product.minStock.toLocaleString()} {product.unit}
                      </span>
                    </div>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Stock Level</span>
                      <span>
                        {Math.round((product.stock / (product.minStock * 5)) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isLowStock ? "bg-destructive" : "bg-accent"
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (product.stock / (product.minStock * 5)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {canUpdateStock ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 mt-2"
                      onClick={() => openEditDialog(product)}
                    >
                      <Edit2 className="h-4 w-4" />
                      Update Stock
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full gap-2 mt-2 opacity-50 cursor-not-allowed"
                      disabled
                    >
                      <Edit2 className="h-4 w-4" />
                      Update Stock (Control Only)
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Update Stock Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Update Stock Level</DialogTitle>
              <DialogDescription>
                Adjust the current stock for <strong>{editingProduct?.name}</strong>.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="stock">New Stock Quantity ({editingProduct?.unit})</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder="Enter quantity"
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdateStock}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
