import { AngularWipeConfiguration, BarWipeConfiguration, BilinearWipeConfiguration, ClockWipeConfiguration, DiamondWipeConfiguration, FadeConfiguration, FireDissolveConfiguration, FlashConfiguration, HueShiftConfiguration, InvertConfiguration, TransitionConfiguration } from "../../steps/types"

// TODO: When updating to v13 types, extend foundry.applications.api.ApplicationV2.RenderContext
export interface StepConfigContext<t extends TransitionConfiguration = TransitionConfiguration> extends Record<string, unknown> {
  config: t;
  tabs?: Record<string, foundry.applications.api.ApplicationV2.Tab>;
  buttons: foundry.applications.api.ApplicationV2.FormFooterButton[];
}

export interface StepConfigConfiguration<t extends TransitionConfiguration = TransitionConfiguration> extends foundry.applications.api.ApplicationV2.Configuration {
  config: t;
}


export interface AngularWipeContext extends StepConfigContext<AngularWipeConfiguration> {
  easingSelect: Record<string, string>;
  bgTypeSelect: Record<string, string>;
}

export interface BarWipeContext extends StepConfigContext<BarWipeConfiguration> {
  easingSelect: Record<string, string>;
  bgTypeSelect: Record<string, string>;
  directionSelect: Record<string, string>;
}

export interface BilinearWipeContext extends StepConfigContext<BilinearWipeConfiguration> {
  easingSelect: Record<string, string>;
  bgTypeSelect: Record<string, string>;
  directionSelect: Record<string, string>;
  radialSelect: Record<string, string>;
}

export interface ClockWipeContext extends StepConfigContext<ClockWipeConfiguration> {
  easingSelect: Record<string, string>;
  clockDirectionSelect: Record<string, string>;
  bgTypeSelect: Record<string, string>;
  directionSelect: Record<string, string>;
}

export interface DiamondWipeContext extends StepConfigContext<DiamondWipeConfiguration> {
  easingSelect: Record<string, string>;
  bgTypeSelect: Record<string, string>;
}

export interface FadeContext extends StepConfigContext<FadeConfiguration> {
  bgTypeSelect: Record<string, string>;
  easingSelect: Record<string, string>;
}

export interface FireDissolveContext extends StepConfigContext<FireDissolveConfiguration> {
  easingSelect: Record<string, string>;
}

export interface FlashContext extends StepConfigContext<FlashConfiguration> {
  bgTypeSelect: Record<string, string>;
  dualStyleSelect: Record<string, string>;
  dualStyle: string;
}

export interface InvertContext extends StepConfigContext<InvertConfiguration> {
  dualStyleSelect: Record<string, string>;
  dualStyle: string;
}

export interface HueShiftContext extends StepConfigContext<HueShiftConfiguration> {
  dualStyleSelect: Record<string, string>;
  dualStyle: string;
  easingSelect: Record<string, string>;
}