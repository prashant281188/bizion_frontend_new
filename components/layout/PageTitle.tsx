// components/layout/PageTitle.tsx

import { cn } from "@/lib/utils"

interface Props {
  children: React.ReactNode
  className?: string
}

export default function PageTitle({ children, className }: Props) {
  return (
    <h1
      className={cn(
        "text-2xl md:text-3xl font-bold tracking-tight text-black dark:text-white",
        className
      )}
    >
      {children}
    </h1>
  )
}