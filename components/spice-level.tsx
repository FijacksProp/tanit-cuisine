import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

export function SpiceLevel({ level, className }: { level: 0 | 1 | 2 | 3; className?: string }) {
  const labels = ["Mild", "Mild-Medium", "Medium-Hot", "Hot"] as const
  return (
    <div className={cn("inline-flex items-center gap-1", className)} aria-label={`Spice level: ${labels[level]}`}>
      {[0, 1, 2].map((i) => (
        <Flame
          key={i}
          className={cn(
            "size-3.5",
            i < level ? "fill-primary text-primary" : "text-muted-foreground/30",
          )}
          strokeWidth={1.5}
        />
      ))}
      <span className="ml-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        {labels[level]}
      </span>
    </div>
  )
}
