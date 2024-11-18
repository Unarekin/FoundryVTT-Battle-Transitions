/* eslint-disable @typescript-eslint/no-empty-object-type */

export interface AddStepTab {
  title: string;
  icon?: string;
  data: StepContext[];
}

export interface StepContext {
  key: string;
  name: string;
  icon?: string;
  tooltip?: string;
}

export interface AddStepDialogOptions extends DialogOptions {

}

export interface AddStepDialogData extends DialogData<HTMLElement | JQuery<HTMLElement>> {
  title: string;
  header?: string;
  footer?: string;
  tabs: AddStepTab[];
  hasIcon?: boolean;
}