import React from 'react'


import { Home } from 'lucide-react'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../ui/breadcrumb'
const BiBreadcrumb = () => {
  return (
   <Breadcrumb>
      <BreadcrumbList className="text-sm text-muted-foreground">
        <BreadcrumbItem>
          <BreadcrumbLink
            href="/"
            className="flex items-center gap-1.5 hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="text-muted-foreground">
          /
        </BreadcrumbSeparator>

        <BreadcrumbItem>
          <BreadcrumbLink
            href="/documents"
            className="hover:text-foreground"
          >
            Documents
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="text-muted-foreground">
          /
        </BreadcrumbSeparator>

        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium text-foreground">
            Add Document
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export default BiBreadcrumb