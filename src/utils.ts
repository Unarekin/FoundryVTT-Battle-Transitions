import { CannotInitializeCanvasError } from "./errors";
import { createNoise2D, RandomFn } from "./lib/simplex-noise"

/**
 * Linearly interpolates between two values
 * @param {number} a Starting value
 * @param {number} b Ending value
 * @param {number} progress Relative distance through range, normalized
 * @returns 
 */
export function lerp(a: number, b: number, progress: number) {
  return a + progress * (b - progress);
}


export function logImage(url: string, size = 256) {
  const image = new Image();

  image.onload = function () {
    const style = [
      `font-size: 1px`,
      `padding: ${size}px`,
      // `padding: ${this.height / 100 * size}px ${this.width / 100 * size}px`,
      `background: url(${url}) no-repeat`,
      `background-size:contain`,
      `border:1px solid black`
    ].join(";")
    console.log('%c ', style);;
  }

  image.src = url;

}


/**
 * Generates a simplex noise texture
 * @param {number} [width=256]
 * @param {number} [height=256]
 * @param {RandomFn} random {@link RandomFn}
 * @returns 
 */
export function createNoiseTexture(width: number = 256, height: number = 256, random?: RandomFn): PIXI.Texture {
  const noise2D = createNoise2D(random);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new CannotInitializeCanvasError();
  canvas.width = width;
  canvas.height = height;

  const imageData = ctx.createImageData(canvas.width, canvas.height);
  const data = imageData.data;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const value = noise2D(x / 32, y / 32);
      const index = (y * canvas.width + x) * 4;
      data[index] = value * 255;
      data[index + 1] = value * 255;
      data[index + 2] = value * 255;
      data[index + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return PIXI.Texture.from(canvas);
}

/**
 * Creates a 1-dimensional gradient by interpolating between r,g,b values of two colors
 * @param {number} size 
 * @param {PIXI.Color} startColor {@link PIXI.Color}
 * @param {PIXI.Color} endColor {@link PIXI.Color}
 * @returns 
 */
export function createGradient1DTexture(size: number, startColor?: PIXI.Color, endColor?: PIXI.Color): PIXI.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = 1;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new CannotInitializeCanvasError();

  const gradient = ctx.createLinearGradient(0, 0, size, 0);

  const actualStart: PIXI.Color = (startColor ?? new PIXI.Color("white"));
  const actualEnd: PIXI.Color = endColor ?? new PIXI.Color("black");

  gradient.addColorStop(0, actualStart.toHex());
  gradient.addColorStop(1, actualEnd.toHex());

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, 1);


  return PIXI.Texture.from(canvas);
}
