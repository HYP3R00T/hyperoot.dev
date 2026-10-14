import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Props {
  count: number
  branch: string
  url: string
  title: string
}

export default function ProjectCommitCount({ count, branch, url, title }: Props) {
  const label = `${count.toLocaleString("en")} ${count === 1 ? "commit" : "commits"}`
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} on ${branch} for ${title} (opens in a new tab)`}
          >
            {label}
          </a>
        </TooltipTrigger>
        <TooltipContent className="catalog-stat-tooltip" sideOffset={7} showArrow={false}>
          {label} on the default branch ({branch})
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
