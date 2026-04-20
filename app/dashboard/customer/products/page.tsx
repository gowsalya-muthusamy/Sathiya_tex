"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image" // 1. Added Next.js Image import
import { useAuth } from "@/lib/auth-context"
import { useData } from "@/lib/data-store"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ShoppingCart, Plus, Minus, CheckCircle2 } from "lucide-react"

interface CartItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export default function ProductsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const { products, addOrder } = useData()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [address, setAddress] = useState("")
  const [phone, setPhone] = useState(user?.phone || "")
  const [paymentMode, setPaymentMode] = useState<"cod" | "upi">("cod")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "customer")) {
      router.push("/auth/login")
    }
    if (user?.phone && !phone) {
      setPhone(user.phone)
    }
  }, [user, isLoading, router])

  // 2. Helper to get the correct filename from the product name
  const getProductImage = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes("cotton")) return "/cotton.jpg";
    if (lowerName.includes("silk")) return "/silk.jpg";
    if (lowerName.includes("denim")) return "/Denim.jpg"; // Match your capitalized file
    if (lowerName.includes("linen")) return "/Linen.jpg"; // Match your capitalized file
    if (lowerName.includes("polyester")) return "/Polyester.jpg"; // Match your capitalized file
    if (lowerName.includes("wool")) return "/Wool.jpg"; // Match your capitalized file
    return "/placeholder.jpg";
  }

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))]

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === "all" || p.category === filterCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find((item) => item.productId === product.id)
    const currentQuantity = existing?.quantity || 0
    const requestedQuantity = 100

    if (currentQuantity + requestedQuantity > product.stock) {
      return
    }

    if (existing) {
      setCart(
        cart.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + requestedQuantity } : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          quantity: requestedQuantity,
          price: product.price,
        },
      ])
    }
  }

  const updateCartQuantity = (productId: string, delta: number) => {
    const item = cart.find((i) => i.productId === productId)
    if (!item) return

    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (delta > 0 && item.quantity + delta > product.stock) {
      return
    }

    setCart(
      cart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.price, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + 1, 0)

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return
    if (!address || !phone) {
      alert("Please provide address and phone number")
      return
    }

    setIsSubmitting(true)

    try {
      addOrder({
        customerId: user.id,
        customerName: user.name,
        products: cart,
        total: cartTotal,
        status: "pending",
        address,
        phone,
        paymentMode,
      })

      setCart([])
      setOrderPlaced(true)
      setTimeout(() => {
        setOrderPlaced(false)
        setIsCartOpen(false)
        setAddress("")
        setIsSubmitting(false)
      }, 2000)
    } catch (error) {
      console.error("Order error:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-muted-foreground">Browse and order premium textiles</p>
          </div>
          <Button className="gap-2" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart className="h-4 w-4" />
            Cart ({cartItemCount})
          </Button>
        </div>

        {/* Filters Section */}
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
        </div>

        {/* Products Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => {
            const cartItem = cart.find((item) => item.productId === product.id)
            return (
              <Card key={product.id} className="border-border overflow-hidden">
                <div className="relative aspect-video w-full bg-muted">
                  <Image 
                    src={getProductImage(product.name)}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{product.name}</CardTitle>
                      <CardDescription>{product.category}</CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-primary">
                        ₹{product.price.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground">/{product.unit}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {product.stock.toLocaleString()} {product.unit} available
                    </span>
                  </div>
                  {cartItem ? (
                    <div className="flex items-center justify-between rounded-lg border border-border p-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateCartQuantity(product.id, -100)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="font-medium">
                        {cartItem.quantity} {product.unit}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateCartQuantity(product.id, 100)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="w-full gap-2"
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add to Cart
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Cart Dialog */}
        <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Your Cart</DialogTitle>
              <DialogDescription>Review your order and provided details before placing</DialogDescription>
            </DialogHeader>
            {orderPlaced ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle2 className="mb-4 h-16 w-16 text-accent" />
                <p className="text-lg font-medium text-foreground">Order Placed Successfully!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Payment Mode: <span className="font-bold uppercase">{paymentMode}</span><br/>
                  We will contact you shortly at {phone}.
                </p>
              </div>
            ) : cart.length === 0 ? (
              <div className="py-8 text-center">
                <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="max-h-64 space-y-3 overflow-y-auto pr-2">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div>
                        <p className="font-medium text-foreground">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          ₹{item.price} x {item.quantity}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateCartQuantity(item.productId, -100)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => updateCartQuantity(item.productId, 100)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 border-t border-border pt-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address</Label>
                      <Input 
                        id="address" 
                        placeholder="Enter your full address" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        placeholder="Enter contact number" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <Label>Payment Mode</Label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${paymentMode === "cod" ? "bg-primary/10 border-primary text-primary ring-1 ring-primary" : "border-border hover:bg-muted"}`}>
                          <input 
                            type="radio" 
                            name="paymentMode" 
                            value="cod" 
                            className="sr-only"
                            checked={paymentMode === "cod"}
                            onChange={() => setPaymentMode("cod")}
                          />
                          <CheckCircle2 className={`h-5 w-5 ${paymentMode === "cod" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="text-sm font-bold text-center">Cash on Delivery</span>
                        </label>

                        <label className={`flex flex-col items-center justify-center gap-2 rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${paymentMode === "upi" ? "bg-primary/10 border-primary text-primary ring-1 ring-primary" : "border-border hover:bg-muted"}`}>
                          <input 
                            type="radio" 
                            name="paymentMode" 
                            value="upi" 
                            className="sr-only"
                            checked={paymentMode === "upi"}
                            onChange={() => setPaymentMode("upi")}
                          />
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">UPI</div>
                          <span className="text-sm font-bold text-center">UPI / GPay</span>
                        </label>
                      </div>

                      {paymentMode === "upi" && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <Button 
                            className="w-full h-12 bg-[#5f6368] hover:bg-[#4a4d51] text-white flex items-center justify-center gap-2 text-lg font-bold"
                            onClick={(e) => {
                              e.preventDefault();
                              if (!address || !phone) {
                                alert("Please provide address and phone number before payment");
                                return;
                              }
                              // Simulation of UPI deep link for GPay
                              const upiLink = `upi://pay?pa=sathiyatex@upi&pn=Sathiya%20Tex&am=${cartTotal}&cu=INR`;
                              window.location.href = upiLink;
                            }}
                          >
                            <svg className="h-6 w-14" viewBox="0 0 40 16" fill="currentColor">
                              <path d="M12.4 2.8v10.4h-2.1V2.8h2.1zm-4.3 0c.9 0 1.6.3 2.1.8l-1.5 1.5c-.2-.2-.4-.3-.6-.3-.4 0-.7.3-.7.7s.3.7.7.7c.2 0 .4-.1.6-.3l1.5 1.5c-.5.5-1.2.8-2.1.8-1.5 0-2.8-1.2-2.8-2.8s1.3-2.9 2.8-2.9zm8.5 0h2.1v10.4h-2.1V2.8zm5.7 0c1.5 0 2.8 1.2 2.8 2.8s-1.3 2.8-2.8 2.8c-.9 0-1.6-.3-2.1-.8l1.5-1.5c.2.2.4.3.6.3.4 0 .7-.3.7-.7s-.3-.7-.7-.7c-.2 0-.4.1-.6.3l-1.5-1.5c.5-.5 1.2-.8 2.1-.8zm5.7 0h2.1l-3.5 10.4h-2.1L24 2.8h2.1l2 7.2 1.9-7.2z" />
                            </svg>
                            Pay ₹{cartTotal.toLocaleString()}
                          </Button>
                          <p className="text-[10px] text-center text-muted-foreground mt-1 italic">
                            Secure UPI payment powered by GPay
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button variant="outline" onClick={() => setIsCartOpen(false)} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button onClick={handlePlaceOrder} disabled={isSubmitting || !address || !phone}>
                    {isSubmitting ? "Placing Order..." : "Place Order"}
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}