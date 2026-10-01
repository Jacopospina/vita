/** The global nav — ONE list, used by the docs header and the showcase header so they never drift apart. */
export const globalNav = [
  { label: "Start", path: "guidelines", sections: ["guidelines", "getting-started"] },
  { label: "Foundations", path: "foundations/accessibility", sections: ["foundations"] },
  { label: "Components", path: "components/choosing-components", sections: ["components"] },
  { label: "Patterns", path: "patterns/agent-conversation", sections: ["patterns"] },
  { label: "Decisions", path: "decisions/how-we-decide", sections: ["decisions"] },
] as const
