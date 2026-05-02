import Link from "next/link"
import { PackageSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Track Order - Tanit Cuisine",
  description: "Track a Tanit Cuisine order in Ilorin, Kwara State.",
}

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 md:py-24">
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
        Enter your order number to check the latest preparation and delivery status. For urgent
        changes, contact our Ilorin concierge directly.
      </p>

      <form className="mt-10 bg-secondary/40 border border-border/60 rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row gap-3">
        <Input
          aria-label="Order number"
          placeholder="TC-12345678"
          className="bg-card h-12"
        />
        <Button type="submit" className="rounded-full h-12 px-7">
          Track order
        </Button>
      </form>

      <p className="mt-5 text-sm text-muted-foreground text-center">
        Need help now?{" "}
        <Link href="/contact" className="text-primary hover:underline">
          Contact Tanit Cuisine
        </Link>
        .
      </p>
    </div>
  )
}
