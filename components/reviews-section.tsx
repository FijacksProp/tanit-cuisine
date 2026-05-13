"use client"

import * as React from "react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle2 } from "lucide-react"
import type { Review } from "@/lib/types"
import { RatingStars } from "./rating-stars"
import { apiRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ReviewsSectionProps {
  productSlug: string
  rating: number
  reviewCount: number
  reviews: Review[]
}

export function ReviewsSection({ productSlug, rating, reviewCount, reviews }: ReviewsSectionProps) {
  const { accessToken, user } = useAuth()
  const [showAll, setShowAll] = React.useState(false)
  const [localReviews, setLocalReviews] = React.useState(reviews)
  const [localRating, setLocalRating] = React.useState(rating)
  const [localReviewCount, setLocalReviewCount] = React.useState(reviewCount)
  const [form, setForm] = React.useState({ rating: 5, title: "", comment: "" })
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    setLocalReviews(reviews)
    setLocalRating(rating)
    setLocalReviewCount(reviewCount)
  }, [rating, reviewCount, reviews])

  const visible = showAll ? localReviews : localReviews.slice(0, 4)

  const distribution = React.useMemo(() => {
    const buckets = [5, 4, 3, 2, 1].map((star) => {
      const count = localReviews.filter((r) => Math.round(r.rating) === star).length
      return { star, count, percent: localReviews.length ? (count / localReviews.length) * 100 : 0 }
    })
    return buckets
  }, [localReviews])

  const submitReview = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!accessToken) return
    setError("")
    setSubmitting(true)
    try {
      const response = await apiRequest<{
        review: Review
        productRating: number
        productReviewCount: number
      }>(`/products/${productSlug}/reviews/`, {
        method: "POST",
        token: accessToken,
        body: JSON.stringify(form),
      })
      setLocalReviews((current) => [response.review, ...current])
      setLocalRating(response.productRating)
      setLocalReviewCount(response.productReviewCount)
      setForm({ rating: 5, title: "", comment: "" })
      toast.success("Review submitted")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit review")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="border-t border-border/60 pt-12 md:pt-16">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 md:gap-16">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Reviews</p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-balance">
            What our guests say.
          </h2>

          <div className="mt-8 flex items-baseline gap-3">
            <span className="font-serif text-5xl">{localRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">/ 5</span>
          </div>
          <RatingStars rating={localRating} size="lg" className="mt-2" />
          <p className="text-sm text-muted-foreground mt-2">
            Based on {localReviewCount} reviews
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
          <div className="mb-8 rounded-lg border border-border/60 bg-secondary/30 p-5">
            <h3 className="font-serif text-2xl">Rate this meal</h3>
            {user ? (
              <form onSubmit={submitReview} className="mt-5 flex flex-col gap-4">
                <div className="flex gap-2" aria-label="Choose rating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, rating: value }))}
                      className={cn(
                        "size-10 rounded-full border text-sm font-medium transition-colors",
                        form.rating === value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border bg-card hover:border-primary/50",
                      )}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <Input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  placeholder="Review title"
                  required
                />
                <Textarea
                  value={form.comment}
                  onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                  placeholder="Tell us what you thought..."
                  rows={4}
                  required
                />
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  disabled={submitting || !form.title.trim() || form.comment.trim().length < 10}
                  className="rounded-full self-start"
                >
                  {submitting ? "Submitting..." : "Submit review"}
                </Button>
              </form>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                <Link href="/signin" className="text-primary hover:underline">
                  Sign in
                </Link>{" "}
                to rate this meal.
              </p>
            )}
          </div>

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

          {localReviews.length > 4 && (
            <Button
              variant="outline"
              onClick={() => setShowAll((s) => !s)}
              className="mt-6 rounded-full bg-transparent"
            >
              {showAll ? "Show less" : `Show all ${localReviews.length} reviews`}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
