import { coerceTexture } from '../../coercion';
import { CanvasNotFoundError, InvalidDirectionError } from '../../errors';
import { TextureLike } from '../../types';
import { createColorTexture } from '../../utils';
import { TextureWipeFilter } from '../TextureWipe/TextureWipeFilter';


function createHorizontalTexture(bars: number): PIXI.Texture {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new CanvasNotFoundError();

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const left = ctx.createLinearGradient(0, 0, canvas.width, 0);
  const right = ctx.createLinearGradient(0, 0, canvas.width, 0);

  left.addColorStop(0, "black");
  left.addColorStop(1, "white");
  right.addColorStop(0, "white");
  right.addColorStop(1, "black");

  const barHeight = canvas.height / bars;

  for (let i = 0; i < bars; i++) {
    ctx.fillStyle = (i % 2 === 0) ? left : right;
    ctx.fillRect(0, barHeight * i, canvas.width, barHeight + (barHeight * i));
  }
  return PIXI.Texture.from(canvas);
}

function createVerticalTexture(bars: number): PIXI.Texture {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new CanvasNotFoundError();

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const top = ctx.createLinearGradient(0, 0, 0, canvas.height);
  const bottom = ctx.createLinearGradient(0, 0, 0, canvas.height);

  top.addColorStop(0, "black");
  top.addColorStop(1, "white");
  bottom.addColorStop(0, "white");
  bottom.addColorStop(1, "black");

  const barWidth = canvas.width / bars;

  for (let i = 0; i < bars; i++) {
    ctx.fillStyle = (i % 2 === 0) ? top : bottom;
    ctx.fillRect(barWidth * i, 0, barWidth + (barWidth * i), canvas.height);
  }

  return PIXI.Texture.from(canvas);
}

export class BarWipeFilter extends TextureWipeFilter {
  constructor(direction: "horizontal" | "vertical", bars: number, bg: TextureLike) {
    const bgTexture = coerceTexture(bg) ?? createColorTexture("transparent");
    if (!(direction === "horizontal" || direction === "vertical")) throw new InvalidDirectionError(direction);

    const wipeTexture = (direction === "horizontal") ? createHorizontalTexture(bars) : createVerticalTexture(bars);
    super(wipeTexture, bgTexture);
  }
}
