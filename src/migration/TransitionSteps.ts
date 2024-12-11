import { AngularWipeMigrator, BarWipeMirator, BilinearWipeMigrator, ClockWipeMigrator, DiamondWipeMigrator, FadeMigrator, FireDissolveMigrator, FlashMigrator, HueShiftMigrator, InvertMigrator, LinearWipeMigrator, MacroMigrator, MeltMigrator, ParallelMigrator, PixelateMigrator, RadialWipeMigrator, RemoveOverlayMigrator, RestoreOverlayMigrator, SceneChangeMigrator, SoundMigrator, SpiralShutterMigrator, SpiralWipeMigrator, SpotlightWipeMigrator, TextureSwapMigrator, TwistMigrator, VideoMigrator, WaitMigrator, WaveWipeMigrator, ZoomBlurMigrator, ZoomMigrator } from "./steps";

const TransitionSteps = {
  angularwipe: new AngularWipeMigrator(),
  barwipe: new BarWipeMirator(),
  bilinearwipe: new BilinearWipeMigrator(),
  clockwipe: new ClockWipeMigrator(),
  diamondwipe: new DiamondWipeMigrator(),
  fade: new FadeMigrator(),
  firedissolve: new FireDissolveMigrator(),
  flash: new FlashMigrator(),
  hueshift: new HueShiftMigrator(),
  invert: new InvertMigrator(),
  linearwipe: new LinearWipeMigrator(),
  macro: new MacroMigrator(),
  melt: new MeltMigrator(),
  parallel: new ParallelMigrator(),
  pixelate: new PixelateMigrator(),
  radialwipe: new RadialWipeMigrator(),
  removeoverlay: new RemoveOverlayMigrator(),
  restoreoverlay: new RestoreOverlayMigrator(),
  scenechange: new SceneChangeMigrator(),
  sound: new SoundMigrator(),
  spiralshutter: new SpiralShutterMigrator(),
  spiralwipe: new SpiralWipeMigrator(),
  spotlightwipe: new SpotlightWipeMigrator(),
  textureswap: new TextureSwapMigrator(),
  twist: new TwistMigrator(),
  video: new VideoMigrator(),
  wait: new WaitMigrator(),
  wavewipe: new WaveWipeMigrator(),
  zoomblur: new ZoomBlurMigrator(),
  zoom: new ZoomMigrator()
}

export { TransitionSteps };
