import React from "react"
import ReactDOM from "react-dom/client"
import "@fontsource-variable/google-sans-flex"
import "@fontsource-variable/google-sans-code"
import "@/styles/corpus.css"
import "./prose.css"
import { App } from "./App"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
