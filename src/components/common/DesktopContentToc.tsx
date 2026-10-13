import { ScrollArea } from "@/components/ui/scroll-area"

interface Heading {
  slug: string
  text: string
  depth: number
}

interface DesktopContentTocProps {
  headings: Heading[]
  label: string
  variant?: "card" | "sidebar"
}

export default function DesktopContentToc({ headings, label, variant = "card" }: DesktopContentTocProps) {
  return (
    <nav
      aria-label={label}
      className={
        variant === "sidebar"
          ? "mt-6 flex min-h-0 flex-1 flex-col overflow-hidden border-t border-border px-8 pt-6 xl:px-10"
          : "mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-border/80 bg-background-1 p-5"
      }
    >
      <p className="shrink-0 font-mono text-xs text-foreground-3 uppercase">Sections</p>
      <ScrollArea type="auto" scrollHideDelay={300} className="mt-4 h-0 min-h-0 flex-1 overscroll-contain">
        <ol className="space-y-3 pr-3">
          {headings.map((heading) => (
            <li key={heading.slug} className={heading.depth === 3 ? "pl-3" : undefined}>
              <a
                href={`#${heading.slug}`}
                data-toc-link={heading.slug}
                className="block border-l border-transparent py-1 pl-3 text-sm leading-snug text-foreground-2 transition-all duration-200 hover:text-accent-1"
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </nav>
  )
}
