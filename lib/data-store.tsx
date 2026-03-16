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

const initialEmployees: Employee[] = [
  {
    id: "1",
    name: "Arun Patel",
    email: "arun@sathiyatex.com",
    phone: "+91 76543 21098",
    department: "Weaving",
    skills: ["Loom Operation", "Quality Check", "Pattern Design"],
    status: "active",
    workload: 75,
    joinDate: "2020-03-15",
    salary: 35000,
  },
  {
    id: "2",
    name: "Meera Singh",
    email: "meera@sathiyatex.com",
    phone: "+91 65432 10987",
    department: "Quality Control",
    skills: ["Fabric Testing", "Defect Analysis", "Certification"],
    status: "active",
    workload: 60,
    joinDate: "2019-07-22",
    salary: 42000,
  },
  {
    id: "3",
    name: "Vikram Reddy",
    email: "vikram@sathiyatex.com",
    phone: "+91 54321 09876",
    department: "Production",
    skills: ["Machine Maintenance", "Production Planning", "Team Lead"],
    status: "active",
    workload: 85,
    joinDate: "2018-01-10",
    salary: 55000,
  },
  {
    id: "4",
    name: "Lakshmi Devi",
    email: "lakshmi@sathiyatex.com",
    phone: "+91 43210 98765",
    department: "Dyeing",
    skills: ["Color Mixing", "Dyeing Process", "Quality Check"],
    status: "on-leave",
    workload: 0,
    joinDate: "2021-05-18",
    salary: 32000,
  },
  {
    id: "5",
    name: "Suresh Kumar",
    email: "suresh@sathiyatex.com",
    phone: "+91 32109 87654",
    department: "Packaging",
    skills: ["Packaging", "Inventory", "Shipping"],
    status: "active",
    workload: 45,
    joinDate: "2022-02-28",
    salary: 28000,
  },
]

const initialOrders: Order[] = [
  {
    id: "ORD001",
    customerId: "2",
    customerName: "Priya Sharma",
    products: [
      { productId: "1", productName: "Premium Cotton Fabric", quantity: 500, price: 450 },
      { productId: "3", productName: "Polyester Blend", quantity: 300, price: 280 },
    ],
    total: 309000,
    status: "processing",
    createdAt: "2024-01-15",
    assignedEmployee: "Vikram Reddy",
  },
  {
    id: "ORD002",
    customerId: "2",
    customerName: "Textile House Ltd",
    products: [
      { productId: "2", productName: "Silk Saree Material", quantity: 200, price: 2500 },
    ],
    total: 500000,
    status: "shipped",
    createdAt: "2024-01-12",
    assignedEmployee: "Arun Patel",
  },
  {
    id: "ORD003",
    customerId: "2",
    customerName: "Fashion Exports Inc",
    products: [
      { productId: "5", productName: "Denim Material", quantity: 1000, price: 550 },
      { productId: "4", productName: "Linen Fabric", quantity: 400, price: 850 },
    ],
    total: 890000,
    status: "pending",
    createdAt: "2024-01-18",
  },
]

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [orders, setOrders] = useState<Order[]>([])

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("sathiya_tex_orders")
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders))
      } catch (e) {
        console.error("Failed to parse saved orders", e)
      }
    }
  }, [])

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("sathiya_tex_orders", JSON.stringify(orders))
    }
  }, [orders])

  // Demo accounts should see the demo dataset plus any newly placed orders.
  // New users should start with clean state (no demo orders / employees).
  useEffect(() => {
    const demoEmails = [
      "owner@sathiyatex.com",
      "customer@example.com",
      "employee@sathiyatex.com",
      "hari@gmail.com",
    ]

    if (!user) {
      setEmployees([])
      // Don't clear orders here, they are global for the session
      return
    }

    if (demoEmails.includes(user.email)) {
      setEmployees(initialEmployees)
      
      // Merge initial demo orders with current orders (if not already present)
      setOrders((prev) => {
        const existingIds = new Set(prev.map(o => o.id))
        const newDemoOrders = initialOrders.filter(o => !existingIds.has(o.id))
        return [...prev, ...newDemoOrders]
      })
      return
    }

    if (user.role === "employee") {
      setEmployees((prev) => {
        if (prev.some((e) => e.email === user.email)) return prev
        return [
          ...prev,
          {
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
          },
        ]
      })
      return
    }

    setEmployees([])
  }, [user])

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p))
    )
  }

  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct = {
      ...product,
      id: String(products.length + 1),
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
