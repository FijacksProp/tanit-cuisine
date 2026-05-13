"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
  FieldDescription,
  FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChevronLeft, Lock, ShoppingBag } from "lucide-react"
import { useStore } from "@/lib/store-context"
import { formatNaira } from "@/lib/format"
import { apiRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

type FormState = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  notes: string
  delivery: "standard" | "express" | "pickup"
  payment: "card" | "transfer" | "cash"
  cardNumber: string
  cardExpiry: string
  cardCvc: string
  cardName: string
}

type OrderResponse = {
  orderNumber: string
  fullName: string
  email: string
  total: number
}

const initialForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  city: "Ilorin",
  state: "Kwara",
  zip: "",
  notes: "",
  delivery: "standard",
  payment: "card",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  cardName: "",
}

export function CheckoutPageClient() {
  const router = useRouter()
  const { cartItemsWithProduct, cartSubtotal, cartCount, clearCart } = useStore()
  const { accessToken, user } = useAuth()
  const [form, setForm] = React.useState<FormState>(initialForm)
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = React.useState(false)

  const deliveryFees = { standard: 2500, express: 4500, pickup: 0 } as const
  const baseDelivery = deliveryFees[form.delivery]
  const deliveryFee =
    form.delivery !== "pickup" && cartSubtotal >= 25000 ? 0 : baseDelivery
  const serviceFee = Math.round(cartSubtotal * 0.025)
  const total = cartSubtotal + deliveryFee + serviceFee

  React.useEffect(() => {
    if (!user) return

    setForm((current) => ({
      ...current,
      fullName: current.fullName || user.fullName,
      email: current.email || user.email,
      phone: current.phone || user.phone,
      address: current.address || user.defaultAddress,
      city: current.city || user.city || "Ilorin",
      state: current.state || user.state || "Kwara",
      zip: current.zip || user.zip,
    }))
  }, [user])

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {}
    if (!form.fullName.trim()) e.fullName = "Full name is required"
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Please enter a valid email"
    if (!/^[0-9+\s-]{7,}$/.test(form.phone)) e.phone = "Please enter a valid phone number"
    if (form.delivery !== "pickup") {
      if (!form.address.trim()) e.address = "Delivery address is required"
      if (!form.city.trim()) e.city = "City is required"
    }
    if (form.payment === "card") {
      if (!/^[0-9\s]{13,19}$/.test(form.cardNumber.replace(/\s/g, "")))
        e.cardNumber = "Enter a valid card number"
      if (!/^\d{2}\s?\/\s?\d{2}$/.test(form.cardExpiry)) e.cardExpiry = "MM / YY"
      if (!/^\d{3,4}$/.test(form.cardCvc)) e.cardCvc = "3-digit code"
      if (!form.cardName.trim()) e.cardName = "Name on card is required"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) {
      const firstErr = document.querySelector("[data-error='true']")
      firstErr?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    setSubmitting(true)
    try {
      const order = await apiRequest<OrderResponse>("/orders/", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.delivery === "pickup" ? "" : form.address,
          city: form.city,
          state: form.state,
          zip: form.zip,
          notes: form.notes,
          delivery: form.delivery,
          payment: form.payment,
          items: cartItemsWithProduct.map(({ item }) => ({
            productId: item.productId,
            quantity: item.quantity,
            notes: item.notes ?? "",
          })),
        }),
      })
      clearCart()
      router.push(
        `/order/success?id=${order.orderNumber}&name=${encodeURIComponent(order.fullName)}&email=${encodeURIComponent(order.email)}&total=${order.total}`,
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to place your order")
    } finally {
      setSubmitting(false)
    }
  }

  if (cartCount === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-24 text-center">
        <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-5">
          <ShoppingBag className="size-6 text-primary" />
        </div>
        <h1 className="font-serif text-3xl md:text-4xl">Nothing to check out</h1>
        <p className="mt-3 text-muted-foreground">Your cart is empty.</p>
        <Button asChild className="mt-6 rounded-full">
          <Link href="/menu">Explore the menu</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
      <Link
        href="/cart"
        className="text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-primary inline-flex items-center gap-1"
      >
        <ChevronLeft className="size-3.5" />
        Back to cart
      </Link>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl tracking-tight">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-10 lg:gap-16">
        <div className="flex flex-col gap-10">
          <FieldSet>
            <FieldLegend className="font-serif text-2xl tracking-tight">
              Contact information
            </FieldLegend>
            <FieldGroup>
              <Field data-error={!!errors.fullName}>
                <FieldLabel htmlFor="fullName">Full name</FieldLabel>
                <Input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Adaeze Okafor"
                  autoComplete="name"
                />
                {errors.fullName && <FieldError>{errors.fullName}</FieldError>}
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field data-error={!!errors.email}>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  {errors.email && <FieldError>{errors.email}</FieldError>}
                </Field>
                <Field data-error={!!errors.phone}>
                  <FieldLabel htmlFor="phone">Phone</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+234 801 234 5678"
                    autoComplete="tel"
                  />
                  {errors.phone && <FieldError>{errors.phone}</FieldError>}
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSet>
            <FieldLegend className="font-serif text-2xl tracking-tight">Delivery</FieldLegend>
            <RadioGroup
              value={form.delivery}
              onValueChange={(v) => update("delivery", v as FormState["delivery"])}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
            >
              {[
                { v: "standard", label: "Standard", time: "60 – 90 mins", price: 2500 },
                { v: "express", label: "Express", time: "30 – 45 mins", price: 4500 },
                { v: "pickup", label: "Pickup", time: "Ready in 30 mins", price: 0 },
              ].map((opt) => (
                <label
                  key={opt.v}
                  htmlFor={`delivery-${opt.v}`}
                  className={`relative cursor-pointer rounded-lg border p-4 transition-colors ${
                    form.delivery === opt.v
                      ? "border-primary bg-secondary/40"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <RadioGroupItem
                    value={opt.v}
                    id={`delivery-${opt.v}`}
                    className="absolute top-4 right-4"
                  />
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{opt.time}</p>
                  <p className="text-sm font-serif mt-2">
                    {opt.price === 0 ? "Free" : formatNaira(opt.price)}
                  </p>
                </label>
              ))}
            </RadioGroup>

            {form.delivery !== "pickup" && (
              <FieldGroup>
                <Field data-error={!!errors.address}>
                  <FieldLabel htmlFor="address">Delivery address</FieldLabel>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    placeholder="GRA, Ilorin"
                    autoComplete="street-address"
                  />
                  {errors.address && <FieldError>{errors.address}</FieldError>}
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Field data-error={!!errors.city}>
                    <FieldLabel htmlFor="city">City</FieldLabel>
                    <Input
                      id="city"
                      value={form.city}
                      onChange={(e) => update("city", e.target.value)}
                      autoComplete="address-level2"
                    />
                    {errors.city && <FieldError>{errors.city}</FieldError>}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="state">State</FieldLabel>
                    <Input
                      id="state"
                      value={form.state}
                      onChange={(e) => update("state", e.target.value)}
                      autoComplete="address-level1"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="zip">Postal code</FieldLabel>
                    <Input
                      id="zip"
                      value={form.zip}
                      onChange={(e) => update("zip", e.target.value)}
                      autoComplete="postal-code"
                      placeholder="Optional"
                    />
                  </Field>
                </div>
                <Field>
                  <FieldLabel htmlFor="notes">Delivery notes</FieldLabel>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Gate code, dietary requests, etc."
                    rows={3}
                  />
                  <FieldDescription>Optional, but helps our riders.</FieldDescription>
                </Field>
              </FieldGroup>
            )}
          </FieldSet>

          <FieldSet>
            <FieldLegend className="font-serif text-2xl tracking-tight">Payment</FieldLegend>
            <RadioGroup
              value={form.payment}
              onValueChange={(v) => update("payment", v as FormState["payment"])}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
            >
              {[
                { v: "card", label: "Card", desc: "Visa, Mastercard, Verve" },
                { v: "transfer", label: "Bank transfer", desc: "Pay via app" },
                { v: "cash", label: "Cash on delivery", desc: "Pay the rider" },
              ].map((opt) => (
                <label
                  key={opt.v}
                  htmlFor={`pay-${opt.v}`}
                  className={`relative cursor-pointer rounded-lg border p-4 transition-colors ${
                    form.payment === opt.v
                      ? "border-primary bg-secondary/40"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <RadioGroupItem
                    value={opt.v}
                    id={`pay-${opt.v}`}
                    className="absolute top-4 right-4"
                  />
                  <p className="font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{opt.desc}</p>
                </label>
              ))}
            </RadioGroup>

            {form.payment === "card" && (
              <FieldGroup>
                <Field data-error={!!errors.cardNumber}>
                  <FieldLabel htmlFor="cardNumber">Card number</FieldLabel>
                  <Input
                    id="cardNumber"
                    value={form.cardNumber}
                    onChange={(e) => {
                      const v = e.target.value
                        .replace(/\s/g, "")
                        .replace(/\D/g, "")
                        .slice(0, 16)
                        .replace(/(\d{4})/g, "$1 ")
                        .trim()
                      update("cardNumber", v)
                    }}
                    placeholder="1234 5678 9012 3456"
                    inputMode="numeric"
                    autoComplete="cc-number"
                  />
                  {errors.cardNumber && <FieldError>{errors.cardNumber}</FieldError>}
                </Field>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <Field data-error={!!errors.cardExpiry}>
                    <FieldLabel htmlFor="cardExpiry">Expiry</FieldLabel>
                    <Input
                      id="cardExpiry"
                      value={form.cardExpiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "").slice(0, 4)
                        if (v.length > 2) v = v.slice(0, 2) + " / " + v.slice(2)
                        update("cardExpiry", v)
                      }}
                      placeholder="MM / YY"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                    />
                    {errors.cardExpiry && <FieldError>{errors.cardExpiry}</FieldError>}
                  </Field>
                  <Field data-error={!!errors.cardCvc}>
                    <FieldLabel htmlFor="cardCvc">CVC</FieldLabel>
                    <Input
                      id="cardCvc"
                      value={form.cardCvc}
                      onChange={(e) =>
                        update("cardCvc", e.target.value.replace(/\D/g, "").slice(0, 4))
                      }
                      placeholder="123"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                    />
                    {errors.cardCvc && <FieldError>{errors.cardCvc}</FieldError>}
                  </Field>
                  <Field className="col-span-2 sm:col-span-1" data-error={!!errors.cardName}>
                    <FieldLabel htmlFor="cardName">Name on card</FieldLabel>
                    <Input
                      id="cardName"
                      value={form.cardName}
                      onChange={(e) => update("cardName", e.target.value)}
                      autoComplete="cc-name"
                    />
                    {errors.cardName && <FieldError>{errors.cardName}</FieldError>}
                  </Field>
                </div>
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                  <Lock className="size-3" />
                  This is a demo checkout — no real payment will be processed.
                </p>
              </FieldGroup>
            )}
          </FieldSet>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-secondary/40 border border-border/60 rounded-xl p-6 md:p-7">
            <h2 className="font-serif text-xl mb-5">Your order</h2>

            <ul className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1">
              {cartItemsWithProduct.map(({ item, product }) => (
                <li key={product.id} className="flex gap-3">
                  <div className="relative size-14 rounded-md overflow-hidden bg-muted shrink-0">
                    <Image
                      src={product.image || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <span className="absolute -top-1 -right-1 size-5 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-snug line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {product.servingSize}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums whitespace-nowrap">
                    {formatNaira(product.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <Separator className="my-5" />

            <dl className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatNaira(cartSubtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  {form.delivery === "pickup" ? "Pickup" : "Delivery"}
                </dt>
                <dd className="tabular-nums">
                  {deliveryFee === 0 ? (
                    <span className="text-primary">Free</span>
                  ) : (
                    formatNaira(deliveryFee)
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Service fee</dt>
                <dd className="tabular-nums">{formatNaira(serviceFee)}</dd>
              </div>
            </dl>

            <Separator className="my-5" />

            <div className="flex items-baseline justify-between">
              <span className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                Total
              </span>
              <span className="font-serif text-2xl tabular-nums">{formatNaira(total)}</span>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="mt-6 w-full rounded-full"
            >
              {submitting ? "Processing..." : `Place order — ${formatNaira(total)}`}
            </Button>
            <p className="mt-3 text-[11px] text-muted-foreground text-center leading-relaxed">
              By placing your order, you agree to our terms and privacy policy.
            </p>
          </div>
        </aside>
      </form>
    </div>
  )
}
