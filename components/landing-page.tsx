"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Package,
  Users,
  BarChart3,
  Shield,
  Truck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react"

const features = [
  {
    icon: Package,
    title: "Smart Inventory",
    description: "ML-powered stock management with demand prediction and automatic reorder alerts.",
  },
  {
    icon: Users,
    title: "Workforce Management",
    description: "Intelligent employee allocation based on skills, workload, and order requirements.",
  },
  {
    icon: BarChart3,
    title: "Quality Analytics",
    description: "Real-time defect detection and quality monitoring throughout production.",
  },
  {
    icon: Shield,
    title: "Export Compliance",
    description: "Automated documentation and compliance checks for international exports.",
  },
  {
    icon: Truck,
    title: "Order Tracking",
    description: "End-to-end visibility from order placement to delivery confirmation.",
  },
  {
    icon: Sparkles,
    title: "ML Predictions",
    description: "Data-driven insights for demand forecasting and inventory optimization.",
  },
]

const stats = [
  { value: "50K+", label: "Meters Daily Production" },
  { value: "98%", label: "Quality Pass Rate" },
  { value: "25+", label: "Export Countries" },
  { value: "500+", label: "Happy Clients" },
]

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">ST</span>
            </div>
            <span className="text-xl font-bold text-foreground">Sathiya Tex</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground">
              About
            </Link>
            <Link href="#contact" className="text-sm text-muted-foreground hover:text-foreground">
              Contact
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-sm text-accent">
                <Sparkles className="h-4 w-4" />
                ML-Powered Textile Platform
              </div>
              <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Smart Manufacturing for Modern Textiles
              </h1>
              <p className="mb-8 text-pretty text-lg text-muted-foreground">
                Transform your textile business with our intelligent platform. Automate ordering,
                optimize inventory, manage workforce, and ensure quality - all powered by
                machine learning.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="gap-2">
                    Start Free Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-6">
                {["No setup fees", "24/7 Support", "Export Ready"].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 p-8">
                <div className="h-full rounded-xl border border-border bg-card p-6 shadow-lg">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-destructive" />
                    <div className="h-3 w-3 rounded-full bg-chart-4" />
                    <div className="h-3 w-3 rounded-full bg-accent" />
                  </div>
                  <div className="space-y-4">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="rounded-lg bg-primary/10 p-4">
                        <div className="text-2xl font-bold text-primary">5.2K</div>
                        <div className="text-xs text-muted-foreground">Orders Today</div>
                      </div>
                      <div className="rounded-lg bg-accent/10 p-4">
                        <div className="text-2xl font-bold text-accent">98.5%</div>
                        <div className="text-xs text-muted-foreground">Quality Score</div>
                      </div>
                    </div>
                    <div className="mt-4 h-24 rounded-lg bg-muted/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-primary sm:text-4xl">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              Everything You Need to Scale
            </h2>
            <p className="text-lg text-muted-foreground">
              Comprehensive tools designed specifically for textile manufacturing and export
              operations.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="mb-4 text-3xl font-bold text-primary-foreground">
              Ready to Transform Your Business?
            </h2>
            <p className="mb-8 text-lg text-primary-foreground/80">
              Join hundreds of textile manufacturers already using Sathiya Tex.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Today
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">ST</span>
              </div>
              <span className="font-semibold text-foreground">Sathiya Tex</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2024 Sathiya Tex. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
