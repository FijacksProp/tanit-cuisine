import Link from "next/link"
import { categories, products } from "@/lib/data"

export const metadata = {
  title: "Sitemap - Tanit Cuisine",
  description: "Browse all main Tanit Cuisine pages.",
}

const pages = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Our Story" },
  { href: "/contact", label: "Contact" },
  { href: "/cart", label: "Cart" },
  { href: "/checkout", label: "Checkout" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/track", label: "Track Order" },
  { href: "/careers", label: "Careers" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/accessibility", label: "Accessibility" },
]

export default function SitemapPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-14 md:py-20">
      <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Sitemap</p>
      <h1 className="font-serif text-4xl md:text-6xl tracking-tight">Find your way around.</h1>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <SitemapGroup title="Pages" links={pages} />
        <SitemapGroup
          title="Categories"
          links={categories.map((category) => ({
            href: `/menu?category=${category.slug}`,
            label: category.name,
          }))}
        />
        <SitemapGroup
          title="Dishes"
          links={products.map((product) => ({
            href: `/menu/${product.slug}`,
            label: product.name,
          }))}
        />
      </div>
    </div>
  )
}

function SitemapGroup({
  title,
  links,
}: {
  title: string
  links: Array<{ href: string; label: string }>
}) {
  return (
    <section>
      <h2 className="font-serif text-2xl tracking-tight mb-5">{title}</h2>
      <ul className="flex flex-col gap-3 text-sm">
        {links.map((link) => (
          <li key={`${link.href}-${link.label}`}>
            <Link href={link.href} className="text-foreground/80 hover:text-primary">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
