"use client"

import { useState, useMemo } from "react"
import { useData, Message } from "@/lib/data-store"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, User, Users as UsersIcon, Search, MessageSquare } from "lucide-react"

export function ChatInterface() {
  const { user } = useAuth()
  const { messages, addMessage, employees, products } = useData()
  const [activeRecipient, setActiveRecipient] = useState<any | null>(null)
  const [messageText, setMessageText] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  if (!user) return null

  const people = useMemo(() => {
    const list: any[] = []
    
    // Support Group (for Customers)
    if (user.role === "customer") {
      list.push({
        id: "support",
        name: "Support Team",
        role: "staff",
        isGroup: true
      })
    }

    // Employees (for Owner/Customer)
    if (user.role === "owner" || user.role === "customer") {
      employees.forEach(emp => {
        if (emp.id !== user.id) {
          list.push({ id: emp.id, name: emp.name, role: "employee" })
        }
      })
    }

    // Owner (for Employee/Customer)
    if (user.role === "employee" || user.role === "customer") {
      list.push({ id: "owner-id", name: "Owner", role: "owner" }) // Simplified owner ID
    }

    // Customers who have sent messages (for Owner/Employee)
    if (user.role === "owner" || user.role === "employee") {
      const customerIds = [...new Set(messages
        .filter(m => m.senderRole === "customer")
        .map(m => m.senderId))]
        
      customerIds.forEach(cid => {
        const lastMsg = messages.find(m => m.senderId === cid)
        if (lastMsg && !list.some(p => p.id === cid)) {
          list.push({ id: cid, name: lastMsg.senderName, role: "customer" })
        }
      })

      // Also add customers who were receivers (direct replies)
      const directCustomerReceivers = [...new Set(messages
        .filter(m => m.receiverId !== "support" && m.receiverId !== "owner-id" && !employees.some(e => e.id === m.receiverId) && m.receiverId !== user.id)
        .map(m => ({ id: m.receiverId, name: m.receiverName })))]
      
      directCustomerReceivers.forEach(c => {
        if (!list.some(p => p.id === c.id)) {
          list.push({ id: c.id, name: c.name, role: "customer" })
        }
      })
    }

    return list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [user, employees, messages, searchQuery])

  const activeMessages = useMemo(() => {
    if (!activeRecipient) return []

    return messages.filter(m => {
      const isStaff = user.role === "owner" || user.role === "employee"
      const recipientIsStaff = activeRecipient.role === "owner" || activeRecipient.role === "employee" || activeRecipient.id === "support"
      const recipientIsCustomer = activeRecipient.role === "customer"
      
      // Helper to check if an ID belongs to staff or support
      const isStaffId = (id: string) => id === "support" || id === "owner-id" || employees.some(e => e.id === id)

      // My possible IDs
      const myIds = [user.id]
      if (user.role === "owner") myIds.push("owner-id")
      
      // Their possible IDs
      const theirIds = [activeRecipient.id]
      if (activeRecipient.role === "owner") theirIds.push("owner-id")

      // --- 1. Customer Consolidated Support View ---
      if (user.role === "customer" && activeRecipient.id === "support") {
        return (m.senderId === user.id && isStaffId(m.receiverId)) ||
               (m.receiverId === user.id && (m.senderRole === "owner" || m.senderRole === "employee"))
      }

      // --- 2. Staff Viewing Customer (Shared Inbox) ---
      if (isStaff && recipientIsCustomer) {
        const customerId = activeRecipient.id
        return (m.senderId === customerId && isStaffId(m.receiverId)) ||
               (m.receiverId === customerId && (m.senderRole === "owner" || m.senderRole === "employee"))
      }

      // --- 3. Direct 1-to-1 Messaging ---
      const sentByMeToThem = myIds.includes(m.senderId) && theirIds.includes(m.receiverId)
      const sentByThemToMe = theirIds.includes(m.senderId) && myIds.includes(m.receiverId)
      
      return sentByMeToThem || sentByThemToMe
    }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [messages, user, activeRecipient])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !activeRecipient) return

    addMessage({
      senderId: user.role === "owner" ? "owner-id" : user.id,
      senderName: user.name,
      senderRole: user.role,
      receiverId: activeRecipient.id,
      receiverName: activeRecipient.name,
      content: messageText.trim()
    })

    setMessageText("")
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-4 overflow-hidden">
      {/* Sidebar - Contacts */}
      <Card className="flex w-80 flex-col border-border">
        <CardHeader className="p-4">
          <CardTitle className="text-lg">Messages</CardTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-8 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="space-y-1 p-2">
            {people.map((person) => (
              <button
                key={person.id}
                onClick={() => setActiveRecipient(person)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors ${
                  activeRecipient?.id === person.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  {person.isGroup ? <UsersIcon className="h-5 w-5" /> : <User className="h-5 w-5" />}
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium">{person.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{person.role}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex flex-1 flex-col border-border">
        {activeRecipient ? (
          <>
            <CardHeader className="flex flex-row items-center gap-3 border-b border-border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                {activeRecipient.isGroup ? (
                   <UsersIcon className="h-5 w-5 text-primary" />
                ) : (
                  <User className="h-5 w-5 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-base">{activeRecipient.name}</CardTitle>
                <p className="text-xs text-muted-foreground capitalize">
                  {activeRecipient.role}
                </p>
              </div>
            </CardHeader>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {activeMessages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center pt-20 text-center text-muted-foreground">
                    <MessageSquare className="mb-2 h-8 w-8 opacity-20" />
                    <p className="text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.senderId === user.id || (user.role === "owner" && msg.senderId === "owner-id")
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isMe ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            isMe
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`mt-1 text-[10px] opacity-70 ${
                            isMe ? "text-right" : "text-left"
                          }`}>
                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>
            <div className="border-t border-border p-4">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!messageText.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-muted-foreground p-8">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <UsersIcon className="h-10 w-10 opacity-20" />
            </div>
            <CardTitle className="text-xl mb-2 text-foreground">Your Messages</CardTitle>
            <p className="max-w-xs text-sm">
              Select a contact from the sidebar to start a conversation with the Sathiya Tex team.
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
