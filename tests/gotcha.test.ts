import { describe, expect, it } from "vitest"
import { toast } from "@/registry/ui/notification"

// A notification of a word or three, with nothing else, is a gotcha beside the pointer, never a banner.
describe("tiny notifications become gotchas", () => {
  it("serves a short title-only success or info as a gotcha", () => {
    expect(toast({ title: "Saved" })).toBe(0)
    expect(toast({ kind: "success", title: "Comment added" })).toBe(0)
  })
  it("keeps a real notification a banner", () => {
    expect(toast({ kind: "success", title: "Agent deployed", subtitle: "Support triage is live" })).toBeGreaterThan(0)
    expect(toast({ kind: "error", title: "Failed" })).toBeGreaterThan(0)
    expect(toast({ title: "Saved", action: { label: "Undo", onClick: () => {} } })).toBeGreaterThan(0)
    expect(toast({ title: "Redirecting to your identity provider" })).toBeGreaterThan(0)
  })
})
