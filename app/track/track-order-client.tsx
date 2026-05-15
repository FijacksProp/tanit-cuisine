"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  CheckCircle2,
  ChefHat,
  Clock3,
  PackageCheck,
  PackageSearch,
  Truck,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { apiRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { formatNaira } from "@/lib/format"
import type { CustomerOrder } from "@/lib/order-types"

const steps = [
  {
    status: "pending",
    label: "Pending",
    description: "Your order has been received and is waiting for confirmation.",
    icon: Clock3,
  },
  {
    status: "confirmed",
    label: "Confirmed",
    description: "The kitchen has accepted your order.",
    icon: CheckCircle2,
  },
  {
    status: "preparing",
    label: "Preparing",
    description: "Your meal is being prepared fresh.",
    icon: ChefHat,
  },
  {
    status: "out_for_delivery",
    label: "Out for delivery",
    description: "Your rider is on the way.",
    icon: Truck,
  },
  {
    status: "delivered",
    label: "Delivered",
    description: "Your order has been completed.",
    icon: PackageCheck,
  },
] as const

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function getProgress(status: string) {
  if (status === "cancelled") return 100
  const index = steps.findIndex((step) => step.status === status)
  if (index < 0) return 0
  return (index / (steps.length - 1)) * 100
}

export function TrackOrderClient() {
  const searchParams = useSearchParams()
  const { user, accessToken, loading } = useAuth()
  const [orderNumber, setOrderNumber] = React.useState("")
  const [order, setOrder] = React.useState<CustomerOrder | null>(null)
  const [recentOrders, setRecentOrders] = React.useState<CustomerOrder[]>([])
  const [error, setError] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [autoTracked, setAutoTracked] = React.useState(false)

  const lookupOrder = React.useCallback(
    async (value: string) => {
      if (!accessToken) return

      const cleaned = value.trim().toUpperCase()
      if (!cleaned) {
        setError("Enter an order number.")
        return
      }

      setSubmitting(true)
      setError("")
      setOrder(null)
      try {
        const response = await apiRequest<CustomerOrder>(`/orders/${encodeURIComponent(cleaned)}/`, {
          token: accessToken,
        })
        setOrder(response)
        setOrderNumber(response.orderNumber)
      } catch (err) {
        setError(err instanceof Error ? err.message : "We could not find that order.")
      } finally {
        setSubmitting(false)
      }
    },
    [accessToken],
  )

  React.useEffect(() => {
    if (!accessToken) return

    apiRequest<CustomerOrder[]>("/orders/", { token: accessToken })
      .then((orders) => setRecentOrders(orders.slice(0, 3)))
      .catch(() => setRecentOrders([]))
  }, [accessToken])

  React.useEffect(() => {
    const requestedOrder = searchParams.get("order")
    if (!requestedOrder || !accessToken || autoTracked) return
    setAutoTracked(true)
    void lookupOrder(requestedOrder)
  }, [accessToken, autoTracked, lookupOrder, searchParams])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    await lookupOrder(orderNumber)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 md:py-24">
      <div className="mx-auto size-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <PackageSearch className="size-7 text-primary" strokeWidth={1.5} />
      </div>
      <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3 text-center">
        Order tracking
      </p>
      <h1 className="font-serif text-4xl md:text-6xl tracking-tight text-center">
        Follow your meal.
      </h1>
      <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed text-center max-w-xl mx-auto">
        Enter your order number to see the latest status from our kitchen and delivery team.
      </p>

      {loading ? (
        <div className="mt-10 h-20 rounded-lg bg-muted animate-pulse" />
      ) : !user ? (
        <div className="mt-10 bg-secondary/40 border border-border/60 rounded-lg p-6 text-center">
          <h2 className="font-serif text-2xl">Sign in to track orders</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Order tracking is linked to the account used at checkout.
          </p>
          <Button asChild className="mt-5 rounded-full">
            <Link href="/signin">Sign in</Link>
          </Button>
        </div>
      ) : (
        <form
          onSubmit={submit}
          className="mt-10 bg-secondary/40 border border-border/60 rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row gap-3"
        >
          <Input
            aria-label="Order number"
            placeholder="TC-12345678"
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            className="bg-card h-12 uppercase"
          />
          <Button type="submit" disabled={submitting} className="rounded-full h-12 px-7">
            {submitting ? "Checking..." : "Track order"}
          </Button>
        </form>
      )}

      {user && recentOrders.length > 0 && (
        <div className="mt-5 rounded-lg border border-border/60 bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Recent orders</p>
              <p className="mt-1 text-sm text-muted-foreground">Tap one to track it instantly.</p>
            </div>
            <Button asChild variant="ghost" className="rounded-full self-start sm:self-auto">
              <Link href="/account">View all</Link>
            </Button>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {recentOrders.map((recent) => (
              <button
                key={recent.orderNumber}
                type="button"
                onClick={() => lookupOrder(recent.orderNumber)}
                className="rounded-lg border border-border/70 bg-secondary/40 p-4 text-left transition-colors hover:border-primary/50 hover:bg-primary/5"
              >
                <span className="block font-medium">{recent.orderNumber}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {humanize(recent.status)} | {formatNaira(recent.total)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {order && <TrackingResult order={order} />}

      <p className="mt-8 text-sm text-muted-foreground text-center">
        Need help now?{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact Tanit Cuisine
        </Link>
        .
      </p>
    </div>
  )
}

function TrackingResult({ order }: { order: CustomerOrder }) {
  const cancelled = order.status === "cancelled"
  const activeIndex = steps.findIndex((step) => step.status === order.status)
  const progress = getProgress(order.status)

  return (
    <section className="mt-10 rounded-xl border border-border/70 bg-card p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Order number</p>
          <h2 className="mt-1 font-serif text-3xl">{order.orderNumber}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Placed {formatDate(order.created_at)} | {formatNaira(order.total)}
          </p>
        </div>
        <Badge variant={cancelled ? "destructive" : "secondary"} className="self-start">
          {humanize(order.status)}
        </Badge>
      </div>

      {cancelled ? (
        <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/10 p-5">
          <div className="flex gap-3">
            <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-destructive">This order was cancelled.</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                If this looks wrong, contact Tanit Cuisine with your order number.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-8">
            <Progress value={progress} className="h-2" />
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-5 gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon
              const completed = index <= activeIndex
              const active = index === activeIndex
              return (
                <div
                  key={step.status}
                  className={`rounded-lg border p-4 transition-all duration-500 ${
                    active
                      ? "border-primary bg-primary/10 shadow-sm"
                      : completed
                        ? "border-primary/30 bg-secondary/40"
                        : "border-border bg-background"
                  }`}
                >
                  <div
                    className={`size-10 rounded-full flex items-center justify-center ${
                      completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    } ${active ? "animate-pulse" : ""}`}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h3 className="mt-4 font-medium">{step.label}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
        <div className="rounded-lg bg-secondary/40 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Delivery</p>
          <p className="mt-2 font-medium">{humanize(order.delivery)}</p>
          <p className="mt-1 text-muted-foreground">
            {order.delivery === "pickup"
              ? "Pickup at Tanit Cuisine"
              : [order.address, order.city, order.state].filter(Boolean).join(", ")}
          </p>
        </div>
        <div className="rounded-lg bg-secondary/40 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Items</p>
          <p className="mt-2 font-medium">
            {order.items.map((item) => `${item.quantity}x ${item.productName}`).join(", ")}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button asChild className="rounded-full">
          <Link href={`/account/orders/${order.orderNumber}`}>View receipt</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-transparent">
          <Link href="/account">Back to account</Link>
        </Button>
      </div>
    </section>
  )
}
