import Link from "next/link"
import { Button } from "@/components/ui/button"

interface InfoPageProps {
  eyebrow: string
  title: string
  description: string
  sections: Array<{
    title: string
    body: string
  }>
  action?: {
    href: string
    label: string
  }
}

export function InfoPage({ eyebrow, title, description, sections, action }: InfoPageProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-14 md:py-20">
      <p className="text-xs tracking-[0.2em] uppercase text-primary mb-3">{eyebrow}</p>
      <h1 className="font-serif text-4xl md:text-6xl tracking-tight text-balance">
        {title}
      </h1>
      <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
        {description}
      </p>

      <div className="mt-12 divide-y divide-border/60 border-y border-border/60">
        {sections.map((section) => (
          <section key={section.title} className="py-7">
            <h2 className="font-serif text-2xl tracking-tight">{section.title}</h2>
            <p className="mt-3 text-sm md:text-base text-foreground/80 leading-relaxed">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      {action && (
        <Button asChild className="mt-10 rounded-full">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}
