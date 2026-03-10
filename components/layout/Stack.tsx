// components/layout/Stack.tsx

import { cn } from "@/lib/utils"

interface Props {
  children: React.ReactNode
  className?: string
}

export default function Stack({ children, className }: Props) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {children}
    </div>
  )
}