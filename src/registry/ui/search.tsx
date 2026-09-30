import * as React from "react"
import { Search as SearchIcon, Close } from "@/registry/icons"
import { cn } from "@/registry/lib/utils"
import { useControllable } from "@/registry/hooks/use-controllable"
import { Icon } from "@/registry/ui/icon"

/**
 * Search — find content by query. Label is visually hidden but always present.
 * variant "field" = in forms/pages · "toolbar" = inside table toolbars/headers (transparent until focus) · "expandable" = icon that grows.
 */
export interface SearchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue" | "onChange"> {
  label?: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmitSearch?: (value: string) => void
  size?: "sm" | "md" | "lg"
  variant?: "field" | "toolbar" | "expandable"
}

const heights = { sm: "h-control-sm", md: "h-control-md", lg: "h-control-lg" } as const

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  ({ label = "Search", value, defaultValue = "", onValueChange, onSubmitSearch, size = "md", variant = "field", placeholder = "Search", className, ...props }, ref) => {
    const [val, setVal] = useControllable(value, defaultValue, onValueChange)
    const [expanded, setExpanded] = React.useState(variant !== "expandable")
    const inputRef = React.useRef<HTMLInputElement | null>(null)
    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement)
    const collapsed = variant === "expandable" && !expanded && !val

    return (
      <div
        role="search"
        className={cn(
          "group relative flex items-center transition-[width] duration-moderate-01 ease-productive",
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
          onBlur={() => variant === "expandable" && !val && setExpanded(false)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmitSearch?.(val)
            if (e.key === "Escape") setVal("")
          }}
          tabIndex={collapsed ? -1 : undefined}
          {...props}
          className={cn(
            "h-full w-full min-w-0 rounded-md pr-control-md pl-control-md text-body text-foreground placeholder:text-placeholder",
            "transition-[background-color,border-color] duration-fast-02 ease-productive [&::-webkit-search-cancel-button]:appearance-none",
            "focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-focus",
            variant === "field" && "border border-border-field bg-field hover:border-border-strong",
            variant !== "field" && "border border-transparent bg-transparent hover:bg-hover focus:bg-field",
            collapsed && "pointer-events-none opacity-0",
          )}
        />
        {val && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setVal("")
              inputRef.current?.focus()
            }}
            className="absolute right-0 flex h-full w-control-md items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-ring-inset"
          >
            <Icon as={Close} />
          </button>
        )}
      </div>
    )
  },
)
Search.displayName = "Search"
