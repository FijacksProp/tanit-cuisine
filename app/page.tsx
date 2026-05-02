import { Hero } from "@/components/sections/hero"
import { CategoriesGrid } from "@/components/sections/categories-grid"
import { FeaturedDishes } from "@/components/sections/featured-dishes"
import { Story } from "@/components/sections/story"
import { ModernFusion } from "@/components/sections/modern-fusion"
import { Testimonials } from "@/components/sections/testimonials"
import { CtaBanner } from "@/components/sections/cta"

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoriesGrid />
      <FeaturedDishes />
      <Story />
      <ModernFusion />
      <Testimonials />
      <CtaBanner />
    </>
  )
}
