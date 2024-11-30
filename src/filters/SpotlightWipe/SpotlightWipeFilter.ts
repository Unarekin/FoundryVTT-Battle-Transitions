import { RadialDirection, WipeDirection } from '../../types';
import { angleBetween, createColorTexture, createConicGradientTexture } from '../../utils';
import { coerceTexture } from "../../coercion";
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';
import { InvalidDirectionError } from '../../errors';

//#region Texture Generation

function topOutside(): PIXI.Texture {
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight,
    0,
    window.innerWidth / 2, 0,
    [
      { point: 0, color: "black" },
      { point: 0.25, color: "white" },
      { point: 0.5, color: "black" }
    ]
  )
}

function topInside(): PIXI.Texture {
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight,
    0,
    window.innerWidth / 2, 0,
    [
      { point: 0, color: "white" },
      { point: 0.25, color: "black" },
      { point: 0.5, color: "white" }
    ]
  )
}

function bottomOutside(): PIXI.Texture {
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight,
    Math.PI,
    window.innerWidth / 2, window.innerHeight,
    [
      { point: 0, color: "white" },
      { point: 0.25, color: "black" },
      { point: 0.5, color: "white" }
    ]
  )
}

function bottomInside(): PIXI.Texture {
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight,
    Math.PI,
    window.innerWidth / 2, window.innerHeight,
    [
      { point: 0, color: "black" },
      { point: 0.25, color: "white" },
      { point: 0.5, color: "black" }
    ]
  )
}

function leftInside(): PIXI.Texture {
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight,
    Math.PI * 2 * .75,
    0, window.innerHeight / 2,
    [
      { point: 0, color: "white" },
      { point: 0.25, color: "black" },
      { point: 0.5, color: "white" }
    ]
  )
}

function leftOutside(): PIXI.Texture {
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight,
    Math.PI * 2 * .75,
    0, window.innerHeight / 2,
    [
      { point: 0, color: "black" },
      { point: 0.25, color: "white" },
      { point: 0.5, color: "black" }
    ]
  )
}

function rightInside(): PIXI.Texture {
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight, Math.PI * .5,
    window.innerWidth, window.innerHeight / 2,
    [
      { point: 0, color: "white" },
      { point: 0.25, color: "black" },
      { point: 0.5, color: "white" }
    ]
  )
}

function rightOutside(): PIXI.Texture {
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight, Math.PI * .5,
    window.innerWidth, window.innerHeight / 2,
    [
      { point: 0, color: "black" },
      { point: 0.25, color: "white" },
      { point: 0.5, color: "black" }
    ]
  )
}

function topLeftOutside(): PIXI.Texture {
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight,
    angleBetween(0, 0, window.innerWidth, window.innerHeight),
    0, 0,
    [
      { point: 0, color: "white" },
      { point: .25, color: "black" },
      { point: .85, color: "black" },
      { point: 1, color: "white" }
    ]
  )
}

function topLeftInside(): PIXI.Texture {
  const angle = angleBetween(0, 0, window.innerWidth, window.innerHeight);
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight, 0,
    0, 0,
    [
      { point: 0, color: "white" },
      { point: angle / (Math.PI * 2), color: "black" },
      { point: .25, color: "white" }
    ]
  )
}

function topRightInside(): PIXI.Texture {
  const angle = angleBetween(window.innerWidth, 0, 0, window.innerHeight);
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight, 0,
    window.innerWidth, 0,
    [
      { point: .25, color: "white" },
      { point: angle / (2 * Math.PI), color: "black" },
      { point: .5, color: "white" }
    ]
  )
}

function topRightOutside(): PIXI.Texture {
  const angle = angleBetween(window.innerWidth, 0, 0, window.innerHeight);
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight, 0,
    window.innerWidth, 0,
    [
      { point: .25, color: "black" },
      { point: angle / (2 * Math.PI), color: "white" },
      { point: .5, color: "black" }
    ]
  )
}

function bottomLeftOutside(): PIXI.Texture {
  const angle = angleBetween(0, window.innerHeight, window.innerWidth, 0);
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight, 0,
    0, window.innerHeight,
    [
      { point: .75, color: "black" },
      { point: 1 - Math.abs(angle) / (2 * Math.PI), color: "white" },
      { point: 1, color: "black" }
    ]
  )
}

function bottomLeftInside(): PIXI.Texture {
  const angle = angleBetween(0, window.innerHeight, window.innerWidth, 0);
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight, 0,
    0, window.innerHeight,
    [
      { point: .75, color: "white" },
      { point: 1 - Math.abs(angle) / (2 * Math.PI), color: "black" },
      { point: 1, color: "white" }
    ]
  )
}

function bottomRightOutside(): PIXI.Texture {
  const angle = angleBetween(window.innerWidth, window.innerHeight, 0, 0);
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight, 0,
    window.innerWidth, window.innerHeight,
    [
      { point: .5, color: "black" },
      { point: 1 - (Math.abs(angle) / (2 * Math.PI)), color: "white" },
      { point: .75, color: "black" }
    ]
  )
}
function bottomRightInside(): PIXI.Texture {
  const angle = angleBetween(window.innerWidth, window.innerHeight, 0, 0);
  return createConicGradientTexture(
    window.innerWidth, window.innerHeight, 0,
    window.innerWidth, window.innerHeight,
    [
      { point: .5, color: "white" },
      { point: 1 - (Math.abs(angle) / (2 * Math.PI)), color: "black" },
      { point: .75, color: "white" }
    ]
  )
}

//#endregion

const generators = {
  topinside: topInside,
  topoutside: topOutside,
  rightinside: rightInside,
  rightoutside: rightOutside,
  bottominside: bottomInside,
  bottomoutside: bottomOutside,
  leftinside: leftInside,
  leftoutside: leftOutside,
  topleftinside: topLeftInside,
  topleftoutside: topLeftOutside,
  toprightinside: topRightInside,
  toprightoutside: topRightOutside,
  bottomleftinside: bottomLeftInside,
  bottomleftoutside: bottomLeftOutside,
  bottomrightinside: bottomRightInside,
  bottomrightoutside: bottomRightOutside
}

function generateTexture(direction: WipeDirection, radial: RadialDirection): PIXI.Texture {
  const func = generators[`${direction}${radial}`];
  if (!func) throw new InvalidDirectionError(`${direction}-${radial}`);
  return func();
}

export class SpotlightWipeFilter extends TextureWipeFilter {
  constructor(direction: WipeDirection, radial: RadialDirection, bg: PIXI.TextureSource | PIXI.ColorSource = "transparent") {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const wipeTexture = generateTexture(direction, radial);
    super(wipeTexture, bgTexture);
  }
}