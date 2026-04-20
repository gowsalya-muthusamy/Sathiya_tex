export type UserRole = 'owner' | 'customer' | 'employee'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  address?: string
  skills?: string[]
  department?: string
  joinDate?: string
}

export interface Product {
  id: string
  name: string
  category: string
  description: string
  price: number
  stock: number
  minStock: number
  unit: string
  image?: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  products: OrderItem[]
  status: 'pending' | 'processing' | 'quality-check' | 'shipped' | 'delivered'
  totalAmount: number
  createdAt: string
  assignedEmployee?: string
  qualityScore?: number
}

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

export interface Employee {
  id: string
  name: string
  email: string
  phone: string
  department: string
  skills: string[]
  workload: number
  joinDate: string
  status: 'active' | 'on-leave' | 'busy'
}

export interface QualityCheck {
  id: string
  orderId: string
  employeeId: string
  checkDate: string
  score: number
  defectsFound: number
  notes: string
  status: 'passed' | 'failed' | 'pending'
}

export interface Task {
  id: string
  orderId: string
  employeeId: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
  dueDate: string
}

export interface DemandPrediction {
  productId: string
  productName: string
  currentStock: number
  predictedDemand: number
  recommendation: string
  confidence: number
}
