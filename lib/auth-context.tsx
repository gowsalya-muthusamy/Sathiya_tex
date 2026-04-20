"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export type UserRole = "owner" | "customer" | "employee"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  department?: string
  skills?: string[]
}

interface AuthResult {
  success: boolean
  error?: string
  user?: User | null
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<AuthResult>
  signup: (userData: Omit<User, "id"> & { password: string }) => Promise<AuthResult>
  logout: () => Promise<void>
  updateProfile: (data: Partial<Omit<User, "id" | "role" | "email">>) => Promise<AuthResult>
  resetPasswordEmail: (email: string) => Promise<AuthResult>
  updatePassword: (password: string) => Promise<AuthResult>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function mapSupabaseUser(user: SupabaseUser | null): User | null {
  if (!user || !user.email) return null
  const meta = user.user_metadata as Record<string, any> | undefined

  return {
    id: user.id,
    email: user.email,
    name: meta?.name ?? "",
    role: (meta?.role ?? "customer") as UserRole,
    phone: meta?.phone,
    department: meta?.department,
    skills: meta?.skills,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true)

      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      const mapped = mapSupabaseUser(currentUser)
      setUser(mapped)

      setIsLoading(false)
    }

    initialize()

    // Keep the user state in sync if auth state changes elsewhere (e.g. in another tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      const mapped = mapSupabaseUser(session?.user ?? null)
      setUser(mapped)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const login = async (email: string, password: string): Promise<AuthResult> => {
    setIsLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    const mapped = mapSupabaseUser(data?.user ?? null)
    setUser(mapped)

    setIsLoading(false)

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return {
        success: false,
        error: "Please check your email and confirm your account before signing in.",
      }
    }

    return { success: true, user: mapped }
  }

  const signup = async (
    userData: Omit<User, "id"> & { password: string }
  ): Promise<AuthResult> => {
    setIsLoading(true)

    // Use a server-side API to create a user with auto-confirmation.
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })

    const result = await response.json()

    if (!response.ok) {
      setIsLoading(false)
      return { success: false, error: result.error ?? "Signup failed" }
    }

    // Sign in after successful creation
    const loginResult = await login(userData.email, userData.password)

    setIsLoading(false)
    return loginResult
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const updateProfile = async (
    data: Partial<Omit<User, "id" | "role" | "email">>
  ): Promise<AuthResult> => {
    setIsLoading(true)
    const { data: updateData, error } = await supabase.auth.updateUser({
      data: { ...data },
    })

    if (error) {
      setIsLoading(false)
      return { success: false, error: error.message }
    }

    const mapped = mapSupabaseUser(updateData.user)
    setUser(mapped)
    setIsLoading(false)
    return { success: true, user: mapped }
  }

  const resetPasswordEmail = async (email: string): Promise<AuthResult> => {
    setIsLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setIsLoading(false)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  }

  const updatePassword = async (password: string): Promise<AuthResult> => {
    setIsLoading(true)
    const { data: updateData, error } = await supabase.auth.updateUser({
      password,
    })
    setIsLoading(false)

    if (error) {
      return { success: false, error: error.message }
    }

    const mapped = mapSupabaseUser(updateData.user)
    setUser(mapped)
    return { success: true, user: mapped }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        updateProfile,
        resetPasswordEmail,
        updatePassword,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
