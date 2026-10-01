/**
 * Vita icon set. The ONLY module product code imports glyphs from:
 *   import { Add, TrashCan } from "@/components/vita/icons"
 * Render them through <Icon as={Add} />. The upstream package is an implementation
 * detail and may be swapped without touching product code.
 */
export * from "@carbon/icons-react"
export type { CarbonIconType as IconType } from "@carbon/icons-react"
