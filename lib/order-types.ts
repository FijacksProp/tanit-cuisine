export type OrderItem = {
  productId: string
  productSlug: string
  productName: string
  unitPrice: number
  quantity: number
  notes: string
  lineTotal: number
}

export type CustomerOrder = {
  orderNumber: string
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  notes: string
  delivery: "standard" | "express" | "pickup"
  payment: "card" | "transfer" | "cash"
  status: string
  subtotal: number
  deliveryFee: number
  serviceFee: number
  total: number
  items: OrderItem[]
  created_at: string
}
