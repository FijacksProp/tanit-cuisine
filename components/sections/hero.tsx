import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 md:pt-14">
        <div className="relative grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[calc(100vh-12rem)]">
          <div className="lg:col-span-6 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-xs tracking-[0.16em] uppercase text-muted-foreground mb-6">
              <span className="size-1.5 rounded-full bg-primary" />
              Modern Nigerian, est. Ilorin
            </div>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-[0.95] tracking-tight text-balance">
              Heritage on{" "}
              <span className="italic text-primary">every</span> plate.
            </h1>
            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed text-pretty">
              Tanit Cuisine is a love letter to Nigerian cooking — slow-smoked jollof,
              hand-pounded yam, and modern fusion crafted by chefs who treat heritage with
              the reverence it deserves. Order tonight, dine like family.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-7">
                <Link href="/menu">
                  Explore the Menu
                  <ArrowRight className="size-4 ml-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-7 bg-transparent">
                <Link href="/about">Our Story</Link>
              </Button>
            </div>

            <div className="mt-12 flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {["CO", "AB", "FO", "TY"].map((init, i) => (
                    <div
                      key={i}
                      className="size-8 rounded-full ring-2 ring-background bg-secondary text-secondary-foreground text-[11px] font-medium flex items-center justify-center"
                    >
                      {init}
                    </div>
                  ))}
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Star key={i} className="size-3 fill-accent text-accent" strokeWidth={1.5} />
                    ))}
                    <span className="text-xs ml-1 font-medium">4.9</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Trusted by 12,000+ patrons
                  </p>
                </div>
              </div>
              <div className="hidden sm:block h-10 w-px bg-border" />
              <div className="hidden sm:block">
                <p className="font-serif text-2xl leading-none">45<span className="text-primary">+</span></p>
                <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wider">
                  Heirloom recipes
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] sm:aspect-[5/6] lg:aspect-[4/5] rounded-lg overflow-hidden">
              <Image
                src="/images/hero.jpg"
                alt="Premium plate of Nigerian jollof rice"
                fill
                priority
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-foreground/20 via-transparent to-transparent" />
            </div>

            <div className="hidden md:flex absolute -bottom-6 -left-6 bg-card rounded-lg shadow-2xl p-5 max-w-[260px] gap-3 items-center border border-border">
              <div className="relative size-14 rounded-md overflow-hidden shrink-0">
                <Image src="/images/suya.jpg" alt="Tanit suya" fill sizes="56px" className="object-cover" />
              </div>
              <div className="leading-tight">
                <p className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                  Tonight&apos;s Feature
                </p>
                <p className="font-serif text-base mt-1">Tanit Suya Skewers</p>
                <p className="text-xs text-primary mt-1">Charcoal-grilled, 14-spice yaji</p>
              </div>
            </div>

            <div className="hidden lg:flex absolute -top-4 -right-4 bg-secondary text-secondary-foreground rounded-full p-6 size-32 flex-col items-center justify-center text-center rotate-[8deg] shadow-xl">
              <p className="text-[9px] tracking-[0.2em] uppercase opacity-80">Free</p>
              <p className="font-serif text-xl leading-none mt-1">Delivery</p>
              <p className="text-[10px] tracking-wide mt-1.5 opacity-80">over &#8358;25,000</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-y border-border bg-muted/40 mt-16 md:mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { title: "Heritage Recipes", sub: "Cooked the way grandma intended" },
            { title: "Same-Day Delivery", sub: "Across Ilorin, hot from our kitchen" },
            { title: "Premium Sourcing", sub: "Local farms, ethical producers" },
            { title: "Crafted Daily", sub: "Nothing frozen, ever" },
          ].map((p) => (
            <div key={p.title} className="text-center md:text-left">
              <p className="font-serif text-base text-foreground">{p.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{p.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
