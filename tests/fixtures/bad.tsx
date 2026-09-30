import { Trash } from "lucide-react"
import * as Dialog from "@radix-ui/react-dialog"
export function Bad({ dark }: { dark: boolean }) {
  return (
    <div className="bg-blue-500 p-7 text-sm rounded-2xl shadow-lg duration-300 dark:bg-black w-[317px]" style={{ color: "#ff0000" }}>
      <button onClick={() => {}}>OK</button>
      <h2>Title</h2>
      {/* corpus-allow raw-element: native anchor for download attr — approved by @jacopo */}
      <a href="/file.csv" download>Download</a>
    </div>
  )
}
export function BadCopy() {
  return <Button label="Submit">Oops</Button>
}
