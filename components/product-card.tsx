"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store-context"
import type { Product } from "@/lib/types"
import { formatNaira } from "@/lib/format"
import { RatingStars } from "./rating-stars"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ProductCardProps {
  product: Product
  variant?: "default" | "compact" | "feature"
  priority?: boolean
}

export function ProductCard({ product, variant = "default", priority = false }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore()
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product.id, 1)
    toast.success(`${product.name} added to cart`, {
      description: formatNaira(product.price),
    })
  }

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlist(product.id)
    toast(inWishlist ? "Removed from wishlist" : "Saved to wishlist", {
      description: product.name,
    })
  }

  if (variant === "feature") {
    return (
      <Link
        href={`/menu/${product.slug}`}
        className="group relative block overflow-hidden rounded-lg bg-card"
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/10 to-transparent" />
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
          <button
            type="button"
            onClick={handleWishlist}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-4 right-4 size-9 rounded-full bg-background/80 backdrop-blur hover:bg-background flex items-center justify-center transition-colors"
          >
            <Heart
              className={cn("size-4", inWishlist ? "fill-primary text-primary" : "text-foreground")}
              strokeWidth={1.5}
            />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6 text-background">
            <p className="text-[11px] tracking-[0.18em] uppercase opacity-80">
              {product.servingSize}
            </p>
            <h3 className="mt-1 font-serif text-2xl leading-tight">{product.name}</h3>
            <p className="mt-2 text-sm text-background/85 line-clamp-2 max-w-md">
              {product.shortDescription}
            </p>
            <div className="mt-4 flex items-end justify-between gap-3">
              <div>
                <RatingStars rating={product.rating} reviewCount={product.reviewCount} showValue className="text-background [&_.text-muted-foreground]:text-background/80" />
                <p className="mt-2 font-serif text-xl">{formatNaira(product.price)}</p>
              </div>
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="bg-background text-foreground hover:bg-accent hover:text-accent-foreground rounded-full"
              >
                Add
                <Plus className="size-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/menu/${product.slug}`}
      className="group relative flex flex-col h-full bg-card rounded-lg overflow-hidden border border-border/50 hover:border-primary/30 transition-all hover:shadow-[0_8px_24px_-8px_rgba(70,30,10,0.18)]"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {product.isNew && (
            <Badge className="bg-accent text-accent-foreground hover:bg-accent text-[10px] tracking-wider uppercase rounded-full px-2.5 py-0.5">
              New
            </Badge>
          )}
          {product.bestseller && (
            <Badge className="bg-primary text-primary-foreground hover:bg-primary text-[10px] tracking-wider uppercase rounded-full px-2.5 py-0.5">
              Bestseller
            </Badge>
          )}
          {product.oldPrice && (
            <Badge variant="outline" className="bg-background text-foreground text-[10px] tracking-wider uppercase rounded-full px-2.5 py-0.5">
              Save {formatNaira(product.oldPrice - product.price)}
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 size-9 rounded-full bg-background/80 backdrop-blur hover:bg-background flex items-center justify-center transition-colors"
        >
          <Heart
            className={cn("size-4", inWishlist ? "fill-primary text-primary" : "text-foreground")}
            strokeWidth={1.5}
          />
        </button>
        <Button
          type="button"
          onClick={handleAddToCart}
          size="sm"
          className="absolute bottom-3 right-3 rounded-full opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
        >
          <Plus className="size-4" />
          <span>Add</span>
        </Button>
      </div>

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg leading-tight text-balance">{product.name}</h3>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {product.shortDescription}
        </p>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-serif text-lg leading-none">{formatNaira(product.price)}</span>
            {product.oldPrice && (
              <span className="text-xs text-muted-foreground line-through mt-0.5">
                {formatNaira(product.oldPrice)}
              </span>
            )}
          </div>
          <RatingStars rating={product.rating} reviewCount={product.reviewCount} showValue />
        </div>
      </div>
    </Link>
  )
}
