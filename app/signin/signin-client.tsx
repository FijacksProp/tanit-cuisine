"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

export function SigninClient() {
  const router = useRouter()
  const { signin } = useAuth()
  const [form, setForm] = React.useState({ email: "", password: "" })
  const [error, setError] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await signin(form.email, form.password)
      toast.success("Welcome back")
      router.push("/account")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16 md:py-24">
      <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Account</p>
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight">Sign in.</h1>
      <p className="mt-4 text-muted-foreground">
        Access saved details, wishlist, and order history.
      </p>

      <form onSubmit={submit} className="mt-10">
        <FieldGroup>
          <Field data-error={!!error}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              autoComplete="email"
              required
            />
          </Field>
          <Field data-error={!!error}>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="current-password"
              required
            />
            {error && <FieldError>{error}</FieldError>}
          </Field>
          <Button type="submit" disabled={submitting} className="rounded-full">
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/signup" className="text-primary hover:underline">
          Create an account
        </Link>
        .
      </p>
    </div>
  )
}
