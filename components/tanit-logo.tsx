import Image from "next/image"
import { cn } from "@/lib/utils"

export function TanitLogo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-block aspect-square shrink-0 overflow-visible",
        className,
      )}
    >
      <Image
        src="/tanit_logo.png"
        alt="Tanit Cuisine"
        fill
        sizes="(min-width: 768px) 96px, 72px"
        className="object-contain"
        priority
      />
    </span>
  )
}
