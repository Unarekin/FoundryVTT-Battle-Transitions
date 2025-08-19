import { TransitionConfiguration } from "../steps";

export interface StepContext {
  key: string;
  name: string;
  icon?: string;
  tooltip?: string;
}

export type IsObject<T> = T extends { readonly [K: string]: any }
  ? T extends AnyArray | AnyFunction
  ? false
  : true
  : false;


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

export type AnyArray = readonly unknown[];
export type AnyFunction = (arg0: never, ...args: never[]) => unknown;

export interface AddStepContext {

  tabs: foundry.applications.api.ApplicationV2.Tab[];
  buttons: foundry.applications.api.ApplicationV2.FormFooterButton[];
}

export interface AddStepRenderOptions extends foundry.applications.api.ApplicationV2.RenderOptions {
  selectedKey?: string;
}

export interface AddStepTab extends foundry.applications.api.ApplicationV2.Tab {
  data: StepContext[];
}

export interface AddStepConfiguration extends foundry.applications.api.ApplicationV2.Configuration {
  sequence?: TransitionConfiguration[];
}