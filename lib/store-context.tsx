"use client"

import * as React from "react"
import type { CartItem, Product } from "./types"
import { getProductById } from "./data"

type StoreState = {
  cart: CartItem[]
  wishlist: string[]
  cartOpen: boolean
}

type StoreAction =
  | { type: "ADD_TO_CART"; productId: string; quantity?: number }
  | { type: "REMOVE_FROM_CART"; productId: string }
  | { type: "UPDATE_QUANTITY"; productId: string; quantity: number }
  | { type: "CLEAR_CART" }
  | { type: "TOGGLE_WISHLIST"; productId: string }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "TOGGLE_CART" }

type StoreContextValue = StoreState & {
  addToCart: (productId: string, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  toggleWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  cartCount: number
  cartSubtotal: number
  cartItemsWithProduct: Array<{ item: CartItem; product: Product }>
}

const StoreContext = React.createContext<StoreContextValue | undefined>(undefined)

const initialState: StoreState = {
  cart: [],
  wishlist: [],
  cartOpen: false,
}

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "ADD_TO_CART": {
      const qty = action.quantity ?? 1
      const existing = state.cart.find((c) => c.productId === action.productId)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((c) =>
            c.productId === action.productId ? { ...c, quantity: c.quantity + qty } : c,
          ),
        }
      }
      return {
        ...state,
        cart: [...state.cart, { productId: action.productId, quantity: qty }],
      }
    }
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((c) => c.productId !== action.productId) }
    case "UPDATE_QUANTITY":
      if (action.quantity <= 0) {
        return { ...state, cart: state.cart.filter((c) => c.productId !== action.productId) }
      }
      return {
        ...state,
        cart: state.cart.map((c) =>
          c.productId === action.productId ? { ...c, quantity: action.quantity } : c,
        ),
      }
    case "CLEAR_CART":
      return { ...state, cart: [] }
    case "TOGGLE_WISHLIST": {
      const exists = state.wishlist.includes(action.productId)
      return {
        ...state,
        wishlist: exists
          ? state.wishlist.filter((id) => id !== action.productId)
          : [...state.wishlist, action.productId],
      }
    }
    case "OPEN_CART":
      return { ...state, cartOpen: true }
    case "CLOSE_CART":
      return { ...state, cartOpen: false }
    case "TOGGLE_CART":
      return { ...state, cartOpen: !state.cartOpen }
    default:
      return state
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, initialState)

  const value = React.useMemo<StoreContextValue>(() => {
    const cartItemsWithProduct = state.cart
      .map((item) => {
        const product = getProductById(item.productId)
        return product ? { item, product } : null
      })
      .filter((x): x is { item: CartItem; product: Product } => x !== null)

    const cartCount = state.cart.reduce((sum, c) => sum + c.quantity, 0)
    const cartSubtotal = cartItemsWithProduct.reduce(
      (sum, { item, product }) => sum + product.price * item.quantity,
      0,
    )

    return {
      ...state,
      addToCart: (productId, quantity) =>
        dispatch({ type: "ADD_TO_CART", productId, quantity }),
      removeFromCart: (productId) => dispatch({ type: "REMOVE_FROM_CART", productId }),
      updateQuantity: (productId, quantity) =>
        dispatch({ type: "UPDATE_QUANTITY", productId, quantity }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
      toggleWishlist: (productId) => dispatch({ type: "TOGGLE_WISHLIST", productId }),
      isInWishlist: (productId) => state.wishlist.includes(productId),
      openCart: () => dispatch({ type: "OPEN_CART" }),
      closeCart: () => dispatch({ type: "CLOSE_CART" }),
      toggleCart: () => dispatch({ type: "TOGGLE_CART" }),
      cartCount,
      cartSubtotal,
      cartItemsWithProduct,
    }
  }, [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
