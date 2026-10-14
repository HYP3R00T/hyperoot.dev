import { ArrowDownAZ, ArrowDownWideNarrow, ChevronDown, Clock3, Star } from "lucide-react"
import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Props {
  controlId: string
  label: string
  options: { value: string; label: string }[]
}

export default function CatalogDropdown({ controlId, label, options }: Props) {
  const [value, setValue] = useState(options[0].value)
  useEffect(() => {
    const native = document.getElementById(controlId) as HTMLSelectElement | null
    if (!native) return
    const sync = () => setValue(native.value)
    sync()
    native.closest(".catalog-select")?.classList.add("dropdown-enhanced")
    native.addEventListener("catalog:sync", sync)
    return () => native.removeEventListener("catalog:sync", sync)
  }, [controlId])
  const change = (next: string) => {
    const native = document.getElementById(controlId) as HTMLSelectElement | null
    if (!native) return
    native.value = next
    setValue(next)
    native.dispatchEvent(new Event("change", { bubbles: true }))
  }
  const icons = { recent: Clock3, stars: Star, name: ArrowDownAZ }
  const selectedLabel = options.find((option) => option.value === value)?.label ?? options[0].label
  return (
    <div className="catalog-dropdown">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="dropdown-trigger catalog-sort-trigger"
          aria-label={label}
          title={`${label}: ${selectedLabel}`}
        >
          <ArrowDownWideNarrow size={16} aria-hidden="true" />
          <ChevronDown size={12} aria-hidden="true" />
          <span className="sr-only">{selectedLabel}</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} collisionPadding={12} className="catalog-menu-content">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={change}>
            {options.map((option) => {
              const OptionIcon = icons[option.value as keyof typeof icons] ?? Clock3
              return (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  <OptionIcon size={14} aria-hidden="true" />
                  {option.label}
                </DropdownMenuRadioItem>
              )
            })}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
