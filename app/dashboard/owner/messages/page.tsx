"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ChatInterface } from "@/components/chat-interface"

export default function OwnerMessagesPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Messages</h2>
          <p className="text-muted-foreground">
            Chat with your employees and handle customer queries.
          </p>
        </div>
        <ChatInterface />
      </div>
    </DashboardLayout>
  )
}
