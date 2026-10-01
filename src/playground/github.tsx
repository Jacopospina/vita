import * as React from "react"
import { LogoGithub } from "@/registry/icons"
import { HeaderGlobalAction } from "@/registry/ui/ui-shell"
import { Button } from "@/registry/ui/button"
import { AnimatedNumber } from "@/registry/ui/animated"

const REPO = "Jacopospina/corpus"

/**
 * The GitHub action in the header, with the repository's fork count beside it. The count comes from GitHub's public
 * API; while the repository is private (or the request fails) only the icon shows.
 */
export function GithubAction() {
  const [forks, setForks] = React.useState<number | null>(null)
  React.useEffect(() => {
    const ctl = new AbortController()
    fetch(`https://api.github.com/repos/${REPO}`, { signal: ctl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (typeof d?.forks_count === "number") setForks(d.forks_count) })
      .catch(() => {})
    return () => ctl.abort()
  }, [])
  const open = () => window.open(`https://github.com/${REPO}`, "_blank")
  if (forks === null) return <HeaderGlobalAction icon={LogoGithub} label="Repository" onClick={open} />
  return (
    <Button variant="ghost" size="sm" icon={LogoGithub} aria-label={`Repository — ${forks} forks`} onClick={open} className="h-8 rounded-inner-2">
      <AnimatedNumber value={forks} />
    </Button>
  )
}
