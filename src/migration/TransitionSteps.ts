import { AngularWipeMigrator, BilinearWipeMigrator, ClockWipeMigrator, DiamondWipeMigrator, FadeMigrator, FireDissolveMigrator, FlashMigrator, InvertMigrator, LinearWipeMigrator, MacroMigrator, MeltMigrator, ParallelMigrator, RadialWipeMigrator, RemoveOverlayMigrator, RestoreOverlayMigrator, SceneChangeMigrator, SoundMigrator, SpiralRadialWipeMigrator, SpotlightWipeMigrator, TextureSwapMigrator, VideoMigrator, WaitMigrator, WaveWipeMigrator } from "./steps";

const TransitionSteps = {
  angularwipe: AngularWipeMigrator,
  bilinearwipe: BilinearWipeMigrator,
  clockwipe: ClockWipeMigrator,
  diamondwipe: DiamondWipeMigrator,
  fade: FadeMigrator,
  firedissolve: FireDissolveMigrator,
  flash: FlashMigrator,
  invert: InvertMigrator,
  linearwipe: LinearWipeMigrator,
  macro: MacroMigrator,
  melt: MeltMigrator,
  parallel: ParallelMigrator,
  radialwipe: RadialWipeMigrator,
  removeoverlay: RemoveOverlayMigrator,
  restoreoverlay: RestoreOverlayMigrator,
  scenechange: SceneChangeMigrator,
  sound: SoundMigrator,
  spiralradialwipe: SpiralRadialWipeMigrator,
  spotlightwipe: SpotlightWipeMigrator,
  textureswap: TextureSwapMigrator,
  video: VideoMigrator,
  wait: WaitMigrator,
  wavewipe: WaveWipeMigrator
}

export { TransitionSteps };
