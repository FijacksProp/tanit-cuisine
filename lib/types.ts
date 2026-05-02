export type CategorySlug =
  | "signature-rice"
  | "soups-and-stews"
  | "grills-and-skewers"
  | "swallows"
  | "small-chops"
  | "modern-fusion"
  | "drinks"
  | "desserts"

export type DietaryTag = "gluten-free" | "vegetarian" | "vegan" | "contains-nuts" | "dairy-free" | "spicy" | "chef-special"

export interface Category {
  slug: CategorySlug
  name: string
  tagline: string
  description: string
  image: string
}

export interface Review {
  id: string
  author: string
  initials: string
  rating: number
  date: string
  title: string
  comment: string
  verified: boolean
}

export interface Product {
  id: string
  slug: string
  name: string
  category: CategorySlug
  price: number
  oldPrice?: number
  shortDescription: string
  description: string
  image: string
  ingredients: string[]
  dietary: DietaryTag[]
  spiceLevel: 0 | 1 | 2 | 3
  prepTimeMinutes: number
  servingSize: string
  calories: number
  rating: number
  reviewCount: number
  reviews: Review[]
  featured?: boolean
  isNew?: boolean
  bestseller?: boolean
  pairings?: string[]
}

export interface CartItem {
  productId: string
  quantity: number
  notes?: string
}

export interface ShippingAddress {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
}
