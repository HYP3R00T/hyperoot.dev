import { readdir, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { extname, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import type { Loader } from 'astro/loaders'

const require = createRequire(import.meta.url)
const { parse } = require('yaml') as typeof import('yaml')

interface LocalContentLoaderOptions {
  base: string
  extensions?: string[]
}

interface ParsedContentFile {
  data: Record<string, unknown>
  body: string
}

const normalizePath = (value: string) => value.replaceAll('\\', '/')

async function walkFiles(directory: string, extensions: Set<string>): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = resolve(directory, entry.name)
      if (entry.isDirectory()) return walkFiles(entryPath, extensions)
      return extensions.has(extname(entry.name).toLowerCase()) ? [entryPath] : []
    }),
  )

  return files.flat().sort((a, b) => a.localeCompare(b))
}

function parseContentFile(contents: string, filePath: string): ParsedContentFile {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/)
  if (!match) throw new Error(`Missing frontmatter in ${filePath}`)

  const parsed = parse(match[1])
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Frontmatter must be an object in ${filePath}`)
  }

  return { data: parsed as Record<string, unknown>, body: match[2].trimStart() }
}

export function localContentLoader({ base, extensions = ['.md', '.mdx'] }: LocalContentLoaderOptions): Loader {
  return {
    name: `hyperoot-local-content:${base}`,
    async load({ config, store, parseData, renderMarkdown, generateDigest, logger }) {
      const rootPath = fileURLToPath(config.root)
      const basePath = resolve(rootPath, base)
      const files = await walkFiles(basePath, new Set(extensions))

      store.clear()

      for (const filePath of files) {
        const contents = await readFile(filePath, 'utf8')
        const { data, body } = parseContentFile(contents, filePath)
        const id = normalizePath(relative(basePath, filePath)).replace(/\.(md|mdx)$/i, '')
        const relativeFilePath = normalizePath(relative(rootPath, filePath))
        const parsedData = await parseData({ id, data, filePath })
        const rendered = await renderMarkdown(body, { fileURL: pathToFileURL(filePath) })

        store.set({
          id,
          data: parsedData,
          body,
          filePath: relativeFilePath,
          digest: generateDigest(contents),
          rendered,
          assetImports: rendered.metadata?.imagePaths,
        })
      }

      logger.info(`Loaded ${files.length} entries from ${base}`)
    },
  }
}
