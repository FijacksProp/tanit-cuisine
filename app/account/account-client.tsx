"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"

export function AccountClient() {
  const router = useRouter()
  const { user, loading, signout } = useAuth()

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-20">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-4" />
        <div className="h-4 w-72 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-20 text-center">
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight">Sign in required</h1>
        <p className="mt-4 text-muted-foreground">
          Sign in to view your profile, saved details, and future order history.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link href="/signin">Sign in</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 md:py-20">
      <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Your account</p>
      <h1 className="font-serif text-4xl md:text-6xl tracking-tight">
        Welcome, {user.fullName.split(" ")[0]}.
      </h1>
      <p className="mt-4 text-muted-foreground">
        Your Tanit profile is connected to {user.email}.
      </p>

      <div className="mt-10 border border-border/60 rounded-lg bg-card p-6 md:p-8">
        <h2 className="font-serif text-2xl">Profile</h2>
        <Separator className="my-5" />
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div>
            <dt className="text-muted-foreground">Full name</dt>
            <dd className="mt-1 font-medium">{user.fullName}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email</dt>
            <dd className="mt-1 font-medium break-all">{user.email}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Phone</dt>
            <dd className="mt-1 font-medium">{user.phone || "Not set"}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Email status</dt>
            <dd className="mt-1 font-medium">{user.isEmailVerified ? "Verified" : "Unverified"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Default address</dt>
            <dd className="mt-1 font-medium">
              {user.defaultAddress || `${user.city || "Ilorin"}, ${user.state || "Kwara"}`}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="rounded-full">
          <Link href="/wishlist">View wishlist</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full bg-transparent">
          <Link href="/track">Track an order</Link>
        </Button>
        <Button
          variant="ghost"
          className="rounded-full"
          onClick={() => {
            signout()
            router.push("/")
          }}
        >
          Sign out
        </Button>
      </div>
    </div>
  )
}
