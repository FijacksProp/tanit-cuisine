"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, PackageSearch, Printer, ReceiptText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { apiRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { formatNaira } from "@/lib/format"
import type { CustomerOrder } from "@/lib/order-types"

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(new Date(value))
}

export function OrderReceiptClient() {
  const params = useParams<{ orderNumber: string }>()
  const { user, accessToken, loading } = useAuth()
  const [order, setOrder] = React.useState<CustomerOrder | null>(null)
  const [error, setError] = React.useState("")
  const [fetching, setFetching] = React.useState(true)

  React.useEffect(() => {
    if (loading) return
    if (!accessToken || !user) {
      setFetching(false)
      return
    }

    setFetching(true)
    apiRequest<CustomerOrder>(`/orders/${params.orderNumber}/`, { token: accessToken })
      .then(setOrder)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load receipt"))
      .finally(() => setFetching(false))
  }, [accessToken, loading, params.orderNumber, user])

  if (loading || fetching) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="mt-5 h-80 rounded-lg bg-muted animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24 text-center">
        <ReceiptText className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 font-serif text-3xl">Sign in to view receipts</h1>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/signin">Sign in</Link>
        </Button>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24 text-center">
        <ReceiptText className="mx-auto size-10 text-primary" />
        <h1 className="mt-4 font-serif text-3xl">Receipt unavailable</h1>
        <p className="mt-3 text-muted-foreground">{error || "We could not find this receipt."}</p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/account">Back to account</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10 md:py-14">
      <div className="print:hidden flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button asChild variant="ghost" className="self-start rounded-full">
          <Link href="/account">
            <ArrowLeft className="size-4" />
            Back to account
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline" className="rounded-full bg-transparent">
            <Link href={`/track?order=${encodeURIComponent(order.orderNumber)}`}>
              <PackageSearch className="size-4" />
              Track order
            </Link>
          </Button>
          <Button className="rounded-full" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print or save PDF
          </Button>
        </div>
      </div>

      <article className="mt-6 rounded-lg border border-border/70 bg-card p-6 md:p-10 print:mt-0 print:border-0 print:p-0">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-primary">Tanit Cuisine</p>
            <h1 className="mt-2 font-serif text-4xl">Receipt</h1>
            <p className="mt-2 text-sm text-muted-foreground">Ilorin, Kwara State</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Order number</p>
            <p className="mt-1 font-serif text-2xl">{order.orderNumber}</p>
            <p className="mt-2 text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Customer</p>
            <p className="mt-2 font-medium">{order.fullName}</p>
            <p className="mt-1 text-muted-foreground">{order.email}</p>
            <p className="mt-1 text-muted-foreground">{order.phone}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Fulfilment</p>
            <p className="mt-2 font-medium">{humanize(order.delivery)} | {humanize(order.payment)}</p>
            <p className="mt-1 text-muted-foreground">
              {order.delivery === "pickup"
                ? "Pickup at Tanit Cuisine"
                : [order.address, order.city, order.state].filter(Boolean).join(", ")}
            </p>
            <p className="mt-1 text-muted-foreground">Status: {humanize(order.status)}</p>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="py-3 font-medium">Item</th>
                <th className="py-3 text-center font-medium">Qty</th>
                <th className="py-3 text-right font-medium">Unit</th>
                <th className="py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={`${item.productId}-${item.productName}`} className="border-b">
                  <td className="py-4">
                    <p className="font-medium">{item.productName}</p>
                    {item.notes && <p className="mt-1 text-xs text-muted-foreground">{item.notes}</p>}
                  </td>
                  <td className="py-4 text-center">{item.quantity}</td>
                  <td className="py-4 text-right">{formatNaira(item.unitPrice)}</td>
                  <td className="py-4 text-right">{formatNaira(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 ml-auto max-w-sm space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatNaira(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span>{order.deliveryFee === 0 ? "Free" : formatNaira(order.deliveryFee)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service fee</span>
            <span>{formatNaira(order.serviceFee)}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-serif text-2xl">
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </div>
        </div>
      </article>
    </div>
  )
}
