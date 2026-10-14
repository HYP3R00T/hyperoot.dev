import assert from "node:assert/strict"
import test from "node:test"
import rehypeCodeBlocks from "../src/lib/rehype-code-blocks.mts"
import rehypeHeadingLinks from "../src/lib/rehype-heading-links.mts"

const heading = (text, properties = {}) => ({
  type: "element",
  tagName: "h2",
  properties,
  children: [{ type: "text", value: text }],
})

test("heading links preserve authored IDs and give duplicate titles unique anchors", () => {
  const tree = {
    type: "root",
    children: [heading("Hello world"), heading("Hello world"), heading("Custom", { id: "authored-id" })],
  }
  rehypeHeadingLinks()(tree)
  assert.deepEqual(
    tree.children.map((node) => node.properties.id),
    ["hello-world", "hello-world-1", "authored-id"],
  )
  for (const node of tree.children) {
    const link = node.children.at(-1)
    assert.equal(link.properties.href, `#${node.properties.id}`)
    assert.equal(link.properties.ariaLabel, "Link to this section")
  }
})

test("code plugin preserves code and generates copy controls and language labels", async () => {
  const tree = {
    type: "root",
    children: [
      {
        type: "element",
        tagName: "pre",
        properties: {},
        children: [
          {
            type: "element",
            tagName: "code",
            properties: { className: ["language-js"] },
            children: [{ type: "text", value: "const answer = 42" }],
          },
        ],
      },
    ],
  }
  await rehypeCodeBlocks({ theme: "houston" })(tree, { data: {} })
  const figure = tree.children[0]
  assert.equal(figure.properties["data-code-block"], "")
  const header = figure.children[0]
  assert.equal(header.children[0].children[0].children[0].value, "JavaScript")
  assert.equal(header.children[1].properties["data-code-copy"], "")
  assert.equal(figure.children[1].tagName, "pre")
})
