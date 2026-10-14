import { Check, ChevronDown } from "lucide-react"
import { Select } from "radix-ui"
import { useEffect, useState } from "react"

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
      <Select.Root value={value} onValueChange={change}>
        <Select.Trigger className="dropdown-trigger" aria-label={label} aria-controls="project-list">
          <Select.Value />
          <Select.Icon>
            <ChevronDown size={14} />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="dropdown-content" position="popper" sideOffset={6} collisionPadding={12}>
            <Select.Viewport>
              {options.map((option) => (
                <Select.Item key={option.value} value={option.value} className="dropdown-option">
                  <Select.ItemText>{option.label}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check size={14} />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )
}
