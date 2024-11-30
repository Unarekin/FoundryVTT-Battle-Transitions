import { ParallelStep } from "./ParallelStep";
import { RepeatStep } from "./RepeatStep";
import { TransitionStep } from "./TransitionStep";
import { ParallelConfiguration, RepeatConfiguration, TransitionConfiguration } from "./types";

export function getPreviousStep(id: string, sequence: TransitionConfiguration[]): TransitionConfiguration | undefined
export function getPreviousStep(id: string, sequence: TransitionStep[]): TransitionStep | undefined
export function getPreviousStep(id: string, sequence: unknown[]): TransitionStep | TransitionConfiguration | undefined {
  if (sequence[0] instanceof TransitionStep) return getPreviousStepByStep(id, sequence as TransitionStep[]);
  else return getPreviousStepByConfig(id, sequence as TransitionConfiguration[]);
}

function getPreviousStepByConfig(id: string, sequence: TransitionConfiguration[]): TransitionConfiguration | undefined {
  for (let i = 0; i < sequence.length; i++) {
    const step = sequence[i];
    if (step.id === id && i > 0) return sequence[i - 1];
    else if (step.id === id && i === 0) return undefined;
    if (step.type === "parallel") {
      const parallel = step as ParallelConfiguration;
      for (const sub of parallel.sequences) {
        const prev = getPreviousStepByConfig(id, sub);
        if (prev) return prev;
      }
    } else if (step.type === "repeat") {
      const repeat = step as RepeatConfiguration;
      if (repeat.sequence && Array.isArray(repeat.sequence)) {
        const prev = getPreviousStepByConfig(id, repeat.sequence);
        if (prev) return prev;
      }
    }
  }
  return undefined;
}

function getPreviousStepByStep(id: string, sequence: TransitionStep[]): TransitionStep | undefined {
  for (let i = 0; i < sequence.length; i++) {
    const step = sequence[i];
    if (step.config.id === id && i > 0) return sequence[i - 1];
    else if (step.config.id === id && i === 0) return undefined;

    if (step instanceof ParallelStep) {
      for (const sequence of step.preparedSequences) {
        const prev = getPreviousStepByStep(id, sequence);
        if (prev) return prev;
      }
    } else if (step instanceof RepeatStep) {
      const prev = getPreviousStepByStep(id, step.preparedSequence);
      if (prev) return prev;
    }
  }
  return undefined;
}

