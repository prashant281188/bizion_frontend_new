// components/layout/PageHeader.tsx

import { cn } from "@/lib/utils"

interface Props {
  children: React.ReactNode
  className?: string
}

export default function PageHeader({ children, className }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6",
        className
      )}
    >
      {children}
    </div>
  )
}