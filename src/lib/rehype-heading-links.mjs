import GithubSlugger from "github-slugger"

const HEADING_TAGS = new Set(["h2", "h3", "h4"])

const textContent = (node) => {
  if (node.type === "text") return node.value
  if (!Array.isArray(node.children)) return ""
  return node.children.map(textContent).join("")
}

const walk = (node, slugger) => {
  if (HEADING_TAGS.has(node.tagName)) {
    node.properties ??= {}
    const id = typeof node.properties.id === "string" ? node.properties.id : slugger.slug(textContent(node))
    node.properties.id = id
    node.children ??= []
    node.children.push({
      type: "element",
      tagName: "a",
      properties: {
        className: ["heading-permalink"],
        href: `#${id}`,
        ariaLabel: "Link to this section",
      },
      children: [],
    })
  }

  if (!Array.isArray(node.children)) return
  for (const child of node.children) walk(child, slugger)
}

export default function rehypeHeadingLinks() {
  return (tree) => walk(tree, new GithubSlugger())
}
