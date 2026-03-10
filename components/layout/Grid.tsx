// components/layout/Grid.tsx

import { cn } from "@/lib/utils"

interface Props {
  children: React.ReactNode
  className?: string
  cols?: number
}

export default function Grid({ children, className }: Props) {
  return (
    <div
      className={cn(
        "grid gap-6",
        "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  )
}