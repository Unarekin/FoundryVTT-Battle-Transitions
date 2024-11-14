import { TransitionConfiguration } from '../steps';
import { getSortedSteps, shouldUseAppV2 } from '../utils';
import { AddStepDialogV1 } from './AddStepDialogV1';
import { AddStepDialogV2 } from './AddStepDialogV2';
import { EditStepDialogV1 } from './EditStepDialogV1';
import { StepContext } from './types';

export async function addStepDialog(): Promise<string | null> {
  if (shouldUseAppV2()) return AddStepDialogV2.prompt();
  else return AddStepDialogV1.prompt();
}


export function getStepsForCategory(category: string, hidden: boolean = false): StepContext[] {
  return getSortedSteps().reduce((prev, curr) => curr.category === category && (hidden ? true : curr.hidden === false) ? [...prev, { key: curr.key, name: `BATTLETRANSITIONS.${curr.name}.NAME`, description: `BATTLETRANSITIONS.${curr.name}.DESCRIPTION`, icon: curr.icon, tooltip: "", hasIcon: !!curr.icon }] : prev, [] as StepContext[]);
}

export async function editStepDialog(config: TransitionConfiguration): Promise<TransitionConfiguration | null> {
  return EditStepDialogV1.prompt(config);
}

export async function confirm(title: string, content: string): Promise<boolean> {
  if (shouldUseAppV2()) {
    return foundry.applications.api.DialogV2.confirm({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      window: ({ title } as any),
      content
    });
  } else {
    return Dialog.confirm({
      title,
      content
    }).then(val => !!val);
  }
}

export function buildTransitionFromForm(html: JQuery<HTMLElement>) {
  const sequence: TransitionConfiguration[] = [];
  html.find("#transition-step-list [data-transition-type]").each((index, element) => {
    const flag = element.dataset.flag ?? "";
    const step = JSON.parse(flag) as TransitionConfiguration;
    sequence.push(step);
  });
  return sequence;
}