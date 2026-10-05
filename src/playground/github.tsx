import * as React from "react"
import { LogoGithub } from "@/registry/icons"
import { HeaderGlobalAction } from "@/registry/ui/ui-shell"
import { AnimatedNumber } from "@/registry/ui/animated"

const REPO = "Jacopospina/vita"

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
  return (
    <HeaderGlobalAction icon={LogoGithub} label={forks === null ? "Repository" : `Repository, ${forks} forks`} onClick={open}
      value={forks === null ? undefined : <AnimatedNumber value={forks} />} />
  )
}
