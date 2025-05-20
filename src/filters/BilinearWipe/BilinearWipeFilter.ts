import { coerceTexture } from '../../coercion';
import { InvalidDirectionError } from '../../errors';
import { BilinearDirection, RadialDirection } from '../../types';
import { createColorTexture, createGradientTexture } from '../../utils';
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';


//#region Texture Generation
function verticalInside(): PIXI.Texture {
  return createGradientTexture(window.innerWidth, 1, 0, 0, window.innerWidth, 0, [
    { point: 0, color: "white" },
    { point: .5, color: "black" },
    { point: 1, color: "white" }
  ])
}

function verticalOutside(): PIXI.Texture {
  return createGradientTexture(window.innerWidth, 1, 0, 0, window.innerWidth, 0, [
    { point: 0, color: "black" },
    { point: .5, color: "white" },
    { point: 1, color: "black" }
  ])
}

function topLeftInside(): PIXI.Texture {
  return createGradientTexture(
    window.innerWidth,
    window.innerHeight,
    0, 0,
    window.innerWidth,
    window.innerHeight,
    [
      { point: 0, color: "white" },
      { point: .5, color: "black" },
      { point: 1, color: "white" }
    ]
  )
}

function topRightInside(): PIXI.Texture {
  return createGradientTexture(
    window.innerWidth,
    window.innerHeight,
    window.innerWidth,
    0,
    0,
    window.innerHeight,
    [
      { point: 0, color: "white" },
      { point: .5, color: "black" },
      { point: 1, color: "white" }
    ]
  )
}

function topLeftOutside(): PIXI.Texture {
  return createGradientTexture(
    window.innerWidth,
    window.innerHeight,
    0, 0,
    window.innerWidth,
    window.innerHeight,
    [
      { point: 0, color: "black" },
      { point: .5, color: "white" },
      { point: 1, color: "black" }
    ]
  )
}

function topRightOutside(): PIXI.Texture {
  return createGradientTexture(
    window.innerWidth,
    window.innerHeight,
    window.innerWidth,
    0,
    0,
    window.innerHeight,
    [
      { point: 0, color: "black" },
      { point: .5, color: "white" },
      { point: 1, color: "black" }
    ]
  )
}

function horizontalInside(): PIXI.Texture {
  return createGradientTexture(
    1, window.innerHeight,
    0, 0,
    0, window.innerHeight,
    [
      { point: 0, color: "white" },
      { point: .5, color: "black" },
      { point: 1, color: "white" }
    ]
  )
}

function horizontalOutside(): PIXI.Texture {
  return createGradientTexture(
    1, window.innerHeight,
    0, 0,
    0, window.innerHeight,
    [
      { point: 0, color: "black" },
      { point: .5, color: "white" },
      { point: 1, color: "black" }
    ]
  )
}

//#endregion

function generateTexture(direction: BilinearDirection, radial: RadialDirection): PIXI.Texture {
  if (direction === "horizontal" && radial === "inside") return horizontalInside();
  else if (direction === "horizontal" && radial === "outside") return horizontalOutside();
  else if (direction === "vertical" && radial === "inside") return verticalInside();
  else if (direction === "vertical" && radial === "outside") return verticalOutside();
  else if (direction === "topleft" && radial === "inside") return topLeftInside();
  else if (direction === "topleft" && radial === "outside") return topLeftOutside();
  else if (direction === "topright" && radial === "inside") return topRightInside();
  else if (direction === "topright" && radial === "outside") return topRightOutside();
  else if (direction === "bottomleft" && radial === "inside") return topRightInside();
  else if (direction === "bottomleft" && radial === "outside") return topRightOutside();
  else if (direction === "bottomright" && radial === "inside") return topLeftInside();
  else if (direction === "bottomright" && radial === "outside") return topLeftOutside();

  throw new InvalidDirectionError(`${direction}-${radial}`);
}

export class BilinearWipeFilter extends TextureWipeFilter {

  constructor(direction: BilinearDirection, radial: RadialDirection, bg: PIXI.TextureSource | PIXI.ColorSource, falloff: number) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");

    const wipeTexture = generateTexture(direction, radial);
    if (!wipeTexture) throw new InvalidDirectionError(`${direction}-${radial}`);
    super(wipeTexture, falloff, bgTexture);
  }
}