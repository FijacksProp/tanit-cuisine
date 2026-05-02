"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Minus, Plus, ShoppingBag, Clock, Users, Flame, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useStore } from "@/lib/store-context"
import { formatNaira } from "@/lib/format"
import type { Product } from "@/lib/types"
import { categories, getProductsByCategory } from "@/lib/data"
import { RatingStars } from "./rating-stars"
import { SpiceLevel } from "./spice-level"
import { ProductCard } from "./product-card"
import { ReviewsSection } from "./reviews-section"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const { addToCart, toggleWishlist, isInWishlist, openCart } = useStore()
  const [quantity, setQuantity] = React.useState(1)
  const inWishlist = isInWishlist(product.id)
  const category = categories.find((c) => c.slug === product.category)

  const related = React.useMemo(
    () => getProductsByCategory(product.category).filter((p) => p.id !== product.id).slice(0, 4),
    [product],
  )

  const handleAdd = () => {
    addToCart(product.id, quantity)
    toast.success(`${product.name} added to cart`, {
      description: `${quantity} × ${formatNaira(product.price)}`,
    })
    openCart()
  }

  return (
    <article>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 md:pt-8">
        <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="size-3" />
          <Link href="/menu" className="hover:text-primary transition-colors">
            Menu
          </Link>
          <ChevronRight className="size-3" />
          {category && (
            <>
              <Link
                href={`/menu?category=${category.slug}`}
                className="hover:text-primary transition-colors"
              >
                {category.name}
              </Link>
              <ChevronRight className="size-3" />
            </>
          )}
          <span className="text-foreground/80">{product.name}</span>
        </nav>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          <div className="relative">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {product.isNew && (
                  <Badge className="bg-accent text-accent-foreground hover:bg-accent rounded-full px-3 text-[10px] tracking-wider uppercase">
                    New
                  </Badge>
                )}
                {product.bestseller && (
                  <Badge className="bg-primary text-primary-foreground hover:bg-primary rounded-full px-3 text-[10px] tracking-wider uppercase">
                    Bestseller
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            {category && (
              <Link
                href={`/menu?category=${category.slug}`}
                className="text-xs tracking-[0.2em] uppercase text-primary hover:underline underline-offset-4 mb-3"
              >
                {category.name}
              </Link>
            )}
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl tracking-tight text-balance">
              {product.name}
            </h1>

            <div className="mt-4 flex items-center gap-4">
              <RatingStars rating={product.rating} reviewCount={product.reviewCount} showValue />
            </div>

            <p className="mt-6 text-base text-foreground/85 leading-relaxed">
              {product.description}
            </p>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-serif text-3xl md:text-4xl">{formatNaira(product.price)}</span>
              {product.oldPrice && (
                <span className="text-base text-muted-foreground line-through">
                  {formatNaira(product.oldPrice)}
                </span>
              )}
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-3 border-y border-border/60 py-5">
              <div className="flex flex-col gap-1.5">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5" />
                  Prep
                </dt>
                <dd className="text-sm font-medium">{product.prepTimeMinutes} mins</dd>
              </div>
              <div className="flex flex-col gap-1.5">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  Serves
                </dt>
                <dd className="text-sm font-medium">{product.servingSize}</dd>
              </div>
              <div className="flex flex-col gap-1.5">
                <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground flex items-center gap-1.5">
                  <Flame className="size-3.5" />
                  Spice
                </dt>
                <dd className="text-sm font-medium">
                  <SpiceLevel level={product.spiceLevel} />
                </dd>
              </div>
            </dl>

            {product.dietary.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {product.dietary.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="rounded-full border-primary/25 text-foreground/80 bg-secondary/40 capitalize text-xs"
                  >
                    {tag.replace("-", " ")}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <div className="inline-flex items-center border border-border rounded-full h-12 bg-card">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="size-12 inline-flex items-center justify-center text-foreground/70 hover:text-primary transition-colors"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-10 text-center font-medium tabular-nums" aria-live="polite">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="size-12 inline-flex items-center justify-center text-foreground/70 hover:text-primary transition-colors"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <Button
                size="lg"
                onClick={handleAdd}
                className="rounded-full h-12 flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingBag className="size-4" />
                Add to cart — {formatNaira(product.price * quantity)}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  toggleWishlist(product.id)
                  toast(inWishlist ? "Removed from wishlist" : "Saved to wishlist")
                }}
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                className="rounded-full h-12 size-12 p-0 bg-transparent"
              >
                <Heart className={cn("size-5", inWishlist && "fill-primary text-primary")} />
              </Button>
            </div>

            <Tabs defaultValue="ingredients" className="mt-10">
              <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start gap-6 h-auto p-0">
                <TabsTrigger
                  value="ingredients"
                  className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm tracking-wide data-[state=active]:text-primary"
                >
                  Ingredients
                </TabsTrigger>
                <TabsTrigger
                  value="pairings"
                  className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm tracking-wide data-[state=active]:text-primary"
                >
                  Perfect with
                </TabsTrigger>
                <TabsTrigger
                  value="nutrition"
                  className="rounded-none border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 text-sm tracking-wide data-[state=active]:text-primary"
                >
                  Details
                </TabsTrigger>
              </TabsList>
              <TabsContent value="ingredients" className="pt-5">
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-foreground/85">
                  {product.ingredients.map((ing) => (
                    <li key={ing} className="flex items-start gap-2">
                      <span className="size-1 rounded-full bg-primary mt-2 shrink-0" />
                      {ing}
                    </li>
                  ))}
                </ul>
              </TabsContent>
              <TabsContent value="pairings" className="pt-5">
                {product.pairings && product.pairings.length > 0 ? (
                  <ul className="text-sm text-foreground/85 flex flex-col gap-2">
                    {product.pairings.map((p) => (
                      <li key={p} className="flex items-start gap-2">
                        <span className="size-1 rounded-full bg-primary mt-2 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Pairs beautifully with our house chapman or zobo.
                  </p>
                )}
              </TabsContent>
              <TabsContent value="nutrition" className="pt-5">
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <dt className="text-muted-foreground">Calories</dt>
                    <dd className="font-medium">{product.calories} kcal</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <dt className="text-muted-foreground">Serving</dt>
                    <dd className="font-medium">{product.servingSize}</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <dt className="text-muted-foreground">Prep time</dt>
                    <dd className="font-medium">{product.prepTimeMinutes} min</dd>
                  </div>
                  <div className="flex justify-between border-b border-border/60 pb-2">
                    <dt className="text-muted-foreground">Storage</dt>
                    <dd className="font-medium">Refrigerate</dd>
                  </div>
                </dl>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="mt-16 md:mt-24">
          <ReviewsSection
            rating={product.rating}
            reviewCount={product.reviewCount}
            reviews={product.reviews}
          />
        </div>

        {related.length > 0 && (
          <div className="mt-16 md:mt-24">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-xs tracking-[0.2em] uppercase text-primary mb-2">
                  You may also love
                </p>
                <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
                  More from {category?.name}
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
