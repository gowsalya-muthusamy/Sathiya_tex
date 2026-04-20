"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
  unit: string
  minStock: number
  description: string
  image: string
}

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  department: string
  skills: string[]
  status: "active" | "on-leave" | "inactive"
  workload: number
  joinDate: string
  salary: number
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  products: { productId: string; productName: string; quantity: number; price: number }[]
  total: number
  status: "pending" | "processing" | "shipped" | "delivered"
  createdAt: string
  assignedEmployee?: string
  address?: string
  phone?: string
  paymentMode?: "cod" | "upi"
}

export interface Message {
  id: string
  senderId: string
  senderName: string
  senderRole: string
  receiverId: string
  receiverName: string
  content: string
  createdAt: string
  isRead: boolean
}

interface DataContextType {
  products: Product[]
  employees: Employee[]
  orders: Order[]
  updateProduct: (id: string, data: Partial<Product>) => void
  addProduct: (product: Omit<Product, "id">) => void
  deleteProduct: (id: string) => void
  updateEmployee: (id: string, data: Partial<Employee>) => void
  addEmployee: (employee: Omit<Employee, "id">) => void
  deleteEmployee: (id: string) => void
  addOrder: (order: Omit<Order, "id" | "createdAt">) => void
  updateOrder: (id: string, data: Partial<Order>) => void
  messages: Message[]
  addMessage: (message: Omit<Message, "id" | "createdAt" | "isRead">) => void
  markMessageRead: (messageId: string) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Premium Cotton Fabric",
    category: "Cotton",
    price: 450,
    stock: 5000,
    unit: "meters",
    minStock: 1000,
    description: "High-quality 100% cotton fabric suitable for garments",
    image: "/products/cotton.jpg",
  },
  {
    id: "2",
    name: "Silk Saree Material",
    category: "Silk",
    price: 2500,
    stock: 800,
    unit: "meters",
    minStock: 200,
    description: "Pure silk material for traditional sarees",
    image: "/products/silk.jpg",
  },
  {
    id: "3",
    name: "Polyester Blend",
    category: "Synthetic",
    price: 280,
    stock: 3500,
    unit: "meters",
    minStock: 500,
    description: "Durable polyester blend for industrial use",
    image: "/products/polyester.jpg",
  },
  {
    id: "4",
    name: "Linen Fabric",
    category: "Natural",
    price: 850,
    stock: 1200,
    unit: "meters",
    minStock: 300,
    description: "Premium linen for summer wear",
    image: "/products/linen.jpg",
  },
  {
    id: "5",
    name: "Denim Material",
    category: "Cotton",
    price: 550,
    stock: 2800,
    unit: "meters",
    minStock: 600,
    description: "Heavy-duty denim for jeans and jackets",
    image: "/products/denim.jpg",
  },
  {
    id: "6",
    name: "Wool Blend",
    category: "Natural",
    price: 1200,
    stock: 600,
    unit: "meters",
    minStock: 150,
    description: "Warm wool blend for winter collection",
    image: "/products/wool.jpg",
  },
]

const initialEmployees: Employee[] = []

const initialOrders: Order[] = []

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load orders and employees from localStorage on mount
  useEffect(() => {
    const savedProducts = localStorage.getItem("sathiya_tex_products")
    if (savedProducts) {
      try {
        setProducts(JSON.parse(savedProducts))
      } catch (e) {
        console.error("Failed to parse saved products", e)
      }
    }

    const savedOrders = localStorage.getItem("sathiya_tex_orders")
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders))
      } catch (e) {
        console.error("Failed to parse saved orders", e)
      }
    }

    const savedEmployees = localStorage.getItem("sathiya_tex_employees")
    if (savedEmployees) {
      try {
        setEmployees(JSON.parse(savedEmployees))
      } catch (e) {
        console.error("Failed to parse saved employees", e)
      }
    }
    
    const savedMessages = localStorage.getItem("sathiya_tex_messages")
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages))
      } catch (e) {
        console.error("Failed to parse saved messages", e)
      }
    }
    
    setIsLoaded(true)
  }, [])

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sathiya_tex_orders", JSON.stringify(orders))
    }
  }, [orders, isLoaded])

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sathiya_tex_products", JSON.stringify(products))
    }
  }, [products, isLoaded])

  // Save employees to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && employees.length > 0) {
      localStorage.setItem("sathiya_tex_employees", JSON.stringify(employees))
    }
  }, [employees, isLoaded])

  // Save messages to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("sathiya_tex_messages", JSON.stringify(messages))
    }
  }, [messages, isLoaded])

  // New users should start with clean state but see their persisted data.
  useEffect(() => {
    if (!user || !isLoaded) {
      return
    }

    if (user.role === "employee") {
      setEmployees((prev) => {
        if (prev.some((e) => e.email === user.email)) return prev
        const newEmployee: Employee = {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone ?? "",
          department: user.department ?? "",
          skills: user.skills ?? [],
          status: "active",
          workload: 0,
          joinDate: new Date().toISOString().split("T")[0],
          salary: 0,
        }
        return [...prev, newEmployee]
      })
      return
    }
  }, [user, isLoaded])

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    )
  }

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: `PROD-${Date.now()}`,
    }
    setProducts((prev) => [...prev, newProduct])
  }

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const updateEmployee = (id: string, data: Partial<Employee>) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    )
  }

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee = {
      ...employee,
      id: String(employees.length + 1),
    }
    setEmployees((prev) => [...prev, newEmployee])
  }

  const deleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id))
  }

  const addOrder = (order: Omit<Order, "id" | "createdAt">) => {
    setOrders((prev) => {
      const newOrder: Order = {
        ...order,
        id: `ORD${String(prev.length + 1).padStart(3, "0")}`,
        createdAt: new Date().toISOString().split("T")[0],
      }
      return [...prev, newOrder]
    })

    // Update product stock levels
    order.products.forEach((item) => {
      updateProduct(item.productId, {
        stock: products.find((p) => p.id === item.productId)!.stock - item.quantity,
      })
    })
  }

  const updateOrder = (id: string, data: Partial<Order>) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...data } : o))
    )
  }

  const addMessage = (message: Omit<Message, "id" | "createdAt" | "isRead">) => {
    const newMessage: Message = {
      ...message,
      id: `MSG-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    }
    setMessages((prev) => [...prev, newMessage])
  }

  const markMessageRead = (messageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isRead: true } : m))
    )
  }

  return (
    <DataContext.Provider
      value={{
        products,
        employees,
        orders,
        updateProduct,
        addProduct,
        deleteProduct,
        updateEmployee,
        addEmployee,
        deleteEmployee,
        addOrder,
        updateOrder,
        messages,
        addMessage,
        markMessageRead,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider")
  }
  return context
}
