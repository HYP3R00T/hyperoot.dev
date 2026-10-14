import { useEffect, useState } from "react"
import { Toggle } from "@/components/ui/toggle"

export default function CatalogActivityToggle() {
  const [pressed, setPressed] = useState(false)
  useEffect(() => {
    const native = document.querySelector<HTMLInputElement>("[data-catalog-activity]")
    if (!native) return
    const sync = () => setPressed(native.checked)
    sync()
    native.closest(".catalog-activity")?.classList.add("toggle-enhanced")
    native.addEventListener("catalog:sync", sync)
    return () => native.removeEventListener("catalog:sync", sync)
  }, [])
  return (
    <Toggle
      variant="outline"
      size="sm"
      className="catalog-active-toggle"
      pressed={pressed}
      aria-label="Active only"
      aria-controls="project-list"
      title="Projects with a push in the last 30 days"
      onPressedChange={(next) => {
        const native = document.querySelector<HTMLInputElement>("[data-catalog-activity]")
        if (!native) return
        native.checked = next
        setPressed(next)
        native.dispatchEvent(new Event("change", { bubbles: true }))
      }}
    >
      Active only
    </Toggle>
  )
}
