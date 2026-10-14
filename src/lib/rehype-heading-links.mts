import GithubSlugger from "github-slugger"
import { type MarkdownNode, type MarkdownTree, textContent } from "./markdown-tree.mts"

const HEADING_TAGS = new Set(["h2", "h3", "h4"])

const walk = (node: MarkdownNode, slugger: GithubSlugger): void => {
  if (node.type === "element" && HEADING_TAGS.has(node.tagName)) {
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

  if (!("children" in node)) return
  for (const child of node.children) walk(child, slugger)
}

export default function rehypeHeadingLinks() {
  return (tree: MarkdownTree) => walk(tree, new GithubSlugger())
}
