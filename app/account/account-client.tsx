"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  Home,
  LogOut,
  Mail,
  MapPin,
  PackageSearch,
  Phone,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { apiRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { formatNaira } from "@/lib/format"
import type { CustomerOrder } from "@/lib/order-types"
import { useStore } from "@/lib/store-context"

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function statusBadgeVariant(status: string) {
  if (status === "cancelled") return "destructive"
  if (status === "delivered") return "default"
  return "secondary"
}

function getInitials(name: string, email: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return email.slice(0, 2).toUpperCase()
}

function previewItems(order: CustomerOrder) {
  const names = order.items.slice(0, 2).map((item) => `${item.quantity}x ${item.productName}`)
  const extra = order.items.length - names.length
  return `${names.join(", ")}${extra > 0 ? `, +${extra} more` : ""}`
}

export function AccountClient() {
  const router = useRouter()
  const { user, accessToken, loading, signout } = useAuth()
  const { wishlist } = useStore()
  const [orders, setOrders] = React.useState<CustomerOrder[]>([])
  const [ordersLoading, setOrdersLoading] = React.useState(false)
  const latestOrder = orders[0]
  const activeOrder = orders.find((order) => !["delivered", "cancelled"].includes(order.status))
  const completedOrders = orders.filter((order) => order.status === "delivered")
  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status))
  const lifetimeSpend = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0)
  const firstName = user?.fullName.split(" ")[0] || "there"
  const defaultLocation = user
    ? [user.city || "Ilorin", user.state || "Kwara"].filter(Boolean).join(", ")
    : "Ilorin, Kwara"
  const profileItemsComplete = user
    ? [user.fullName, user.email, user.phone, user.defaultAddress || user.city].filter(Boolean).length
    : 0
  const profileCompletion = Math.round((profileItemsComplete / 4) * 100)

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
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">
      <section className="overflow-hidden rounded-lg border border-border/70 bg-card">
        <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
          <div className="bg-secondary/35 p-5 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary font-serif text-2xl text-primary-foreground shadow-sm">
                  {getInitials(user.fullName, user.email)}
                </div>
                <div className="min-w-0">
                  <p className="mb-2 text-xs uppercase tracking-[0.2em] text-primary">Your account</p>
                  <h1 className="font-serif text-4xl tracking-tight md:text-5xl">
                    Welcome, {firstName}.
                  </h1>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="inline-flex min-w-0 items-center gap-1.5">
                      <Mail className="size-4 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    <Badge variant={user.isEmailVerified ? "default" : "outline"}>
                      <CheckCircle2 className="size-3" />
                      {user.isEmailVerified ? "Verified" : "Unverified"}
                    </Badge>
                    {user.isSuperuser ? (
                      <Badge variant="secondary">Admin</Badge>
                    ) : user.isStaff ? (
                      <Badge variant="secondary">Staff</Badge>
                    ) : null}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                className="self-start rounded-full md:self-center"
                onClick={() => {
                  signout()
                  router.push("/")
                }}
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <HeroInfo icon={MapPin} label="Default area" value={defaultLocation} />
              <HeroInfo
                icon={Clock3}
                label="Current order"
                value={activeOrder ? humanize(activeOrder.status) : "No active order"}
              />
              <HeroInfo icon={ShieldCheck} label="Profile" value={`${profileCompletion}% complete`} />
            </div>
          </div>

          <aside className="border-t border-border/70 bg-background p-5 lg:border-l lg:border-t-0 md:p-8">
            <p className="text-sm font-medium">Next best action</p>
            {activeOrder ? (
              <div className="mt-4">
                <Badge variant={statusBadgeVariant(activeOrder.status)}>
                  {humanize(activeOrder.status)}
                </Badge>
                <p className="mt-3 font-serif text-2xl">{activeOrder.orderNumber}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {previewItems(activeOrder)}
                </p>
                <Button asChild className="mt-5 w-full rounded-full">
                  <Link href={`/track?order=${encodeURIComponent(activeOrder.orderNumber)}`}>
                    Track order
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="mt-4">
                <p className="font-serif text-2xl">Ready for your next meal?</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start from the menu and your checkout contact details will be filled in for you.
                </p>
                <Button asChild className="mt-5 w-full rounded-full">
                  <Link href="/menu">Browse menu</Link>
                </Button>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Total orders" value={orders.length.toLocaleString("en-NG")} helper={`${activeOrders.length} active`} />
        <Metric label="Delivered" value={completedOrders.length.toLocaleString("en-NG")} helper="Completed orders" />
        <Metric label="Wishlist" value={wishlist.length.toLocaleString("en-NG")} helper="Saved meals" />
        <Metric label="Total spend" value={formatNaira(lifetimeSpend)} helper="Excludes cancelled" />
      </section>

      <section className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
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
      </section>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
        <section className="border border-border/60 rounded-lg bg-card p-6 md:p-7 lg:self-start">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserRound className="size-5 text-primary" />
              <h2 className="font-serif text-2xl">Profile</h2>
            </div>
            <Badge variant="outline">{profileCompletion}%</Badge>
          </div>
          <Separator className="my-5" />
          <dl className="space-y-5 text-sm">
            <ProfileRow icon={UserRound} label="Full name" value={user.fullName} />
            <ProfileRow icon={Mail} label="Email" value={user.email} />
            <ProfileRow icon={Phone} label="Phone" value={user.phone || "Not set"} />
            <ProfileRow
              icon={MapPin}
              label="Default address"
              value={user.defaultAddress || `${user.city || "Ilorin"}, ${user.state || "Kwara"}`}
            />
            <ProfileRow icon={Home} label="Delivery city" value={defaultLocation} />
            <ProfileRow
              icon={ShieldCheck}
              label="Email status"
              value={user.isEmailVerified ? "Verified" : "Unverified"}
            />
          </dl>
          <div className="mt-6 rounded-lg border border-border/60 bg-secondary/30 p-4 text-sm text-muted-foreground">
            Contact details are prefilled at checkout, and you can edit them before placing an
            order.
          </div>
        </section>

        <section className="border border-border/60 rounded-lg bg-card p-6 md:p-7">
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
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <ShoppingBag className="mx-auto size-8 text-primary" />
            <h3 className="mt-3 font-serif text-2xl">No orders yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your receipts and order status will appear here after checkout.
            </p>
            <Button asChild className="mt-5 rounded-full">
              <Link href="/menu">Explore menu</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.orderNumber}
                className="rounded-lg border border-border/60 bg-background p-4 md:p-5"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{order.orderNumber}</p>
                      <Badge variant={statusBadgeVariant(order.status)}>
                        {humanize(order.status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDate(order.created_at)} | {order.items.length} item
                      {order.items.length === 1 ? "" : "s"} | {formatNaira(order.total)}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
                      {previewItems(order)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="size-3.5" />
                        {[order.city, order.state].filter(Boolean).join(", ") || "Delivery area"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="size-3.5" />
                        {humanize(order.delivery)} delivery
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 md:flex md:shrink-0">
                    <Button asChild variant="outline" className="rounded-full bg-transparent">
                      <Link href={`/track?order=${encodeURIComponent(order.orderNumber)}`}>Track</Link>
                    </Button>
                    <Button asChild className="rounded-full">
                      <Link href={`/account/orders/${order.orderNumber}`}>Receipt</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </section>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <Button asChild className="rounded-full">
          <Link href="/wishlist">
            <Heart className="size-4" />
            View wishlist
          </Link>
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

function HeroInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/70 p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="size-3.5 text-primary" />
        {label}
      </div>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  )
}

function Metric({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-3 font-serif text-2xl break-words">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    </div>
  )
}

function ProfileRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string
}) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <dt className="text-muted-foreground">{label}</dt>
        <dd className="mt-1 font-medium break-words">{value}</dd>
      </div>
    </div>
  )
}
