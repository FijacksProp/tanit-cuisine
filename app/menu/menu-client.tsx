"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SlidersHorizontal, Search, X } from "lucide-react"
import { products, categories } from "@/lib/data"
import { ProductCard } from "@/components/product-card"
import { MenuFilters, DEFAULT_FILTERS, type MenuFilterState } from "@/components/menu-filters"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CategorySlug } from "@/lib/types"

export function MenuPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQ = searchParams.get("q") ?? ""
  const initialCategory = searchParams.get("category") as CategorySlug | null

  const [query, setQuery] = React.useState(initialQ)
  const [filters, setFilters] = React.useState<MenuFilterState>({
    ...DEFAULT_FILTERS,
    category: initialCategory,
  })

  React.useEffect(() => {
    setQuery(initialQ)
  }, [initialQ])

  React.useEffect(() => {
    setFilters((f) => ({ ...f, category: initialCategory }))
  }, [initialCategory])

  const filtered = React.useMemo(() => {
    let list = [...products]
    if (filters.category) list = list.filter((p) => p.category === filters.category)
    if (query.trim()) {
      const q = query.toLowerCase().trim()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortDescription.toLowerCase().includes(q) ||
          p.ingredients.some((i) => i.toLowerCase().includes(q)),
      )
    }
    list = list.filter((p) => p.price <= filters.priceMax)
    list = list.filter((p) => p.spiceLevel <= filters.spiceMax)
    if (filters.dietary.length > 0) {
      list = list.filter((p) => filters.dietary.every((d) => p.dietary.includes(d)))
    }

    switch (filters.sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        list.sort((a, b) => b.price - a.price)
        break
      case "rating":
        list.sort((a, b) => b.rating - a.rating)
        break
      case "newest":
        list.sort((a, b) => Number(!!b.isNew) - Number(!!a.isNew))
        break
      default:
        list.sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
    }

    return list
  }, [filters, query])

  const activeCategory = filters.category
    ? categories.find((c) => c.slug === filters.category)
    : null

  const handleResetAll = () => {
    setQuery("")
    setFilters(DEFAULT_FILTERS)
    router.replace("/menu")
  }

  return (
    <div>
      <section className="border-b border-border/60 bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 md:py-16">
          <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">
            {activeCategory ? activeCategory.tagline : "The full menu"}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl tracking-tight text-balance">
            {activeCategory ? activeCategory.name : "Discover every dish."}
          </h1>
          <p className="mt-4 max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed">
            {activeCategory
              ? activeCategory.description
              : "From smoky party jollof to delicate modern fusion plates — every dish at Tanit is built on a foundation of heritage, technique, and the very best Nigerian ingredients."}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 lg:gap-12">
          <aside className="hidden lg:block sticky top-24 self-start">
            <MenuFilters filters={filters} onChange={setFilters} onReset={handleResetAll} />
          </aside>

          <div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name, ingredient..."
                  className="pl-9 pr-9 h-11 rounded-full bg-card"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      size="default"
                      className="lg:hidden rounded-full bg-transparent gap-2 h-11"
                    >
                      <SlidersHorizontal className="size-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[85vw] sm:w-96 overflow-y-auto">
                    <SheetHeader className="mb-6">
                      <SheetTitle className="font-serif text-2xl">Filters</SheetTitle>
                      <SheetDescription className="sr-only">
                        Filter dishes by category, dietary preferences, spice level, and price.
                      </SheetDescription>
                    </SheetHeader>
                    <MenuFilters
                      filters={filters}
                      onChange={setFilters}
                      onReset={handleResetAll}
                    />
                  </SheetContent>
                </Sheet>
                <Select
                  value={filters.sort}
                  onValueChange={(v) => setFilters({ ...filters, sort: v as MenuFilterState["sort"] })}
                >
                  <SelectTrigger className="rounded-full h-11 min-w-[160px] bg-card">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to high</SelectItem>
                    <SelectItem value="price-desc">Price: High to low</SelectItem>
                    <SelectItem value="rating">Top rated</SelectItem>
                    <SelectItem value="newest">New arrivals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-medium">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "dish" : "dishes"}
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg p-12 text-center">
                <p className="font-serif text-2xl mb-2">No dishes match your filters</p>
                <p className="text-muted-foreground mb-6">
                  Try widening your price range or removing dietary filters.
                </p>
                <Button onClick={handleResetAll} className="rounded-full">
                  Reset filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {filtered.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
