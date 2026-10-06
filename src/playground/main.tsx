import React from "react"
import ReactDOM from "react-dom/client"
import { bootAppearance, guardHotStyleUpdates } from "@/registry/lib/appearance"
import "@fontsource-variable/google-sans-flex"
import "@fontsource-variable/google-sans-code"
import "@fontsource-variable/inter"
import "@fontsource/ibm-plex-sans/400.css"
import "@fontsource/ibm-plex-sans/500.css"
import "@fontsource/ibm-plex-sans/600.css"
import "@fontsource/ibm-plex-sans/700.css"
import "@fontsource/ibm-plex-mono/400.css"
import "@fontsource/ibm-plex-mono/500.css"
import "@/styles/vita.css"
import "./prose.css"
import { App } from "./App"
import { HOME_URL } from "./nav"

// The docs have no home of their own: the showcase is the homepage. A bare docs URL goes there.
if (!window.location.hash || window.location.hash === "#/") window.location.replace(HOME_URL)

// Transitions stay off until fonts and layout settle, so nothing glides in from its pre-layout position.
bootAppearance()
guardHotStyleUpdates(import.meta.hot)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
