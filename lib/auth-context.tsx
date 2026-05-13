"use client"

import * as React from "react"
import { apiRequest } from "@/lib/api"

type AuthUser = {
  id: number
  email: string
  fullName: string
  phone: string
  defaultAddress: string
  city: string
  state: string
  zip: string
  isEmailVerified: boolean
  isStaff: boolean
  isSuperuser: boolean
}

type Tokens = {
  access: string
  refresh: string
}

type SignupStartInput = {
  email: string
  fullName: string
  phone: string
  password: string
}

type AuthContextValue = {
  user: AuthUser | null
  accessToken: string | null
  loading: boolean
  signupStart: (input: SignupStartInput) => Promise<void>
  signupVerify: (email: string, code: string) => Promise<void>
  signin: (email: string, password: string) => Promise<void>
  signout: () => void
  refreshProfile: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

const ACCESS_KEY = "tanit_access_token"
const REFRESH_KEY = "tanit_refresh_token"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [accessToken, setAccessToken] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  const storeTokens = React.useCallback((tokens: Tokens) => {
    localStorage.setItem(ACCESS_KEY, tokens.access)
    localStorage.setItem(REFRESH_KEY, tokens.refresh)
    setAccessToken(tokens.access)
  }, [])

  const clearAuth = React.useCallback(() => {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    setAccessToken(null)
    setUser(null)
  }, [])

  const refreshProfile = React.useCallback(async () => {
    const token = localStorage.getItem(ACCESS_KEY)
    if (!token) {
      clearAuth()
      return
    }
    const profile = await apiRequest<AuthUser>("/auth/me/", { token })
    setAccessToken(token)
    setUser(profile)
  }, [clearAuth])

  React.useEffect(() => {
    refreshProfile()
      .catch(clearAuth)
      .finally(() => setLoading(false))
  }, [clearAuth, refreshProfile])

  const signupStart = React.useCallback(async (input: SignupStartInput) => {
    await apiRequest("/auth/signup/start/", {
      method: "POST",
      body: JSON.stringify(input),
    })
  }, [])

  const signupVerify = React.useCallback(
    async (email: string, code: string) => {
      const response = await apiRequest<{ user: AuthUser; tokens: Tokens }>("/auth/signup/verify/", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      })
      storeTokens(response.tokens)
      setUser(response.user)
    },
    [storeTokens],
  )

  const signin = React.useCallback(
    async (email: string, password: string) => {
      const response = await apiRequest<{ user: AuthUser; tokens: Tokens }>("/auth/signin/", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      })
      storeTokens(response.tokens)
      setUser(response.user)
    },
    [storeTokens],
  )

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      loading,
      signupStart,
      signupVerify,
      signin,
      signout: clearAuth,
      refreshProfile,
    }),
    [accessToken, clearAuth, loading, refreshProfile, signin, signupStart, signupVerify, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
