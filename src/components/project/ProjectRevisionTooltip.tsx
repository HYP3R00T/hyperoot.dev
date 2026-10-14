import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Props {
  label: string
  tooltip: string
  url?: string
  ariaLabel?: string
}

export default function ProjectRevisionTooltip({ label, tooltip, url, ariaLabel }: Props) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {url ? (
            <a href={url} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
              {label}
            </a>
          ) : (
            <button type="button" className="revision-tooltip-trigger" aria-label={ariaLabel}>
              {label}
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent className="catalog-stat-tooltip" sideOffset={7} showArrow={false}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
