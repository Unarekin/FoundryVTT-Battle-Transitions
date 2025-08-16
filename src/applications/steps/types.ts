import { TransitionConfiguration } from "../../steps/types"

// TODO: When updating to v13 types, extend foundry.applications.api.ApplicationV2.RenderContext
export interface StepConfigContext<t extends TransitionConfiguration = TransitionConfiguration> extends Record<string, unknown> {
  config: t;
  tabs?: Record<string, foundry.applications.api.ApplicationV2.Tab>;
}

export interface StepConfigConfiguration<t extends TransitionConfiguration = TransitionConfiguration> extends foundry.applications.api.ApplicationV2.Configuration {
  config: t;
}
