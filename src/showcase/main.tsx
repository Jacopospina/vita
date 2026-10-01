import React from "react"
import ReactDOM from "react-dom/client"
import "@fontsource-variable/google-sans-flex"
import "@fontsource-variable/google-sans-code"
import "@/styles/corpus.css"
import { Showcase } from "./Showcase"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Showcase />
  </React.StrictMode>,
)
