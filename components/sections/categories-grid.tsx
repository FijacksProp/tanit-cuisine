import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { categories } from "@/lib/data"

export function CategoriesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
        <div>
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">
            Explore the menu
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance">
            From the firewood to your fork.
          </h2>
        </div>
        <p className="md:max-w-md text-muted-foreground text-pretty">
          Eight chapters of flavour — each rooted in tradition, polished for the modern table.
          Wander, and let your palate lead.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {categories.map((c, i) => (
          <Link
            key={c.slug}
            href={`/menu?category=${c.slug}`}
            className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-muted block"
          >
            <Image
              src={c.image || "/placeholder.svg"}
              alt={c.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/10 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-between text-background">
              <div className="flex items-start justify-between">
                <span className="text-[10px] tracking-[0.22em] uppercase opacity-80">
                  0{i + 1}
                </span>
                <span className="size-8 rounded-full bg-background/15 backdrop-blur flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
              <div>
                <h3 className="font-serif text-xl md:text-2xl leading-tight">{c.name}</h3>
                <p className="text-xs mt-1 opacity-85 line-clamp-1">{c.tagline}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
