import { Suspense } from "react"
import { MenuPageClient } from "./menu-client"

export const metadata = {
  title: "Menu — Tanit Cuisine",
  description:
    "Explore our complete collection of Nigerian dishes — from heritage classics to modern fusion creations.",
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-20">
          <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="h-4 w-72 bg-muted rounded animate-pulse" />
        </div>
      }
    >
      <MenuPageClient />
    </Suspense>
  )
}
