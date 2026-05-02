import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export const metadata = {
  title: "Our Story — Tanit Cuisine",
  description:
    "Tanit Cuisine is a contemporary Nigerian kitchen built on heritage recipes, modern technique and uncompromising ingredients.",
}

const values = [
  {
    n: "01",
    title: "Heritage first",
    body: "Every recipe begins with a story — passed from grandmother to mother to chef. We honour the techniques and proportions that built Nigerian cuisine.",
  },
  {
    n: "02",
    title: "Ingredient obsession",
    body: "We source palm oil from Cross River, scotch bonnet from Kano markets, and ofada rice from Ogun farms — direct from growers who care.",
  },
  {
    n: "03",
    title: "Modern technique",
    body: "Our kitchen blends traditional firewood smoking with sous-vide precision. Tradition isn't preserved by repetition — it's preserved by mastery.",
  },
  {
    n: "04",
    title: "Hospitality",
    body: "From the first click to the last bite, we treat every guest like family. Tanit means goddess of love and abundance — and that's the table we set.",
  },
]

export default function AboutPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/ambiance.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/60 via-foreground/40 to-foreground/70" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-24 md:py-36 text-background">
          <p className="text-xs tracking-[0.25em] uppercase mb-4 text-background/80">
            Our story
          </p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl tracking-tight max-w-4xl text-balance">
            A modern Nigerian kitchen, rooted in memory.
          </h1>
          <p className="mt-6 max-w-2xl text-base md:text-lg text-background/90 leading-relaxed">
            Tanit Cuisine was born from a simple conviction — that Nigerian food, the food we
            grew up around, deserved to be served with the same reverence as any great cuisine
            on earth.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="relative aspect-[4/5] rounded-lg overflow-hidden bg-muted">
            <Image
              src="/images/story.jpg"
              alt="Chef plating a Tanit dish"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">
              Founded 2021 — Ilorin, Kwara State
            </p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-balance">
              From Ilorin kitchens to your table.
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-base text-foreground/85 leading-relaxed">
              <p>
                It started in a small kitchen in Ilorin, with a stubborn belief that party-jollof
                deserved its own pedestal — and that pounded yam, made by hand, hits a note no
                blender ever could. We opened our doors to a few neighbours. Word travelled.
              </p>
              <p>
                Today, our kitchen serves thousands of plates a week — across our flagship dining
                room, our delivery service, and a private events programme that has cooked for
                three Heads of State and seven Michelin-starred chefs visiting the country.
              </p>
              <p>
                But the soul has not changed. Our chef still tastes every batch of stew. We still
                source our palm oil from the same family in Cross River. And we still believe
                that the most luxurious thing on a plate is care.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/40 border-y border-border/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
          <div className="max-w-2xl">
            <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">
              What we stand for
            </p>
            <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-balance">
              Four principles guide every plate.
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {values.map((v) => (
              <div
                key={v.n}
                className="bg-card border border-border/60 rounded-lg p-7 md:p-8"
              >
                <p className="font-serif text-3xl text-primary">{v.n}</p>
                <h3 className="mt-4 font-serif text-2xl tracking-tight">{v.title}</h3>
                <p className="mt-3 text-sm text-foreground/80 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { n: "12k+", l: "Plates served monthly" },
            { n: "47", l: "Recipes from heritage" },
            { n: "100%", l: "Locally sourced staples" },
            { n: "4.9", l: "Average rating" },
          ].map((s) => (
            <div key={s.l} className="text-center md:text-left">
              <p className="font-serif text-5xl md:text-6xl text-primary">{s.n}</p>
              <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28 text-center">
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight max-w-3xl mx-auto text-balance">
            Come hungry. Leave with a story.
          </h2>
          <Button
            asChild
            size="lg"
            className="mt-8 rounded-full bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Link href="/menu" className="gap-2">
              Explore the menu
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
