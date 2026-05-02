import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface RatingStarsProps {
  rating: number
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  reviewCount?: number
  className?: string
}

export function RatingStars({
  rating,
  size = "sm",
  showValue = false,
  reviewCount,
  className,
}: RatingStarsProps) {
  const sizes = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5",
  } as const

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="inline-flex items-center" aria-label={`${rating} out of 5 stars`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const filled = i < Math.floor(rating)
          const half = !filled && i < rating
          return (
            <span key={i} className="relative">
              <Star
                className={cn(
                  sizes[size],
                  filled ? "fill-accent text-accent" : "text-muted-foreground/40",
                )}
                strokeWidth={1.5}
              />
              {half && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${(rating - Math.floor(rating)) * 100}%` }}
                >
                  <Star className={cn(sizes[size], "fill-accent text-accent")} strokeWidth={1.5} />
                </span>
              )}
            </span>
          )
        })}
      </div>
      {showValue && (
        <span className="text-xs text-muted-foreground tabular-nums">
          {rating.toFixed(1)}
          {reviewCount !== undefined && (
            <span className="ml-1">({reviewCount.toLocaleString()})</span>
          )}
        </span>
      )}
    </div>
  )
}
