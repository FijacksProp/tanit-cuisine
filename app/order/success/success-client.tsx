"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, ArrowRight, MapPin, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatNaira } from "@/lib/format"

export function OrderSuccessClient() {
  const params = useSearchParams()
  const orderId = params.get("id") ?? "TC-00000000"
  const name = params.get("name") ?? "Guest"
  const email = params.get("email") ?? ""
  const total = Number(params.get("total") ?? 0)

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 md:py-24">
      <div className="text-center">
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-primary/10 mb-6">
          <CheckCircle2 className="size-8 text-primary" strokeWidth={1.5} />
        </div>
        <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">
          Order confirmed
        </p>
        <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance">
          Thank you, {name.split(" ")[0]}.
        </h1>
        <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          Our kitchen has received your order. We&apos;ll send you updates as your meal is prepared
          and delivered.
        </p>
      </div>

      <div className="mt-12 bg-secondary/40 border border-border/60 rounded-xl p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-5 border-b border-border/60">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Order number
            </p>
            <p className="font-serif text-xl mt-1">{orderId}</p>
          </div>
          {total > 0 && (
            <div className="sm:text-right">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Total</p>
              <p className="font-serif text-xl mt-1 tabular-nums">{formatNaira(total)}</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="flex gap-3">
            <Mail className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Confirmation
              </p>
              <p className="text-sm mt-1 break-all">
                {email || "Sent to your email"}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Estimated arrival
              </p>
              <p className="text-sm mt-1">60 – 90 minutes</p>
            </div>
          </div>
          <div className="flex gap-3">
            <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                Live tracking
              </p>
              <p className="text-sm mt-1">Available shortly</p>
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <p className="text-sm text-foreground/80 leading-relaxed">
          A copy of your receipt is on its way. Need to make changes? Reach our concierge at{" "}
          <Link href="mailto:hello@tanitcuisine.com" className="text-primary hover:underline">
            hello@tanitcuisine.com
          </Link>{" "}
          or call <span className="text-foreground">+234 (0) 800 826 4823</span>.
        </p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild size="lg" className="rounded-full gap-2">
          <Link href="/menu">
            Continue exploring
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full bg-transparent">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </div>
  )
}
