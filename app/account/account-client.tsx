"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PackageSearch, ReceiptText, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { apiRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { formatNaira } from "@/lib/format"
import type { CustomerOrder } from "@/lib/order-types"

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function AccountClient() {
  const router = useRouter()
  const { user, accessToken, loading, signout } = useAuth()
  const [orders, setOrders] = React.useState<CustomerOrder[]>([])
  const [ordersLoading, setOrdersLoading] = React.useState(false)
  const latestOrder = orders[0]

  React.useEffect(() => {
    if (!accessToken || !user) return

    setOrdersLoading(true)
    apiRequest<CustomerOrder[]>("/orders/", { token: accessToken })
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false))
  }, [accessToken, user])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 w-72 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight">Sign in required</h1>
        <p className="mt-4 text-muted-foreground">
          Sign in to view your profile, saved details, and future order history.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link href="/signin">Sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 md:py-20">
      <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Your account</p>
      <h1 className="font-serif text-4xl md:text-6xl tracking-tight">
        Welcome, {user.fullName.split(" ")[0]}.
      </h1>
      <p className="mt-4 text-muted-foreground">
        Your Tanit profile is connected to {user.email}.
      </p>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Button asChild className="h-auto justify-start rounded-lg p-4">
          <Link href="/track" className="flex items-center gap-3">
            <PackageSearch className="size-5" />
            <span className="text-left">
              <span className="block font-medium">Track order</span>
              <span className="block text-xs opacity-80">Use an order number</span>
            </span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start rounded-lg bg-transparent p-4">
          <Link href={latestOrder ? `/account/orders/${latestOrder.orderNumber}` : "/account"} className="flex items-center gap-3">
            <ReceiptText className="size-5" />
            <span className="text-left">
              <span className="block font-medium">Latest receipt</span>
              <span className="block text-xs text-muted-foreground">
                {latestOrder ? latestOrder.orderNumber : "No orders yet"}
              </span>
            </span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-auto justify-start rounded-lg bg-transparent p-4">
          <Link href="/menu" className="flex items-center gap-3">
            <ShoppingBag className="size-5" />
            <span className="text-left">
              <span className="block font-medium">Order again</span>
              <span className="block text-xs text-muted-foreground">Browse the menu</span>
            </span>
          </Link>
        </Button>
      </div>

      <div className="mt-10 border border-border/60 rounded-lg bg-card p-6 md:p-8">
        <h2 className="font-serif text-2xl">Profile</h2>
        <Separator className="my-5" />
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div>
            <dt className="text-muted-foreground">Full name</dt>
            <dd className="mt-1 font-medium">{user.fullName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-1 font-medium break-all">{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="mt-1 font-medium">{user.phone || "Not set"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email status</dt>
            <dd className="mt-1 font-medium">{user.isEmailVerified ? "Verified" : "Unverified"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Default address</dt>
            <dd className="mt-1 font-medium">
              {user.defaultAddress || `${user.city || "Ilorin"}, ${user.state || "Kwara"}`}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 border border-border/60 rounded-lg bg-card p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl">Orders & receipts</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              View previous orders and print or save receipts.
            </p>
          </div>
          <ReceiptText className="size-5 text-primary shrink-0" />
        </div>
        <Separator className="my-5" />
        {ordersLoading ? (
          <div className="space-y-3">
            <div className="h-16 rounded bg-muted animate-pulse" />
            <div className="h-16 rounded bg-muted animate-pulse" />
          </div>
        ) : orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have not placed any orders yet.
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {orders.map((order) => (
              <div
                key={order.orderNumber}
                className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{order.orderNumber}</p>
                    <Badge variant={order.status === "cancelled" ? "destructive" : "secondary"}>
                      {humanize(order.status)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDate(order.created_at)} | {order.items.length} item
                    {order.items.length === 1 ? "" : "s"} | {formatNaira(order.total)}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button asChild variant="outline" className="rounded-full bg-transparent">
                    <Link href={`/track?order=${encodeURIComponent(order.orderNumber)}`}>Track</Link>
                  </Button>
                  <Button asChild className="rounded-full">
                    <Link href={`/account/orders/${order.orderNumber}`}>Receipt</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <Button asChild className="rounded-full">
          <Link href="/wishlist">View wishlist</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-transparent">
          <Link href="/track">Track an order</Link>
        </Button>
        <Button
          variant="ghost"
          className="rounded-full"
          onClick={() => {
            signout()
            router.push("/")
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}
