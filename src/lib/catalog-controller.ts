import { createScrollReveal } from "./scroll-reveal"

const SORT_VALUES = new Set(["recent", "stars", "name"])

export function setupCatalog() {
  const catalog = document.querySelector<HTMLElement>("[data-project-catalog]")
  if (!catalog || catalog.dataset.initialized) return
  catalog.dataset.initialized = "true"
  const list = catalog.querySelector<HTMLOListElement>("[data-project-list]")
  const search = catalog.querySelector<HTMLInputElement>("[data-catalog-search]")
  const activity = catalog.querySelector<HTMLSelectElement>("[data-catalog-activity]")
  const sort = catalog.querySelector<HTMLSelectElement>("[data-catalog-sort]")
  const rows = [...catalog.querySelectorAll<HTMLElement>("[data-project-row]")]
  const refreshReveal = createScrollReveal(rows)
  const filters = [...catalog.querySelectorAll<HTMLButtonElement>("[data-domain]")]
  const empty = catalog.querySelector<HTMLElement>("[data-catalog-empty]")
  const count = catalog.querySelector<HTMLElement>("[data-catalog-count]")
  if (!list || !search || !activity || !sort || !empty || !count) return
  let domain = "all"
  const url = new URL(location.href)
  search.value = url.searchParams.get("q") ?? ""
  const initialDomain = url.searchParams.get("domain")?.toLowerCase()
  if (filters.some((button) => button.dataset.domain === initialDomain)) domain = initialDomain ?? "all"
  if (SORT_VALUES.has(url.searchParams.get("sort") ?? "")) sort.value = url.searchParams.get("sort") ?? "recent"
  if ([...activity.options].some((option) => option.value === url.searchParams.get("activity")))
    activity.value = url.searchParams.get("activity") ?? "all"

  function update() {
    if (!list || !search || !activity || !sort || !empty || !count) return
    const terms = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const matches = rows
      .filter(
        (row) =>
          terms.every((term) => row.dataset.search?.includes(term)) &&
          (domain === "all" ||
            (JSON.parse(row.dataset.domains ?? "[]") as string[]).some((value) => value.toLowerCase() === domain)) &&
          (activity.value === "all" || row.dataset.activity === activity.value),
      )
      .sort((a, b) => {
        if (sort.value === "name") return (a.dataset.title ?? "").localeCompare(b.dataset.title ?? "")
        const key = sort.value === "stars" ? "stars" : "pushed"
        return (
          Number(b.dataset[key]) - Number(a.dataset[key]) ||
          (a.dataset.title ?? "").localeCompare(b.dataset.title ?? "")
        )
      })
    for (const row of rows) row.hidden = !matches.includes(row)
    list.append(...matches)
    matches.forEach((row, index) => {
      const number = row.querySelector("[data-project-number]")
      if (number) number.textContent = String(index + 1).padStart(2, "0")
    })
    refreshReveal()
    for (const button of filters) button.setAttribute("aria-pressed", String(button.dataset.domain === domain))
    count.textContent = `${matches.length} ${matches.length === 1 ? "project" : "projects"}${matches.length !== rows.length ? ` of ${rows.length}` : ""}`
    empty.hidden = matches.length > 0
    for (const [key, value, fallback] of [
      ["q", search.value.trim(), ""],
      ["domain", domain, "all"],
      ["sort", sort.value, "recent"],
      ["activity", activity.value, "all"],
    ]) {
      if (value === fallback) url.searchParams.delete(key)
      else url.searchParams.set(key, value)
    }
    history.replaceState(history.state, "", url)
  }

  search.addEventListener("input", () => update())
  activity.addEventListener("change", () => update())
  sort.addEventListener("change", () => update())
  for (const button of filters)
    button.addEventListener("click", () => {
      domain = button.dataset.domain ?? "all"
      update()
    })
  catalog.querySelector("[data-catalog-reset]")?.addEventListener("click", () => {
    search.value = ""
    activity.value = "all"
    domain = "all"
    update()
    search.focus()
  })
  catalog.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("[data-project-case-study-link]")) return
    const returnUrl = new URL(location.href)
    returnUrl.hash = "projects"
    try {
      sessionStorage.setItem("projectArchiveReturnUrl", returnUrl.toString())
    } catch {
      /* Storage may be disabled. */
    }
  })
  const keyboard = (event: KeyboardEvent) => {
    if (
      event.key !== "/" ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable]"))
    )
      return
    event.preventDefault()
    search.focus()
  }
  document.addEventListener("keydown", keyboard)
  document.addEventListener("astro:before-swap", () => document.removeEventListener("keydown", keyboard), {
    once: true,
  })
  catalog.querySelector<HTMLElement>("[data-catalog-controls]")?.removeAttribute("hidden")
  update()
}
