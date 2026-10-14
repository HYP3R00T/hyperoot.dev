import { ChevronDown } from "lucide-react"
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
  return (
    <div className="catalog-dropdown">
      <DropdownMenu>
        <DropdownMenuTrigger className="dropdown-trigger" aria-label={label}>
          <span>{options.find((option) => option.value === value)?.label ?? options[0].label}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={6} collisionPadding={12} className="catalog-menu-content">
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={value} onValueChange={change}>
            {options.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {option.label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
