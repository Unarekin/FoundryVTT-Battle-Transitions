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

/** Borroed from Foundry types to bypass module type bullshit I don't feel like fixing properly */

export type EmptyObject = Record<string, never>;

/**
 * Recursively sets keys of an object to optional. Used primarily for update methods
 * @internal
 */
export type DeepPartial<T> = T extends unknown
  ? IsObject<T> extends true
  ? {
    [P in keyof T]?: DeepPartial<T[P]>;
  }
  : T
  : T;

export type IsObject<T> = T extends { readonly [K: string]: any }
  ? T extends AnyArray | AnyFunction
  ? false
  : true
  : false;

export type AnyArray = readonly unknown[];
export type AnyFunction = (arg0: never, ...args: never[]) => unknown;