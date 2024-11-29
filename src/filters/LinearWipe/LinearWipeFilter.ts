import { coerceTexture } from '../../coercion';
import { InvalidDirectionError } from '../../errors';
import { WipeDirection } from '../../types';
import { createColorTexture, createGradientTexture } from '../../utils';
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';

//#region Texture Generation
function left(): PIXI.Texture {
  return createGradientTexture(
    window.innerWidth, 1,
    0, 0,
    window.innerWidth, 0,
    [
      { point: 0, color: "black" },
      { point: 1, color: "white" }
    ]
  )
}

function right(): PIXI.Texture {
  return createGradientTexture(
    window.innerWidth, 1,
    0, 0,
    window.innerWidth, 0,
    [
      { point: 0, color: "white" },
      { point: 1, color: "black" }
    ]
  )
}

function top(): PIXI.Texture {
  return createGradientTexture(
    1, window.innerHeight,
    0, 0,
    0, window.innerHeight,
    [
      { point: 0, color: "white" },
      { point: 1, color: "black" }
    ]
  )
}

function bottom(): PIXI.Texture {
  return createGradientTexture(
    1, window.innerHeight,
    0, 0,
    0, window.innerHeight,
    [
      { point: 0, color: "black" },
      { point: 1, color: "white" }
    ]
  )
}

function bottomRight(): PIXI.Texture {
  return createGradientTexture(
    window.innerWidth, window.innerHeight,
    0, 0,
    window.innerWidth, window.innerHeight,
    [
      { point: 0, color: "white" },
      { point: 1, color: "black" }
    ]
  )
}

function bottomLeft(): PIXI.Texture {
  return createGradientTexture(
    window.innerWidth, window.innerHeight,
    window.innerWidth, 0,
    0, window.innerHeight,
    [
      { point: 0, color: "white" },
      { point: 1, color: "black" }
    ]
  )
}

function topRight(): PIXI.Texture {
  return createGradientTexture(
    window.innerWidth, window.innerHeight,
    window.innerWidth, 0,
    0, window.innerHeight,
    [
      { point: 0, color: "black" },
      { point: 1, color: "white" }
    ]
  )
}

function topLeft(): PIXI.Texture {
  return createGradientTexture(
    window.innerWidth, window.innerHeight,
    0, 0,
    window.innerWidth, window.innerHeight,
    [
      { point: 0, color: "black" },
      { point: 1, color: "white" }
    ]
  )
}

//#endregion

function generateTexture(direction: WipeDirection): PIXI.Texture {
  if (direction === "left") return left();
  else if (direction === "right") return right();
  else if (direction === "top") return top();
  else if (direction === "bottom") return bottom();
  else if (direction === "topleft") return topLeft();
  else if (direction === "topright") return topRight();
  else if (direction === "bottomleft") return bottomLeft();
  else if (direction === "bottomright") return bottomRight();

  throw new InvalidDirectionError(direction);

}


export class LinearWipeFilter extends TextureWipeFilter {

  constructor(direction: WipeDirection, bg: PIXI.TextureSource | PIXI.ColorSource) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const wipeTexture = generateTexture(direction);
    super(wipeTexture, bgTexture);
  }
}