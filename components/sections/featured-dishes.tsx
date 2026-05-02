import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "../product-card"
import { getFeaturedProducts } from "@/lib/data"

export function FeaturedDishes() {
  const featured = getFeaturedProducts().slice(0, 6)
  const [hero, ...rest] = featured

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10 md:mb-14">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">
            Chef&apos;s selection
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance">
            The dishes we&apos;re known for.
          </h2>
        </div>
        <Button asChild variant="ghost" className="rounded-full self-start md:self-auto">
          <Link href="/menu">
            View all dishes
            <ArrowRight className="size-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {hero && (
          <div className="lg:col-span-5">
            <ProductCard product={hero} variant="feature" priority />
          </div>
        )}
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6">
          {rest.slice(0, 4).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
