import * as React from "react"
import { Search as SearchIcon, Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { useControllable } from "@/registry/hooks/use-controllable"
import { Icon } from "@/registry/ui/icon"
import { Kbd } from "@/registry/ui/kbd"
import { useShortcut } from "@/registry/hooks/use-shortcut"

/**
 * Search — find content by query. Label is visually hidden but always present.
 * variant "field" = in forms/pages · "toolbar" = inside toolbars, headers and sidebars (no border, soft fill) · "expandable" = icon that grows.
 */
export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange"> {
  label?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmitSearch?: (value: string) => void
  size?: "sm" | "md" | "lg"
  variant?: "field" | "toolbar" | "expandable"
  /** Left-hand shortcut that focuses the field, e.g. "mod+f". Shown as a hint while empty. */
  shortcut?: string
}

const heights = { sm: "h-control-sm", md: "h-control-md", lg: "h-control-lg" } as const

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ label = "Search", value, defaultValue = "", onValueChange, onSubmitSearch, size = "md", variant = "field", placeholder = "Search", shortcut, className, ...props }, ref) => {
    const [val, setVal] = useControllable(value, defaultValue, onValueChange)
    const [expanded, setExpanded] = React.useState(variant !== "expandable")
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)
    const collapsed = variant === "expandable" && !expanded && !val
    const [focused, setFocused] = React.useState(false)
    useShortcut(shortcut, () => {
      setExpanded(true)
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    })

    return (
      <div
        role="search"
        className={cn(
          "group relative flex items-center duration-moderate-01 ease-productive",
          heights[size],
          collapsed ? "w-control-md" : "w-full",
          className,
        )}
      >
        <button
          type="button"
          tabIndex={collapsed ? 0 : -1}
          aria-label={collapsed ? label : undefined}
          aria-hidden={collapsed ? undefined : true}
          onClick={() => {
            setExpanded(true)
            requestAnimationFrame(() => inputRef.current?.focus())
          }}
          className={cn("absolute left-0 z-10 flex h-full w-control-md items-center justify-center text-muted-foreground", collapsed ? "rounded-md hover:bg-hover focus-ring" : "pointer-events-none")}
        >
          <Icon as={SearchIcon} />
        </button>
        <input
          ref={inputRef}
          type="search"
          role="searchbox"
          aria-label={label}
          placeholder={placeholder}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false)
            if (variant === "expandable" && !val) setExpanded(false)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmitSearch?.(val)
            // Escape: clear and let go — the left hand never needs to reach for the mouse to leave search.
            if (e.key === "Escape") {
              e.preventDefault()
              setVal("")
              e.currentTarget.blur()
            }
          }}
          aria-keyshortcuts={shortcut}
          tabIndex={collapsed ? -1 : undefined}
          {...props}
          className={cn(
            "h-full w-full min-w-0 rounded-md pr-control-md pl-control-md text-body text-foreground placeholder:text-placeholder",
            " duration-fast-02 ease-productive [&::-webkit-search-cancel-button]:appearance-none",
            "focus-visible:outline-1 focus-visible:outline-offset-0 focus-visible:outline-(--corpus-ring) focus-visible:focus-halo focus-visible:animate-focus-in",
            variant === "field" && "border border-border-field bg-field hover:border-border-strong",
            variant !== "field" && "border border-transparent bg-hover hover:bg-active focus:bg-field",
            collapsed && "pointer-events-none opacity-0",
          )}
        />
        {shortcut && <Kbd keys={shortcut} className={cn("pointer-events-none absolute right-2", !val && !focused && !collapsed ? "opacity-100" : "scale-90 opacity-0")} />}
        {(
          <button
            type="button"
            aria-label="Clear search"
            aria-hidden={!val || undefined}
            tabIndex={val ? 0 : -1}
            onClick={() => {
              setVal("")
              inputRef.current?.focus()
            }}
            className={cn("absolute right-0 flex h-full w-control-md items-center justify-center rounded-md text-muted-foreground duration-moderate-01 ease-spring hover:text-foreground focus-ring-inset", val ? "scale-100 opacity-100" : "pointer-events-none scale-75 opacity-0")}
          >
            <Icon as={Close} />
          </button>
        )}
      </div>
    )
  },
)
Search.displayName = "Search"
