import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Story() {
  return (
    <section className="bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-32">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden">
              <Image
                src="/images/story.jpg"
                alt="Tanit chef plating a dish"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
            <div className="hidden md:block absolute -bottom-6 -right-6 bg-card text-foreground rounded-lg p-5 max-w-[280px] shadow-2xl border border-border">
              <p className="font-serif text-3xl leading-none text-primary">12k+</p>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                Patrons served since we opened the doors of Tanit House in 2019.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6">
            <p className="text-xs tracking-[0.2em] uppercase text-accent mb-4">
              Our Story
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance leading-[1.05]">
              Recipes carry the people who taught us.
            </h2>
            <div className="mt-8 space-y-5 text-secondary-foreground/85 leading-relaxed text-pretty">
              <p>
                Tanit was born in our grandmother&apos;s Yaba kitchen, where Sunday meant
                pounded yam and egusi for fifteen, and where the firewood smell of party
                jollof drifted across the compound. We grew up believing food was how
                people said the things they couldn&apos;t put into words.
              </p>
              <p>
                Today, we cook the way we were taught — patiently, generously, and with the
                conviction that a plate of jollof can carry an entire culture. We source
                from farms we know by name, grind our spices in-house, and refuse to take
                shortcuts on the things that matter.
              </p>
            </div>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="/about">Read our story</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-full bg-transparent border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 hover:text-secondary-foreground"
              >
                <Link href="/menu">See the menu</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
