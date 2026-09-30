import type * as React from "react"

export interface Demo {
  title: string
  description?: string
  render: () => React.ReactNode
}

export type DemoMap = Record<string, Demo[]>
