/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import frag from "./texturewipe.frag";
import { CustomFilter } from '../CustomFilter';
import { createColorTexture } from '../../utils';

type TextureWipeUniforms = {
  progress: number;
  wipeSampler: PIXI.Texture;
  bgSampler: PIXI.Texture;
}



Hooks.once("canvasReady", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  BattleTransitions.Presets = {
    linearLeft: wipePreset("linear-left.webp"),
    linearRight: wipePreset("linear-right.webp"),
    linearTop: wipePreset("linear-top.webp"),
    linearBottom: wipePreset("linear-bottom.webp"),

    linearTopLeft: wipePreset("linear-top-left.webp"),
    linearTopRight: wipePreset("linear-top-right.webp"),
    linearBottomRight: wipePreset("linear-bottom-right.webp"),
    linearBottomLeft: wipePreset("linear-bottom-left.webp"),

    bilinearVerticalInside: wipePreset("bilinear-vertical-inside.webp"),
    bilinearVerticalOutside: wipePreset("bilinear-vertical-outside.webp"),
    bilinearHorizontalInside: wipePreset("bilinear-horizontal-inside.webp"),
    bilinearHorizontalOutside: wipePreset("bilinear-horizontal-outside.webp"),

    bilinearTopLeftInside: wipePreset("bilinear-top-left-inside.webp"),
    bilinearTopLeftOutside: wipePreset("bilinear-top-left-outside.webp"),
    bilinearTopRightInside: wipePreset("bilinear-top-right-inside.webp"),
    bilinearTopRightOutside: wipePreset("bilinear-top-right-outside.webp"),

    radialInside: wipePreset("radial-inside.webp"),
    radialOutside: wipePreset("radial-outside.webp"),

    spotlightBottomOutside: wipePreset("spotlight-bottom-outside.webp"),
    spotlightLeftOutside: wipePreset("spotlight-left-outside.webp"),
    spotlightRightOutside: wipePreset("spotlight-right-outside.webp"),
    spotlightTopOutside: wipePreset("spotlight-top-outside.webp"),


    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    ...BattleTransitions.Presets
  }

})

const transparentTexture = createColorTexture(new PIXI.Color("#00000000"));

function wipePreset(url: string) {
  const texture = PIXI.Texture.from(`/modules/${__MODULE_ID__}/assets/wipes/${url}`);
  return function (duration: number, bgTexture: PIXI.Texture = transparentTexture) {
    return async function (container: PIXI.DisplayObject) {
      const filter = new TextureWipeFilter(texture, bgTexture);
      container.filters = [filter];
      await TweenMax.to(filter.uniforms, { progress: 1, duration });
      filter.destroy();
      container.filters = [];
    }
  }
}

export class TextureWipeFilter extends CustomFilter<TextureWipeUniforms> {

  constructor(wipeSampler: PIXI.Texture, bgSampler?: PIXI.Texture) {
    const uniforms: TextureWipeUniforms = {
      progress: 0,
      wipeSampler,
      bgSampler: bgSampler ?? transparentTexture
    }

    super(undefined, frag, uniforms);
  }
}