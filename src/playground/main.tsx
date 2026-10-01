import React from "react"
import ReactDOM from "react-dom/client"
import { bootAppearance, guardHotStyleUpdates } from "@/registry/lib/appearance"
import "@fontsource-variable/google-sans-flex"
import "@fontsource-variable/google-sans-code"
import "@/styles/corpus.css"
import "./prose.css"
import { App } from "./App"

// Transitions stay off until fonts and layout settle, so nothing glides in from its pre-layout position.
bootAppearance()
guardHotStyleUpdates(import.meta.hot)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
