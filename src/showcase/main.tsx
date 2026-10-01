import React from "react"
import ReactDOM from "react-dom/client"
import { bootAppearance } from "@/registry/lib/appearance"
import "@fontsource-variable/google-sans-flex"
import "@fontsource-variable/google-sans-code"
import "@/styles/corpus.css"
import { Showcase } from "./Showcase"

// Transitions stay off until fonts and layout settle, so nothing glides in from its pre-layout position.
bootAppearance()

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Showcase />
  </React.StrictMode>,
)
