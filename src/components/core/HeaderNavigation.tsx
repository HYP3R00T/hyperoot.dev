import { ArrowUpRightIcon } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu'
import type { NavItem } from '@/lib/types'

interface HeaderNavigationProps {
  navItems: NavItem[]
}

function MenuEntry({ item }: { item: NavItem }) {
  if (item.children?.length) {
    return (
      <NavigationMenuItem>
        <NavigationMenuTrigger className="bg-transparent font-normal text-foreground-2 hover:bg-transparent hover:text-accent-1 focus:bg-transparent focus:text-accent-1 data-open:bg-transparent data-open:text-foreground-2 data-popup-open:bg-transparent data-popup-open:text-foreground-2">
          {item.label}
        </NavigationMenuTrigger>
        <NavigationMenuContent className="md:left-1/2 md:w-[min(42rem,calc(100vw-4rem))] md:-translate-x-1/2 md:translate-y-4 overflow-visible border-0 p-0 text-foreground-0 shadow-none ring-0">
          <div className="rounded-lg border p-2">
            <div className="grid gap-1 grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
              {item.children.map((child) => (
                <NavigationMenuLink
                  key={[item.label, child.label, child.href].join('::')}
                  href={child.href}
                  target={child.blank ? '_blank' : undefined}
                  rel={child.blank ? 'noopener noreferrer' : undefined}
                  className="group/item rounded-md px-3 py-3 hover:bg-background-0/50 focus:bg-background-0/15"
                >
                  <span className="flex items-center gap-2 font-display text-base leading-tight text-foreground-0 transition-colors group-hover/item:text-accent-1">
                    <span>{child.label}</span>
                    {child.blank && (
                      <ArrowUpRightIcon className="size-3.5 shrink-0 text-foreground-3 opacity-0 transition-[opacity,color] group-hover/item:opacity-100 group-focus/item:opacity-100 group-hover/item:text-accent-1" />
                    )}
                  </span>
                </NavigationMenuLink>
              ))}
            </div>
          </div>
        </NavigationMenuContent>
      </NavigationMenuItem>
    )
  }

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        href={item.href}
        target={item.blank ? '_blank' : undefined}
        rel={item.blank ? 'noopener noreferrer' : undefined}
        className="group/top-link px-4 py-2 text-sm text-foreground-2 hover:bg-transparent hover:text-accent-1 focus:bg-transparent focus:text-accent-1"
      >
        <span className="flex items-center gap-2">
          <span>{item.label}</span>
          {item.blank && (
            <ArrowUpRightIcon className="size-3.5 shrink-0 text-foreground-3 opacity-0 transition-[opacity,color] group-hover/top-link:text-accent-1 group-hover/top-link:opacity-100 group-focus/top-link:text-accent-1 group-focus/top-link:opacity-100" />
          )}
        </span>
      </NavigationMenuLink>
    </NavigationMenuItem>
  )
}

export default function HeaderNavigation({ navItems }: HeaderNavigationProps) {
  return (
    <NavigationMenu viewport={false} className="font-mono">
      <NavigationMenuList>
        {navItems.map((item) => (
          <MenuEntry key={[item.label, item.href].join('::')} item={item} />
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}
