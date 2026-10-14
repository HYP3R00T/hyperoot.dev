import ProjectRevisionTooltip from "./ProjectRevisionTooltip"

interface Props {
  count: number
  branch: string
  url: string
  title: string
}

export default function ProjectCommitCount({ count, branch, url, title }: Props) {
  const label = `${count.toLocaleString("en")} ${count === 1 ? "commit" : "commits"}`
  return (
    <ProjectRevisionTooltip
      label={label}
      url={url}
      ariaLabel={`${label} on ${branch} for ${title} (opens in a new tab)`}
      tooltip={`${label} on the default branch (${branch})`}
    />
  )
}
