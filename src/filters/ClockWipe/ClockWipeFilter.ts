import { coerceTexture } from "../../coercion";
import { CanvasNotFoundError } from "../../errors";
import { ClockDirection, WipeDirection } from "../../types";
import { angleBetween, createColorTexture } from "../../utils";
import { TextureWipeFilter } from "../TextureWipe/TextureWipeFilter";


function clockWipe(angle: number, direction: ClockDirection): PIXI.Texture {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new CanvasNotFoundError();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gradient = ctx.createConicGradient(angle, canvas.width / 2, canvas.height / 2);

  gradient.addColorStop(0, direction === "clockwise" ? "black" : "white");
  gradient.addColorStop(1, direction === "clockwise" ? "white" : "black");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return PIXI.Texture.from(canvas);
}

function generateTexture(direction: WipeDirection, clockDirection: ClockDirection): PIXI.Texture {
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;

  switch (direction) {
    case "right": return clockWipe(0, clockDirection);
    case "left": return clockWipe(Math.PI, clockDirection);
    case "top": return clockWipe(Math.PI * 2 * .75, clockDirection);
    case "bottom": return clockWipe(Math.PI * .5, clockDirection);
    case "topleft": return clockWipe(angleBetween(x, y, 0, 0), clockDirection);
    case "topright": return clockWipe(angleBetween(x, y, window.innerWidth, 0), clockDirection);
    case "bottomleft": return clockWipe(angleBetween(x, y, 0, window.innerHeight), clockDirection);
    case "bottomright": return clockWipe(angleBetween(x, y, window.innerWidth, window.innerHeight), clockDirection);
  }
}

export class ClockWipeFilter extends TextureWipeFilter {

  constructor(clockDirection: ClockDirection, direction: WipeDirection, bg: PIXI.ColorSource | PIXI.TextureSource) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const wipeTexture = generateTexture(direction, clockDirection);

    super(wipeTexture, bgTexture);
  }
}
