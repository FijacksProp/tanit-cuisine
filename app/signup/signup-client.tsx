"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"

export function SignupClient() {
  const router = useRouter()
  const { signupStart, signupVerify } = useAuth()
  const [step, setStep] = React.useState<"details" | "verify">("details")
  const [form, setForm] = React.useState({
    email: "",
    fullName: "",
    phone: "",
    password: "",
    code: "",
  })
  const [error, setError] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  const start = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await signupStart({
        email: form.email,
        fullName: form.fullName,
        phone: form.phone,
        password: form.password,
      })
      toast.success("Verification code sent")
      setStep("verify")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start signup")
    } finally {
      setSubmitting(false)
    }
  }

  const verify = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setSubmitting(true)
    try {
      await signupVerify(form.email, form.code)
      toast.success("Account created")
      router.push("/account")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to verify code")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 sm:px-6 py-16 md:py-24">
      <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">Create account</p>
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight">
        {step === "details" ? "Join the table." : "Verify your email."}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {step === "details"
          ? "We use a one-time email code to confirm your account."
          : "Enter the 6-digit code sent to your email address."}
      </p>

      {step === "details" ? (
        <form onSubmit={start} className="mt-10">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fullName">Full name</FieldLabel>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                autoComplete="name"
                required
              />
            </Field>
            <Field>
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
            <Field>
              <FieldLabel htmlFor="phone">Phone</FieldLabel>
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                autoComplete="tel"
              />
            </Field>
            <Field data-error={!!error}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                autoComplete="new-password"
                minLength={8}
                required
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Button type="submit" disabled={submitting} className="rounded-full">
              {submitting ? "Sending code..." : "Send verification code"}
            </Button>
          </FieldGroup>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-10">
          <FieldGroup>
            <Field data-error={!!error}>
              <FieldLabel htmlFor="code">Verification code</FieldLabel>
              <Input
                id="code"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                inputMode="numeric"
                autoComplete="one-time-code"
                required
              />
              {error && <FieldError>{error}</FieldError>}
            </Field>
            <Button type="submit" disabled={submitting || form.code.length !== 6} className="rounded-full">
              {submitting ? "Verifying..." : "Create account"}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setStep("details")} className="rounded-full">
              Edit details
            </Button>
          </FieldGroup>
        </form>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="text-primary hover:underline">
          Sign in
        </Link>
        .
      </p>
    </div>
  )
}
