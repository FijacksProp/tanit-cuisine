"use client"

import Link from "next/link"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store-context"
import { getProductById } from "@/lib/data"
import { ProductCard } from "@/components/product-card"

export function WishlistClient() {
  const { wishlist } = useStore()
  const products = wishlist.map((id) => getProductById(id)).filter((p) => !!p)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
      <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Saved for later</p>
      <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight">
        Your wishlist
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">
        A curated list of dishes you&apos;d like to come back to. They&apos;ll wait here for you.
      </p>

      <div className="mt-12">
        {products.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl py-16 px-6 text-center">
            <div className="mx-auto size-14 rounded-full bg-secondary flex items-center justify-center mb-5">
              <Heart className="size-6 text-primary" strokeWidth={1.5} />
            </div>
            <p className="font-serif text-2xl mb-2">Nothing saved yet</p>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Tap the heart icon on any dish to save it for later.
            </p>
            <Button asChild className="rounded-full">
              <Link href="/menu">Browse the menu</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <ProductCard key={p!.id} product={p!} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
