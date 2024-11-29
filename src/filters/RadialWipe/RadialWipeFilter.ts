import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';
import { RadialDirection } from "../../types";
import { coerceTexture } from "../../coercion";
import { createColorTexture } from "../../utils";
import { CanvasNotFoundError } from '../../errors';

function inside(): PIXI.Texture {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new CanvasNotFoundError();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
  );

  gradient.addColorStop(0, "black");
  gradient.addColorStop(1, "white");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return PIXI.Texture.from(canvas);
}

function outside(): PIXI.Texture {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new CanvasNotFoundError();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const gradient = ctx.createRadialGradient(
    canvas.width / 2, canvas.height / 2, 0,
    canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height)
  );

  gradient.addColorStop(0, "white");
  gradient.addColorStop(1, "black");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  return PIXI.Texture.from(canvas);
}


export class RadialWipeFilter extends TextureWipeFilter {
  constructor(direction: RadialDirection, bg: PIXI.TextureSource | PIXI.ColorSource) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    const wipeTexture = direction === "inside" ? inside() : outside();
    super(wipeTexture, bgTexture);
  }
}
