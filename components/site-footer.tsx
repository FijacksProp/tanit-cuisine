"use client"

import Link from "next/link"
import * as React from "react"
import { Instagram, Facebook, Twitter, Send } from "lucide-react"
import { TanitLogo } from "./tanit-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { categories } from "@/lib/data"
import { toast } from "sonner"

export function SiteFooter() {
  const [email, setEmail] = React.useState("")

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }
    toast.success("You're on the list", {
      description: "Welcome to the Tanit family. Watch your inbox for our next drop.",
    })
    setEmail("")
  }

  return (
    <footer className="bg-secondary text-secondary-foreground mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <TanitLogo className="h-24" />
            <p className="mt-6 max-w-md text-sm leading-relaxed text-secondary-foreground/80">
              Modern Nigerian cuisine, prepared with heritage technique and the finest local
              ingredients. Crafted in Ilorin, Kwara State, delivered with care.
            </p>
            <form onSubmit={onSubscribe} className="mt-8 flex max-w-md gap-2">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary-foreground/5 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
                aria-label="Subscribe"
              >
                <Send className="size-4" />
              </Button>
            </form>
            <p className="text-xs text-secondary-foreground/60 mt-3">
              Join the table — seasonal menus, supper clubs and recipes.
            </p>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-secondary-foreground/60 mb-5">
              Menu
            </h4>
            <ul className="space-y-3 text-sm">
              {categories.slice(0, 6).map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/menu?category=${c.slug}`}
                    className="hover:text-accent transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-secondary-foreground/60 mb-5">
              Tanit
            </h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-accent transition-colors">Our Story</Link></li>
              <li><Link href="/menu" className="hover:text-accent transition-colors">Menu</Link></li>
              <li><Link href="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
              <li><Link href="/track" className="hover:text-accent transition-colors">Track Order</Link></li>
              <li><Link href="/careers" className="hover:text-accent transition-colors">Careers</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-sans text-xs uppercase tracking-[0.2em] text-secondary-foreground/60 mb-5">
              Visit
            </h4>
            <address className="not-italic text-sm leading-relaxed text-secondary-foreground/85">
              Tanit House<br />
              GRA<br />
              Ilorin, Kwara State
            </address>
            <p className="text-sm mt-4 text-secondary-foreground/85">
              Tue&ndash;Sun &middot; 12:00 &ndash; 22:00<br />
              <a href="tel:+2348000000000" className="hover:text-accent transition-colors">
                +234 800 000 0000
              </a>
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                aria-label="Instagram"
                className="size-9 rounded-full bg-secondary-foreground/10 hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center transition-colors"
              >
                <Instagram className="size-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="size-9 rounded-full bg-secondary-foreground/10 hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center transition-colors"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="size-9 rounded-full bg-secondary-foreground/10 hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center transition-colors"
              >
                <Twitter className="size-4" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-10 bg-secondary-foreground/15" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-secondary-foreground/60">
          <p>&copy; {new Date().getFullYear()} Tanit Cuisine. Crafted in Ilorin, Kwara State.</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms</Link>
            <Link href="/accessibility" className="hover:text-accent transition-colors">Accessibility</Link>
            <Link href="/sitemap" className="hover:text-accent transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
