import Link from "next/link"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { ContactForm } from "./contact-form"

export const metadata = {
  title: "Contact — Tanit Cuisine",
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-14 md:py-20">
      <div className="max-w-2xl">
        <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Get in touch</p>
        <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-balance">
          We&apos;d love to hear from you.
        </h1>
        <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
          Bookings, private events, partnerships, or simply a question about our menu — our
          concierge replies within four working hours.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-12 lg:gap-20">
        <ContactForm />

        <aside className="flex flex-col gap-7">
          <div className="bg-secondary/40 border border-border/60 rounded-lg p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground mb-4">
              Direct lines
            </p>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Email</p>
                  <Link
                    href="mailto:hello@tanitcuisine.com"
                    className="hover:text-primary transition-colors"
                  >
                    hello@tanitcuisine.com
                  </Link>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Phone</p>
                  <Link
                    href="tel:+2348008264823"
                    className="hover:text-primary transition-colors"
                  >
                    +234 (0) 800 826 4823
                  </Link>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Flagship</p>
                  <p>GRA, Ilorin</p>
                  <p>Kwara State, Nigeria</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-muted-foreground text-xs">Open</p>
                  <p>Mon – Sat · 11:00 – 23:00</p>
                  <p>Sun · 12:00 – 22:00</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-foreground text-background rounded-lg p-6">
            <p className="text-xs uppercase tracking-[0.16em] text-background/70 mb-3">
              Private dining
            </p>
            <h3 className="font-serif text-2xl">Plan an event</h3>
            <p className="mt-3 text-sm text-background/80 leading-relaxed">
              Curated menus for celebrations of 12 to 200 guests, in our private salon or your
              home.
            </p>
            <Link
              href="mailto:events@tanitcuisine.com"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:text-accent transition-colors"
            >
              events@tanitcuisine.com →
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
