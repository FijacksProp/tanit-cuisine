import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getProductsByCategory } from "@/lib/data"
import { formatNaira } from "@/lib/format"

export function ModernFusion() {
  const items = getProductsByCategory("modern-fusion").slice(0, 3)

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
      <div className="grid lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-4 lg:sticky lg:top-28 self-start">
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">
            Modern Fusion
          </p>
          <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-balance leading-[1.05]">
            Heritage, reimagined for the modern table.
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed text-pretty">
            Where jollof meets risotto, suya finds a tortilla, and plantain takes the place
            of potato. A small, ever-evolving section of the menu where our chefs play,
            built on the techniques we inherited.
          </p>
          <Button asChild variant="ghost" className="rounded-full mt-6 -ml-4">
            <Link href="/menu?category=modern-fusion">
              See all fusion dishes
              <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {items.map((p, i) => (
            <Link
              key={p.id}
              href={`/menu/${p.slug}`}
              className={`group relative block overflow-hidden rounded-lg ${
                i === 0 ? "md:translate-y-0" : i === 1 ? "md:translate-y-8" : "md:translate-y-16"
              }`}
            >
              <div className="relative aspect-[3/4] bg-muted">
                <Image
                  src={p.image || "/placeholder.svg"}
                  alt={p.name}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 768px) 30vw, 100vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5 text-background">
                  <h3 className="font-serif text-xl leading-tight">{p.name}</h3>
                  <p className="mt-2 text-xs opacity-85 line-clamp-2">{p.shortDescription}</p>
                  <p className="font-serif text-base mt-3">{formatNaira(p.price)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
