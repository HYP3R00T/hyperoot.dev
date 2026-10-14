import type rehypePrettyCode from "rehype-pretty-code"

export type HighlightTransformer = Exclude<ReturnType<typeof rehypePrettyCode>, void>
export type MarkdownTree = Parameters<HighlightTransformer>[0]
export type MarkdownNode = MarkdownTree | MarkdownTree["children"][number]
export type MarkdownElement = Extract<MarkdownNode, { type: "element" }>

export function textContent(node: MarkdownNode): string {
  if (node.type === "text") return node.value
  return "children" in node ? node.children.map(textContent).join("") : ""
}
