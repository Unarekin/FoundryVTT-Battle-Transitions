import { AddStepDialogV1 } from './AddStepDialogV1';

export async function addStep(): Promise<string | null> {
  return AddStepDialogV1.prompt();
}

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// export async function editStep<t extends TransitionConfiguration>(config?: Partial<t>): Promise<t> {

// }