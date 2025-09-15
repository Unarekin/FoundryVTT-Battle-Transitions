/* eslint-disable @typescript-eslint/no-empty-object-type */
import { AngularWipeConfiguration, BarWipeConfiguration, BilinearWipeConfiguration, BossSplashConfiguration, ClockWipeConfiguration, DiamondWipeConfiguration, FadeConfiguration, FireDissolveConfiguration, FlashConfiguration, HueShiftConfiguration, InvertConfiguration, LinearWipeConfiguration, LoadingTipConfiguration, MacroConfiguration, MeltConfiguration, PixelateConfiguration, RadialWipeConfiguration, RepeatConfiguration, ReverseConfiguration, SoundConfiguration, SpiralShutterConfiguration, SpiralWipeConfiguration, SpotlightWipeConfiguration, TextureSwapConfiguration, TransitionConfiguration, TwistConfiguration, VideoConfiguration, WaitConfiguration, WaveWipeConfiguration, ZoomBlurConfiguration, ZoomConfiguration } from "../../steps/types";

// TODO: When updating to v13 types, extend foundry.applications.api.ApplicationV2.RenderContext
export interface StepConfigContext<t extends TransitionConfiguration = TransitionConfiguration> extends Record<string, unknown> {
  config: t;
  tabs?: Record<string, foundry.applications.api.ApplicationV2.Tab>;
  buttons: foundry.applications.api.ApplicationV2.FormFooterButton[];
}

export interface StepConfigConfiguration<t extends TransitionConfiguration = TransitionConfiguration> extends foundry.applications.api.ApplicationV2.Configuration {
  config: t;
  oldScene?: string;
  newScene?: string;
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

export interface BossSplashContext extends StepConfigContext<BossSplashConfiguration> {
  fontSelect: Record<string, string>;
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

export interface LinearWipeContext extends StepConfigContext<LinearWipeConfiguration> {
  bgTypeSelect: Record<string, string>;
  easingSelect: Record<string, string>;
  directionSelect: Record<string, string>;
}

export interface LoadingTipContext extends StepConfigContext<LoadingTipConfiguration> {
  sourceSelect: Record<string, string>;
  tableSelect: Record<string, string>;
  locationSelect: Record<string, string>;
  fontSelect: Record<string, string>;
  table: string;
  string: string;
  fontFamily: string;
  dropShadowColor: string;
}

export interface MacroContext extends StepConfigContext<MacroConfiguration> {

}

export interface MeltContext extends StepConfigContext<MeltConfiguration> {
  easingSelect: Record<string, string>;
  bgTypeSelect: Record<string, string>;
}

export interface PixelateContext extends StepConfigContext<PixelateConfiguration> {
  easingSelect: Record<string, string>;
  dualStyleSelect: Record<string, string>;
  dualStyle: string;
}

export interface RadialWipeContext extends StepConfigContext<RadialWipeConfiguration> {
  radialSelect: Record<string, string>;
  bgTypeSelect: Record<string, string>;
  easingSelect: Record<string, string>;
  targetTypeSelect: Record<string, string>;
  targetType: string;
  pointX: number;
  pointY: number;
  selectedToken: string;
  selectedTile: string;
  selectedDrawing: string;
  selectedNote: string;
}

export interface RepeatContext extends StepConfigContext<RepeatConfiguration> {
  styleSelect: Record<string, string>;

}

export interface ReverseContext extends StepConfigContext<ReverseConfiguration> { }

export interface SoundContext extends StepConfigContext<SoundConfiguration> { }

export interface SpiralShutterContext extends StepConfigContext<SpiralShutterConfiguration> {
  directionSelect: Record<string, string>;
  radialSelect: Record<string, string>;
  bgTypeSelect: Record<string, string>;
  easingSelect: Record<string, string>;
}

export interface SpiralWipeContext extends StepConfigContext<SpiralWipeConfiguration> {
  bgTypeSelect: Record<string, string>;
  easingSelect: Record<string, string>;
  directionSelect: Record<string, string>;
  radialSelect: Record<string, string>;
  clockDirectionSelect: Record<string, string>;
}

export interface SpotlightWipeContext extends StepConfigContext<SpotlightWipeConfiguration> {
  directionSelect: Record<string, string>;
  radialSelect: Record<string, string>;
  bgTypeSelect: Record<string, string>;
  easingSelect: Record<string, string>;
}

export interface TextureSwapContext extends StepConfigContext<TextureSwapConfiguration> {
  bgTypeSelect: Record<string, string>;
  dualStyleSelect: Record<string, string>;
  dualStyle: string;
}

export interface TwistContext extends StepConfigContext<TwistConfiguration> {
  directionSelect: Record<string, string>;
  easingSelect: Record<string, string>;
  dualStyleSelect: Record<string, string>;
  dualStyle: string;
}

export interface VideoContext extends StepConfigContext<VideoConfiguration> {
  bgTypeSelect: Record<string, string>;
  keyRangeX: number;
  keyRangeY: number;
}

export interface WaitContext extends StepConfigContext<WaitConfiguration> { }

export interface WaveWipeContext extends StepConfigContext<WaveWipeConfiguration> {
  radialSelect: Record<string, string>;
  bgTypeSelect: Record<string, string>;
  easingSelect: Record<string, string>;
}

export interface ZoomContext extends StepConfigContext<ZoomConfiguration> {
  easingSelect: Record<string, string>;
  bgTypeSelect: Record<string, string>;
  dualStyleSelect: Record<string, string>;
  dualStyle: string;
  targetTypeSelect: Record<string, string>;
  targetType: string;
  pointX: number;
  pointY: number;
  selectedToken: string;
  selectedTile: string;
  selectedDrawing: string;
  selectedNote: string;
}

export interface ZoomBlurContext extends StepConfigContext<ZoomBlurConfiguration> {
  easingSelect: Record<string, string>;
  dualStyleSelect: Record<string, string>;
  dualStyle: string;
}