import { AnimatedTransition } from "../../steps";
import { Easing } from "../../types";

export function addPeriodToEasing(easing: string): Easing {
  if (easing.includes(".")) return easing as Easing;
  else if (easing.endsWith("inOut")) return `${easing.replace(/inOut/g, ".inOut")}` as Easing;
  else if (easing.endsWith("in")) return easing.replace(/in/g, ".in") as Easing;
  else if (easing.endsWith("out")) return easing.replace(/out/g, ".out") as Easing;
  else return easing as Easing;
}

export function v115EasingFix<t extends AnimatedTransition>(config: AnimatedTransition): t {
  return {
    ...config,
    easing: addPeriodToEasing(config.easing)
  } as t;
}