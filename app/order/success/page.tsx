import { Suspense } from "react"
import { OrderSuccessClient } from "./success-client"

export const metadata = {
  title: "Order Confirmed — Tanit Cuisine",
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl px-4 sm:px-6 py-24" />}>
      <OrderSuccessClient />
    </Suspense>
  )
}
