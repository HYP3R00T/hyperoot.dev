import { Bug, GitFork, GitPullRequest, Star } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface ProjectStat {
  kind: "stars" | "forks" | "issues" | "pullRequests"
  label: string
  singular: string
  value: number
  url: string
}
const icons = { stars: Star, forks: GitFork, issues: Bug, pullRequests: GitPullRequest }

export default function ProjectStatsContent({ title, stats }: { title: string; stats: ProjectStat[] }) {
  return (
    <TooltipProvider delayDuration={200} skipDelayDuration={100}>
      <ul className="project-stats" aria-label={`${title} GitHub statistics`}>
        {stats.map((stat) => {
          const Icon = icons[stat.kind]
          const count = stat.value.toLocaleString("en")
          const description = `${count} ${stat.value === 1 ? stat.singular : stat.label}`
          return (
            <li key={stat.kind}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={stat.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${description} for ${title} (opens in a new tab)`}
                  >
                    <Icon size={14} aria-hidden="true" />
                    <span className="stat-value">{count}</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent sideOffset={7} showArrow={false} className="catalog-stat-tooltip">
                  {description}
                </TooltipContent>
              </Tooltip>
            </li>
          )
        })}
      </ul>
    </TooltipProvider>
  )
}
