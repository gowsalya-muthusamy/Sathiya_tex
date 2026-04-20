"use client"

import { ReactNode } from "react"
import { AuthProvider } from "@/lib/auth-context"
import { DataProvider } from "@/lib/data-store"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DataProvider>{children}</DataProvider>
    </AuthProvider>
  )
}
