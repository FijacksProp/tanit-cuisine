"use client"

import * as React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { categories } from "@/lib/data"
import { formatNaira } from "@/lib/format"
import type { DietaryTag } from "@/lib/types"
import { cn } from "@/lib/utils"

const DIETARY_TAGS: { value: DietaryTag; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten-free", label: "Gluten Free" },
  { value: "dairy-free", label: "Dairy Free" },
  { value: "spicy", label: "Spicy" },
  { value: "chef-special", label: "Chef Special" },
]

export interface MenuFilterState {
  category: string | null
  priceMax: number
  dietary: DietaryTag[]
  spiceMax: number
  sort: "relevance" | "price-asc" | "price-desc" | "rating" | "newest"
}

export const DEFAULT_FILTERS: MenuFilterState = {
  category: null,
  priceMax: 50000,
  dietary: [],
  spiceMax: 3,
  sort: "relevance",
}

interface MenuFiltersProps {
  filters: MenuFilterState
  onChange: (next: MenuFilterState) => void
  onReset: () => void
  className?: string
}

export function MenuFilters({ filters, onChange, onReset, className }: MenuFiltersProps) {
  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Categories</h3>
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => onChange({ ...filters, category: null })}
            className={cn(
              "text-left text-sm py-1.5 transition-colors hover:text-primary",
              filters.category === null ? "text-primary font-medium" : "text-foreground/80",
            )}
          >
            All dishes
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => onChange({ ...filters, category: c.slug })}
              className={cn(
                "text-left text-sm py-1.5 transition-colors hover:text-primary",
                filters.category === c.slug ? "text-primary font-medium" : "text-foreground/80",
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
          Price up to
        </h3>
        <Slider
          min={2000}
          max={50000}
          step={1000}
          value={[filters.priceMax]}
          onValueChange={(v) => onChange({ ...filters, priceMax: v[0] })}
          className="mt-2"
        />
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">{formatNaira(2000)}</span>
          <span className="text-sm font-medium">{formatNaira(filters.priceMax)}</span>
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">Dietary</h3>
        <div className="flex flex-col gap-2.5">
          {DIETARY_TAGS.map((tag) => {
            const checked = filters.dietary.includes(tag.value)
            return (
              <Label
                key={tag.value}
                className="flex items-center gap-3 cursor-pointer text-sm font-normal"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(c) => {
                    const next = c
                      ? [...filters.dietary, tag.value]
                      : filters.dietary.filter((d) => d !== tag.value)
                    onChange({ ...filters, dietary: next })
                  }}
                />
                {tag.label}
              </Label>
            )
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-4">
          Max spice level
        </h3>
        <div className="flex gap-2">
          {[0, 1, 2, 3].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onChange({ ...filters, spiceMax: lvl })}
              className={cn(
                "flex-1 py-2 text-sm rounded-full border transition-colors",
                filters.spiceMax === lvl
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-foreground/70 hover:border-primary/40",
              )}
            >
              {lvl === 0 ? "Mild" : "🌶".repeat(lvl)}
            </button>
          ))}
        </div>
      </div>

      <Button variant="outline" onClick={onReset} className="rounded-full bg-transparent">
        Reset filters
      </Button>
    </div>
  )
}
