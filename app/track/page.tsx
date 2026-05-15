import { Suspense } from "react"
import { TrackOrderClient } from "./track-order-client"

export const metadata = {
  title: "Track Order - Tanit Cuisine",
  description: "Track a Tanit Cuisine order in Ilorin, Kwara State.",
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={null}>
      <TrackOrderClient />
    </Suspense>
  )
}
