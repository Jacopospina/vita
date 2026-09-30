import type { DemoMap } from "./types"
import { foundationDemos } from "./foundations"
import { actionDemos } from "./actions"
import { inputDemos } from "./inputs"
import { dataDemos } from "./data"
import { feedbackDemos } from "./feedback"
import { patternDemos } from "./patterns"
import { aboutDemos } from "./about"

export const demos: DemoMap = {
  ...aboutDemos,
  ...foundationDemos,
  ...actionDemos,
  ...inputDemos,
  ...dataDemos,
  ...feedbackDemos,
  ...patternDemos,
}
