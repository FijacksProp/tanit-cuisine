"use client"

import * as React from "react"
import type { CartItem, Product } from "./types"
import { getProductById } from "./data"
import { apiRequest } from "./api"
import { useAuth } from "./auth-context"

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
  | { type: "SET_WISHLIST"; productIds: string[] }
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

const WISHLIST_SESSION_KEY = "tanit_wishlist_session"

type WishlistApiItem = {
  product: {
    id: string
  }
}

function getWishlistSessionKey() {
  if (typeof window === "undefined") return ""

  const existing = localStorage.getItem(WISHLIST_SESSION_KEY)
  if (existing) return existing

  const generated =
    window.crypto?.randomUUID?.() ?? `guest-${Date.now()}-${Math.random().toString(16).slice(2)}`
  localStorage.setItem(WISHLIST_SESSION_KEY, generated)
  return generated
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
    case "SET_WISHLIST":
      return { ...state, wishlist: action.productIds }
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
  const { accessToken, loading: authLoading } = useAuth()

  React.useEffect(() => {
    if (authLoading) return

    const controller = new AbortController()
    const sessionKey = accessToken ? "" : getWishlistSessionKey()
    const path = accessToken
      ? "/wishlist/"
      : `/wishlist/?sessionKey=${encodeURIComponent(sessionKey)}`

    apiRequest<WishlistApiItem[]>(path, {
      token: accessToken,
      signal: controller.signal,
    })
      .then((items) =>
        dispatch({
          type: "SET_WISHLIST",
          productIds: items.map((item) => item.product.id),
        }),
      )
      .catch((error) => {
        if (error.name !== "AbortError") console.error("Failed to load wishlist", error)
      })

    return () => controller.abort()
  }, [accessToken, authLoading])

  const syncWishlistToggle = React.useCallback(
    async (productId: string, shouldRemove: boolean) => {
      const sessionKey = accessToken ? "" : getWishlistSessionKey()
      const sessionQuery = accessToken ? "" : `?sessionKey=${encodeURIComponent(sessionKey)}`

      if (shouldRemove) {
        await apiRequest(`/wishlist/product/${productId}/${sessionQuery}`, {
          method: "DELETE",
          token: accessToken,
        })
        return
      }

      await apiRequest("/wishlist/", {
        method: "POST",
        token: accessToken,
        body: JSON.stringify({
          productId,
          sessionKey,
        }),
      })
    },
    [accessToken],
  )

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
      toggleWishlist: (productId) => {
        const shouldRemove = state.wishlist.includes(productId)
        dispatch({ type: "TOGGLE_WISHLIST", productId })
        syncWishlistToggle(productId, shouldRemove).catch((error) => {
          dispatch({ type: "TOGGLE_WISHLIST", productId })
          console.error("Failed to update wishlist", error)
        })
      },
      isInWishlist: (productId) => state.wishlist.includes(productId),
      openCart: () => dispatch({ type: "OPEN_CART" }),
      closeCart: () => dispatch({ type: "CLOSE_CART" }),
      toggleCart: () => dispatch({ type: "TOGGLE_CART" }),
      cartCount,
      cartSubtotal,
      cartItemsWithProduct,
    }
  }, [state, syncWishlistToggle])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
