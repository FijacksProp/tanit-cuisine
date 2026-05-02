"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Heart, Menu, Search, ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useStore } from "@/lib/store-context"
import { categories } from "@/lib/data"
import { cn } from "@/lib/utils"
import { TanitLogo } from "./tanit-logo"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Our Story" },
  { href: "/wishlist", label: "Wishlist" },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { cartCount, wishlist, openCart } = useStore()
  const [searchOpen, setSearchOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = searchQuery.trim()
    if (!q) return
    setSearchOpen(false)
    router.push(`/menu?q=${encodeURIComponent(q)}`)
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "bg-background/85 backdrop-blur-md border-b border-border/60 shadow-[0_1px_0_0_rgba(0,0,0,0.02)]"
          : "bg-transparent",
      )}
    >
      <div className="hidden md:block border-b border-border/40 bg-secondary text-secondary-foreground">
        <div className="mx-auto max-w-7xl px-6 flex items-center justify-between text-xs py-2">
          <p className="tracking-wide">Free delivery on orders over &#8358;25,000 within Ilorin, Kwara State</p>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/track" className="hover:text-accent transition-colors">
              Track Order
            </Link>
            <Link href="/contact" className="hover:text-accent transition-colors">
              Contact
            </Link>
            <span className="opacity-70">EN | NG</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden -ml-2"
                  aria-label="Open menu"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[85vw] sm:w-96 p-0">
                <SheetHeader className="border-b p-6">
                  <SheetTitle>
                    <TanitLogo className="h-16" />
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Site navigation menu
                  </SheetDescription>
                </SheetHeader>
                <nav className="p-6 flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="py-3 px-2 text-base font-medium hover:text-primary transition-colors border-b border-border/40 last:border-0"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-3">
                    Shop by Category
                  </p>
                  <div className="flex flex-col gap-1">
                    {categories.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/menu?category=${c.slug}`}
                        className="py-2 text-sm hover:text-primary transition-colors"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.slice(0, 3).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm tracking-wide transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-foreground/80",
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center"
            aria-label="Tanit Cuisine home"
          >
            <TanitLogo className="h-12 md:h-16" />
          </Link>

          <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Search"
              onClick={() => setSearchOpen((s) => !s)}
            >
              <Search className="size-5" />
            </Button>
            <Link href="/wishlist" aria-label="Wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="size-5" />
                {wishlist.length > 0 && (
                  <Badge
                    className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center"
                    variant="default"
                  >
                    {wishlist.length}
                  </Badge>
                )}
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Cart"
              className="relative"
              onClick={openCart}
            >
              <ShoppingBag className="size-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {cartCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-border/60 bg-background">
          <form
            onSubmit={onSearchSubmit}
            className="mx-auto max-w-3xl px-4 sm:px-6 py-4 flex items-center gap-3"
          >
            <Search className="size-5 text-muted-foreground shrink-0" />
            <Input
              autoFocus
              placeholder="Search jollof, suya, egusi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-base"
            />
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Close search"
            >
              <X className="size-4" />
            </Button>
          </form>
        </div>
      )}
    </header>
  )
}
