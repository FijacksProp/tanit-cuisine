"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function ContactForm() {
  const [form, setForm] = React.useState({ name: "", email: "", topic: "general", message: "" })
  const [errors, setErrors] = React.useState<Partial<Record<keyof typeof form, string>>>({})
  const [sent, setSent] = React.useState(false)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = "Required"
    if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Enter a valid email"
    if (!form.message.trim() || form.message.trim().length < 10)
      errs.message = "Please share a few sentences"
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSent(true)
    toast.success("Message sent. We'll be in touch shortly.")
  }

  if (sent) {
    return (
      <div className="border border-border/60 rounded-lg p-10 text-center bg-card">
        <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <CheckCircle2 className="size-6 text-primary" />
        </div>
        <h2 className="font-serif text-2xl">Thank you, {form.name.split(" ")[0]}.</h2>
        <p className="mt-3 text-muted-foreground max-w-sm mx-auto leading-relaxed">
          Your message is with our concierge. We&apos;ll reply within four working hours.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={submit}>
      <FieldGroup>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field data-error={!!errors.name}>
            <FieldLabel htmlFor="c-name">Your name</FieldLabel>
            <Input
              id="c-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {errors.name && <FieldError>{errors.name}</FieldError>}
          </Field>
          <Field data-error={!!errors.email}>
            <FieldLabel htmlFor="c-email">Email</FieldLabel>
            <Input
              id="c-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            {errors.email && <FieldError>{errors.email}</FieldError>}
          </Field>
        </div>
        <Field>
          <FieldLabel htmlFor="c-topic">Topic</FieldLabel>
          <Select value={form.topic} onValueChange={(v) => setForm({ ...form, topic: v })}>
            <SelectTrigger id="c-topic">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General enquiry</SelectItem>
              <SelectItem value="reservation">Reservation</SelectItem>
              <SelectItem value="events">Private events</SelectItem>
              <SelectItem value="press">Press & partnerships</SelectItem>
              <SelectItem value="careers">Careers</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field data-error={!!errors.message}>
          <FieldLabel htmlFor="c-message">Message</FieldLabel>
          <Textarea
            id="c-message"
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tell us a little about what you have in mind..."
          />
          {errors.message && <FieldError>{errors.message}</FieldError>}
        </Field>
        <Button type="submit" size="lg" className="rounded-full self-start">
          Send message
        </Button>
      </FieldGroup>
    </form>
  )
}
