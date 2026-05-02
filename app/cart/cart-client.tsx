"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useStore } from "@/lib/store-context"
import { formatNaira } from "@/lib/format"

export function CartPageClient() {
  const { cartItemsWithProduct, cartSubtotal, cartCount, updateQuantity, removeFromCart } =
    useStore()

  const deliveryFee = cartSubtotal >= 25000 || cartSubtotal === 0 ? 0 : 2500
  const serviceFee = Math.round(cartSubtotal * 0.025)
  const total = cartSubtotal + deliveryFee + serviceFee

  if (cartCount === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20 md:py-32 text-center">
        <div className="mx-auto size-16 rounded-full bg-secondary flex items-center justify-center mb-6">
          <ShoppingBag className="size-7 text-primary" />
        </div>
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight">Your cart is empty</h1>
        <p className="mt-4 text-muted-foreground max-w-md mx-auto leading-relaxed">
          You haven&apos;t added any dishes yet. Browse our menu and discover something
          extraordinary.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-full">
          <Link href="/menu">Explore the menu</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-16">
      <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">
        Your selection
      </p>
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight">
        Cart ({cartCount})
      </h1>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-16">
        <ul className="flex flex-col">
          {cartItemsWithProduct.map(({ item, product }, idx) => (
            <li
              key={product.id}
              className={`py-6 ${idx !== 0 ? "border-t border-border/60" : "pt-0"}`}
            >
              <div className="flex gap-4 sm:gap-6">
                <Link
                  href={`/menu/${product.slug}`}
                  className="relative size-24 sm:size-32 rounded-lg overflow-hidden bg-muted shrink-0"
                >
                  <Image
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    sizes="128px"
                    className="object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/menu/${product.slug}`}
                        className="font-serif text-lg sm:text-xl hover:text-primary transition-colors"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.servingSize}
                      </p>
                    </div>
                    <span className="font-serif text-base sm:text-lg whitespace-nowrap">
                      {formatNaira(product.price * item.quantity)}
                    </span>
                  </div>

                  <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                    <div className="inline-flex items-center border border-border rounded-full bg-card">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, item.quantity - 1)}
                        aria-label="Decrease quantity"
                        className="size-9 inline-flex items-center justify-center text-foreground/70 hover:text-primary"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className="size-9 inline-flex items-center justify-center text-foreground/70 hover:text-primary"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(product.id)}
                      className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1.5"
                    >
                      <Trash2 className="size-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="bg-secondary/40 border border-border/60 rounded-xl p-6 md:p-8">
            <h2 className="font-serif text-2xl mb-6">Order summary</h2>

            <dl className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-medium tabular-nums">{formatNaira(cartSubtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-medium tabular-nums">
                  {deliveryFee === 0 ? (
                    <span className="text-primary">Free</span>
                  ) : (
                    formatNaira(deliveryFee)
                  )}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Service fee</dt>
                <dd className="font-medium tabular-nums">{formatNaira(serviceFee)}</dd>
              </div>
            </dl>

            <Separator className="my-5" />

            <div className="flex items-baseline justify-between">
              <span className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                Total
              </span>
              <span className="font-serif text-2xl tabular-nums">{formatNaira(total)}</span>
            </div>

            <Button asChild size="lg" className="mt-6 w-full rounded-full gap-2">
              <Link href="/checkout">
                Proceed to checkout
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
              <Link href="/menu">Continue shopping</Link>
            </Button>

            {cartSubtotal < 25000 && (
              <p className="mt-5 text-xs text-muted-foreground text-center leading-relaxed">
                Add {formatNaira(25000 - cartSubtotal)} more to qualify for free delivery within
                Ilorin, Kwara State.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
