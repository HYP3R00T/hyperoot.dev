# hyperoot.dev

The Astro site combines authored MDX projects with GitHub repository metadata in a searchable project collection.

## Project entries

Add one `.mdx` file in `content/projects/` for each repository you want listed. Its filename is its stable page slug. No separate repository list is needed.

```mdx
---
repo: HYP3R00T/voicepad
title: VoicePad
description: Private, local-first dictation for Linux.
technologies: [Python, Textual, PyTorch]
domains: [Developer Tools, Data/AI]
featured: true
website: https://voicepad.hyperoot.dev
links:
  - label: Documentation
    url: https://voicepad.hyperoot.dev/docs
hasPage: true
---

## About the project

Write your overview or case study here.
```

Only `repo` is required. Local `title`, `description`, `technologies`, `website`, and `sourceRepo` override GitHub values. Omitted values fall back to repository name, description, topics, homepage, and repository URL. An explicit empty description or empty technologies list stays empty. `domains`, `featured`, `order`, images, and extra `links` are authored locally. Extra links are included in the data catalog for the future list UI.

- Every non-draft entry appears in the catalog, including entries without a page.
- `hasPage` defaults to false: no internal project page is generated.
- `hasPage: true` requires a nonempty MDX body and creates `/<filename>/`.
- `draft: true` hides the project, prevents page generation, and skips GitHub fetching.
- `private: true` keeps the authored project visible but skips GitHub fetching and omits its repository link. Do not put sensitive information in its MDX body or frontmatter.
- Repository identifiers must use `owner/name`; duplicate identifiers are rejected.
- Existing write-ups and page URLs are preserved.

## Fetching and activity

`data/github-repositories.json` is a generated, public-only snapshot. It records repository topics, primary language, stars, forks, separate open issue and pull request counts, default branch, latest default-branch commit SHA/URL/date, creation and push dates, license, archive/fork/template flags, and each successful fetch time. Keep it in version control so clean clones and offline builds have a fallback. Syncing changes this file, never the authored MDX files.

Local overrides are combined with that snapshot by the content loader. Activity is computed independently of snapshot freshness:

`active: true` means a non-archived repository was pushed within the last 30 days, including automated pushes. The UI displays only an **Active** indicator; all other projects remain unlabelled. Push dates include any branch, while the displayed seven-character commit reference is the latest commit on the default branch. Exact timestamps are available on the displayed update date.

GitHub's repository `open_issues_count` includes pull requests. The sync counts open PRs separately and subtracts them to produce the open issue count. Empty repositories have no commit reference.

Private/client entries remain opt-in through `private: true`. They skip GitHub fetching, omit the source link and public statistics, and can explicitly publish local `lastUpdated` and `commit` fields alongside website/docs links:

```yaml
private: true
website: https://example.com
lastUpdated: "2026-10-13T10:00:00Z"
commit:
  sha: abc1234
  branch: main
  date: "2026-10-13T10:00:00Z"
```

No private repository metadata is published automatically. Only add dates and references you intend visitors to see.

`syncStatus` is `fresh`, `stale`, or `unavailable`. Failed requests preserve previous successful data and its timestamp. Without previous data, the local entry remains usable without an activity badge or invented statistics. Development reuses recent fetch attempts for six hours, including failures, to avoid repeatedly hitting GitHub on every edit; a forced sync retries immediately. The snapshot is written atomically and only includes currently selected, non-draft repositories. Private API responses are rejected.

## Commands

| Command | Behavior |
| --- | --- |
| `pnpm dev` / `mise run dev` | Refresh missing or older-than-six-hour metadata on startup; watch MDX additions, edits, deletions and snapshot changes |
| `pnpm projects:sync` / `mise run projects-sync` | Force a GitHub refresh; a running dev server consumes the updated snapshot |
| `pnpm projects:sync --strict` | Fail if any selected repository cannot refresh |
| `pnpm build` / `mise run build` | Fetch every selected repository before generating the static site |
| `pnpm check` | Validate content and TypeScript |
| `pnpm test` | Exercise metadata overrides, activity, validation, and failure recovery |

The Astro integration also applies to direct `astro dev` and `astro build` commands. During development, editing a new repository identifier fetches its metadata automatically. Preview serves the previously built files and does not refresh them.

Copy `.env.example` to `.env` if needed. `GITHUB_TOKEN` is optional for small public catalogs; set it in `.env` or the build environment for this larger catalog because fetching branch commits and PR counts requires additional requests. Credentials stay on the build machine and are never included in generated data. Set `PROJECTS_OFFLINE=1` to run dev, checks, or builds entirely from the saved snapshot. The sync command also supports `--offline`.

`/projects.json` exposes the resolved, non-draft catalog in recent-push order, with optional page URLs and extra links. The homepage renders this collection as project rows with search, domain and activity filters, and sorting by push date, stars, or name. Search and filter state are stored in URL parameters and restored when returning from a project write-up. Press `/` to focus search. Without JavaScript, all projects and their links remain available.

Project rows and write-up pages share link, activity, and technology components. The theme follows the system preference until a visitor selects light or dark mode. Transitions respect reduced-motion preferences.

## Scheduled production updates

`.github/workflows/refresh-projects.yml` requests a new Cloudflare Pages build daily at 00:23 UTC (05:53 IST), or on manual dispatch. Add the repository secret `CLOUDFLARE_PAGES_DEPLOY_HOOK` using a Cloudflare Pages deploy hook targeting the production branch. Configure Pages to run `pnpm build`; it fetches fresh metadata at build time. Optionally set `GITHUB_TOKEN` in Pages' build environment.

For a six-hour schedule, change the workflow cron to `23 */6 * * *`. The workflow deliberately does not commit generated data or modify the production branch. A local snapshot refresh can be committed when updating the project's fallback baseline; ephemeral builds fall back to the checked-in snapshot if GitHub fails. The deployed site changes only after a successful build and deployment.

### Catalog icons

Project actions use the existing local GitHub mark through astro-icon and Lucide glyphs for websites and navigation. Additional SVGRepo assets can be downloaded into `src/assets/icons` with `scripts/download-icon.sh ID/slug filename.svg`.
