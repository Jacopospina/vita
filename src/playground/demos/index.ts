import type { DemoMap } from "./types"
import { foundationDemos } from "./foundations"
import { actionDemos } from "./actions"
import { inputDemos } from "./inputs"
import { dataDemos } from "./data"
import { feedbackDemos } from "./feedback"
import { patternDemos } from "./patterns"
import { aboutDemos } from "./about"
import { interactionDemos } from "./interaction"
import { chatDemos } from "./chat"
import { voiceDemos } from "./voice"
import { peopleDemos } from "./people"

export const demos: DemoMap = {
  ...aboutDemos,
  ...chatDemos,
  ...voiceDemos,
  ...peopleDemos,
  ...interactionDemos,
  ...foundationDemos,
  ...actionDemos,
  ...inputDemos,
  ...dataDemos,
  ...feedbackDemos,
  ...patternDemos,
}
