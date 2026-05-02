"use client"

import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"
import type { Review } from "@/lib/types"
import { RatingStars } from "./rating-stars"
import { cn } from "@/lib/utils"

interface ReviewsSectionProps {
  rating: number
  reviewCount: number
  reviews: Review[]
}

export function ReviewsSection({ rating, reviewCount, reviews }: ReviewsSectionProps) {
  const [showAll, setShowAll] = React.useState(false)
  const visible = showAll ? reviews : reviews.slice(0, 4)

  const distribution = React.useMemo(() => {
    const buckets = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((r) => Math.round(r.rating) === star).length
      return { star, count, percent: reviews.length ? (count / reviews.length) * 100 : 0 }
    })
    return buckets
  }, [reviews])

  return (
    <section className="border-t border-border/60 pt-12 md:pt-16">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-16">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Reviews</p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-balance">
            What our guests say.
          </h2>

          <div className="mt-8 flex items-baseline gap-3">
            <span className="font-serif text-5xl">{rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">/ 5</span>
          </div>
          <RatingStars rating={rating} size="lg" className="mt-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Based on {reviewCount} reviews
          </p>

          <div className="mt-6 flex flex-col gap-2">
            {distribution.map((d) => (
              <div key={d.star} className="flex items-center gap-3 text-xs">
                <span className="w-4 text-foreground/80 tabular-nums">{d.star}</span>
                <Progress value={d.percent} className="h-1.5 flex-1" />
                <span className="w-8 text-right text-muted-foreground tabular-nums">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <ul className="flex flex-col">
            {visible.map((review, idx) => (
              <li
                key={review.id}
                className={cn(
                  "py-7",
                  idx !== 0 && "border-t border-border/60",
                  idx === 0 && "pt-0",
                )}
              >
                <div className="flex items-start gap-4">
                  <Avatar className="size-11 bg-secondary">
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-serif">
                      {review.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <p className="font-medium">{review.author}</p>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-primary">
                          <CheckCircle2 className="size-3" />
                          Verified order
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <RatingStars rating={review.rating} size="sm" className="mt-1.5" />
                    <h4 className="font-serif text-lg mt-3">{review.title}</h4>
                    <p className="text-sm text-foreground/85 leading-relaxed mt-1.5">
                      {review.comment}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {reviews.length > 4 && (
            <Button
              variant="outline"
              onClick={() => setShowAll((s) => !s)}
              className="mt-6 rounded-full bg-transparent"
            >
              {showAll ? "Show less" : `Show all ${reviews.length} reviews`}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
