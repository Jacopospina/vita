/**
 * Vita pictogram set. The ONLY module product code imports pictograms from:
 *   import { Rocket } from "@/components/vita/pictograms"
 * Render them through <Pictogram as={Rocket} />.
 */
// Every pictogram as LINES (generated from Carbon's set by scripts/build-pictograms.mjs): round caps, round joins,
// bends rounded to the theme's radius, width from the theme's line weight. Never sharp.
export * from "./pictograms.data"
