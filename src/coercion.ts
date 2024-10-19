import { createColorTexture } from "./utils";

export function coerceColor(source: unknown): PIXI.Color | undefined {
  try {
    return new PIXI.Color(source as PIXI.ColorSource);
  } catch { /* empty */ }
}

export function coerceTexture(source: unknown): PIXI.Texture | undefined {
  // Attempt to get a texture directly
  try {
    return PIXI.Texture.from(source as PIXI.TextureSource);
  } catch { /* empty */ }

  const color = coerceColor(source as PIXI.ColorSource);
  if (color) return createColorTexture(color);
}