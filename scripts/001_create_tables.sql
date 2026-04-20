-- Users Table (stores additional user data beyond auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'customer', 'employee')),
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table (for owner to manage employees)
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  department TEXT,
  skills TEXT[] DEFAULT '{}',
  workload INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  hourly_rate DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products/Inventory Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  sku TEXT UNIQUE NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_level INTEGER DEFAULT 10,
  max_stock_level INTEGER DEFAULT 1000,
  unit_price DECIMAL(10, 2) NOT NULL,
  reorder_point INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(10, 2),
  assigned_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  quality_status TEXT DEFAULT 'pending' CHECK (quality_status IN ('pending', 'passed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table (products in each order)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tasks/Activities Table (for employees)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('quality_check', 'packing', 'assembly', 'inspection', 'shipping')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
  notes TEXT,
  completion_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quality Checks Table
CREATE TABLE IF NOT EXISTS public.quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  checked_by_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  defects_found TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'passed' CHECK (status IN ('passed', 'failed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock History Table (for tracking inventory changes)
CREATE TABLE IF NOT EXISTS public.stock_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  change_quantity INTEGER NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('purchase', 'sale', 'adjustment', 'damage')),
  reference_id UUID,
  notes TEXT,
  created_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Owner can view all users" ON public.users
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner'
  );

-- RLS Policies for products table (readable by all authenticated users)
CREATE POLICY "Products readable by authenticated users" ON public.products
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only owner can insert products" ON public.products
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner'
  );

CREATE POLICY "Only owner can update products" ON public.products
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner'
  );

-- RLS Policies for employees table
CREATE POLICY "Employees can view their own data" ON public.employees
  FOR SELECT USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner'
  );

CREATE POLICY "Only owner can insert employees" ON public.employees
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner'
  );

CREATE POLICY "Only owner can update employees" ON public.employees
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner'
  );

-- RLS Policies for orders table
CREATE POLICY "Users can view their own orders" ON public.orders
  FOR SELECT USING (
    customer_id = auth.uid() OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner' OR
    (SELECT id FROM public.employees WHERE user_id = auth.uid()) = assigned_employee_id
  );

CREATE POLICY "Customers can insert their own orders" ON public.orders
  FOR INSERT WITH CHECK (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'customer' AND
    customer_id = auth.uid()
  );

CREATE POLICY "Only owner can update orders" ON public.orders
  FOR UPDATE USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner'
  );

-- RLS Policies for tasks table
CREATE POLICY "Users can view their own tasks" ON public.tasks
  FOR SELECT USING (
    employee_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner'
  );

-- RLS Policies for quality_checks table
CREATE POLICY "Employees can view quality checks" ON public.quality_checks
  FOR SELECT USING (
    checked_by_id IN (SELECT id FROM public.employees WHERE user_id = auth.uid()) OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner'
  );

-- RLS Policies for stock_history table
CREATE POLICY "Only owner can view stock history" ON public.stock_history
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'owner'
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_assigned_employee_id ON public.orders(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON public.order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_tasks_order_id ON public.tasks(order_id);
CREATE INDEX IF NOT EXISTS idx_tasks_employee_id ON public.tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_quality_checks_task_id ON public.quality_checks(task_id);
CREATE INDEX IF NOT EXISTS idx_stock_history_product_id ON public.stock_history(product_id);
