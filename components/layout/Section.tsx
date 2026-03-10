// components/layout/Section.tsx

import { cn } from "@/lib/utils"

interface Props {
  children: React.ReactNode
  className?: string
}

export default function Section({ children, className }: Props) {
  return (
    <section className={cn("space-y-6", className)}>
      {children}
    </section>
  )
}