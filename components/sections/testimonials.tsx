import { Quote, Star } from "lucide-react"

const reviews = [
  {
    quote:
      "The smoky depth of the jollof is unreal. Tanit has redefined what fine Nigerian dining looks like in Ilorin, Kwara State — and it travels.",
    name: "BellaNaija Food",
    role: "Editorial Feature",
    rating: 5,
  },
  {
    quote:
      "From the suya crust to the way they wrap the moin moin in leaves — every detail says someone cared. This is the new standard.",
    name: "Tope Ogundipe",
    role: "Food Writer, The Republic",
    rating: 5,
  },
  {
    quote:
      "We catered our wedding with Tanit. Six months later, guests are still texting about the small chops platter. Worth every kobo.",
    name: "Adaeze & Kelechi",
    role: "Private Event",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">
          Voices at the table
        </p>
        <h2 className="font-serif text-4xl md:text-5xl tracking-tight text-balance">
          What people are saying.
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-5 md:gap-6">
        {reviews.map((r, i) => (
          <figure
            key={i}
            className="relative bg-card border border-border rounded-lg p-7 flex flex-col"
          >
            <Quote className="size-8 text-accent" strokeWidth={1.2} />
            <div className="flex items-center gap-0.5 mt-4">
              {[...Array(r.rating)].map((_, idx) => (
                <Star key={idx} className="size-3.5 fill-accent text-accent" strokeWidth={1.5} />
              ))}
            </div>
            <blockquote className="font-serif text-lg md:text-xl leading-snug text-balance mt-4 flex-1">
              &ldquo;{r.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-6 pt-5 border-t border-border">
              <p className="font-medium text-sm">{r.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
