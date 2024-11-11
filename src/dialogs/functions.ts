import { getSortedSteps, shouldUseAppV2 } from '../utils';
import { AddStepDialogV1 } from './AddStepDialogV1';
import { AddStepDialogV2 } from './AddStepDialogV2';
import { StepContext } from './types';

export async function addStep(): Promise<string | null> {
  return AddStepDialogV1.prompt();
  if (shouldUseAppV2()) return AddStepDialogV2.prompt();
  else return AddStepDialogV1.prompt();
}


export function getStepsForCategory(category: string): StepContext[] {
  return getSortedSteps().reduce((prev, curr) => curr.category === category ? [...prev, { key: curr.key, name: `BATTLETRANSITIONS.TRANSITIONTYPES.${curr.name}`, icon: curr.icon, tooltip: "", hasIcon: !!curr.icon }] : prev, [] as StepContext[]);
}


