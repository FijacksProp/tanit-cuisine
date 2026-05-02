import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 md:pb-28">
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src="/images/ambiance.jpg"
          alt="Tanit House dining room"
          fill
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/65 to-foreground/30" />
        <div className="relative px-8 py-20 md:py-28 md:px-16 lg:px-24 max-w-3xl text-background">
          <p className="text-xs tracking-[0.2em] uppercase text-accent mb-4">
            Tanit House
          </p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance leading-[1.05]">
            Pull up a chair. Stay a while.
          </h2>
          <p className="mt-5 text-base md:text-lg text-background/85 leading-relaxed text-pretty max-w-xl">
            Reserve a table at our Ilorin flagship, or have us deliver tonight&apos;s
            tasting menu to your door.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/menu">
                Order Now
                <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full bg-transparent border-background/40 text-background hover:bg-background hover:text-foreground"
            >
              <Link href="/contact">Reserve a table</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
