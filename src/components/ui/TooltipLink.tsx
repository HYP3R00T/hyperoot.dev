import type { ReactNode } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Props {
  href: string
  label: string
  external?: boolean
  children: ReactNode
}

export default function TooltipLink({ href, label, external = false, children }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={href}
            aria-label={label}
            target={external ? "_blank" : undefined}
            rel={external ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        </TooltipTrigger>
        <TooltipContent className="catalog-stat-tooltip" sideOffset={7} showArrow={false}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
