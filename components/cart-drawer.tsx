"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useStore } from "@/lib/store-context"
import { formatNaira } from "@/lib/format"

export function CartDrawer() {
  const {
    cartOpen,
    closeCart,
    cartItemsWithProduct,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    cartCount,
  } = useStore()

  const deliveryFee = cartSubtotal > 25000 ? 0 : 1500
  const serviceFee = Math.round(cartSubtotal * 0.025)
  const total = cartSubtotal + deliveryFee + serviceFee

  return (
    <Sheet open={cartOpen} onOpenChange={(o) => !o && closeCart()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 flex flex-col gap-0"
      >
        <SheetHeader className="px-6 py-5 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-serif text-xl flex items-center gap-2">
              <ShoppingBag className="size-5" />
              Your Cart
              {cartCount > 0 && (
                <span className="text-sm text-muted-foreground font-sans font-normal">
                  ({cartCount} {cartCount === 1 ? "item" : "items"})
                </span>
              )}
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            Review the items in your cart and proceed to checkout.
          </SheetDescription>
        </SheetHeader>

        {cartItemsWithProduct.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-5">
              <ShoppingBag className="size-8 text-muted-foreground" strokeWidth={1.4} />
            </div>
            <h3 className="font-serif text-xl">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
              Add a few of our favourites to start building your order.
            </p>
            <Button asChild className="mt-6 rounded-full" onClick={closeCart}>
              <Link href="/menu">Explore Menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <ul className="divide-y divide-border">
                {cartItemsWithProduct.map(({ item, product }) => (
                  <li key={product.id} className="flex gap-4 p-5">
                    <Link
                      href={`/menu/${product.slug}`}
                      onClick={closeCart}
                      className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted"
                    >
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/menu/${product.slug}`}
                          onClick={closeCart}
                          className="font-serif text-base leading-tight hover:text-primary transition-colors line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          aria-label={`Remove ${product.name} from cart`}
                          className="text-muted-foreground hover:text-destructive transition-colors -mt-1"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{product.servingSize}</p>
                      <div className="mt-auto pt-3 flex items-end justify-between gap-2">
                        <div className="inline-flex items-center border border-border rounded-full overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, item.quantity - 1)}
                            aria-label="Decrease quantity"
                            className="size-8 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="px-3 text-sm tabular-nums min-w-8 text-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className="size-8 flex items-center justify-center hover:bg-muted transition-colors"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <p className="font-serif text-base">
                          {formatNaira(product.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <div className="border-t bg-muted/40 p-6 flex flex-col gap-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="text-foreground tabular-nums">{formatNaira(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Service fee</span>
                  <span className="text-foreground tabular-nums">{formatNaira(serviceFee)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-foreground tabular-nums">
                    {deliveryFee === 0 ? "Free" : formatNaira(deliveryFee)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between font-serif text-lg">
                  <span>Total</span>
                  <span className="tabular-nums">{formatNaira(total)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button asChild size="lg" className="rounded-full" onClick={closeCart}>
                  <Link href="/checkout">Checkout &middot; {formatNaira(total)}</Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="rounded-full"
                  onClick={closeCart}
                >
                  <Link href="/cart">View Full Cart</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
