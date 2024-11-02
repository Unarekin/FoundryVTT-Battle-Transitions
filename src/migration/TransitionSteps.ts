import { AngularWipeMigrator, BilinearWipeMigrator, ClockWipeMigrator, DiamondWipeMigrator, FadeMigrator, FireDissolveMigrator, FlashMigrator, InvertMigrator, LinearWipeMigrator, MacroMigrator, MeltMigrator, ParallelMigrator, RadialWipeMigrator, RemoveOverlayMigrator, RestoreOverlayMigrator, SceneChangeMigrator, SoundMigrator, SpiralRadialWipeMigrator, SpotlightWipeMigrator, TextureSwapMigrator, VideoMigrator, WaitMigrator, WaveWipeMigrator } from "./steps";

const TransitionSteps = {
  angularwipe: new AngularWipeMigrator(),
  bilinearwipe: new BilinearWipeMigrator(),
  clockwipe: new ClockWipeMigrator(),
  diamondwipe: new DiamondWipeMigrator(),
  fade: new FadeMigrator(),
  firedissolve: new FireDissolveMigrator(),
  flash: new FlashMigrator(),
  invert: new InvertMigrator(),
  linearwipe: new LinearWipeMigrator(),
  macro: new MacroMigrator(),
  melt: new MeltMigrator(),
  parallel: new ParallelMigrator(),
  radialwipe: new RadialWipeMigrator(),
  removeoverlay: new RemoveOverlayMigrator(),
  restoreoverlay: new RestoreOverlayMigrator(),
  scenechange: new SceneChangeMigrator(),
  sound: new SoundMigrator(),
  spiralradialwipe: new SpiralRadialWipeMigrator(),
  spotlightwipe: new SpotlightWipeMigrator(),
  textureswap: new TextureSwapMigrator(),
  video: new VideoMigrator(),
  wait: new WaitMigrator(),
  wavewipe: new WaveWipeMigrator()
}

export { TransitionSteps };
