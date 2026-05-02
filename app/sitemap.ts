import type { MetadataRoute } from "next"
import { products } from "@/lib/data"

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tanit-cuisine.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/accessibility",
    "/careers",
    "/cart",
    "/checkout",
    "/contact",
    "/menu",
    "/privacy",
    "/sitemap",
    "/terms",
    "/track",
    "/wishlist",
  ]

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/menu/${product.slug}`,
      lastModified: new Date(),
    })),
  ]
}
