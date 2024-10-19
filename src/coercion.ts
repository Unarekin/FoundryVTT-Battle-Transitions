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

export function coerceScene(arg: unknown): Scene | undefined {
  if (!((game instanceof Game) && game.scenes)) return;

  if (typeof arg === "string") {
    let scene = game.scenes.get(arg);
    if (scene) return scene;
    scene = game.scenes.getName(arg);
    if (scene) return scene;
  } else if (arg instanceof Scene) {
    return arg;
  }
}

export function coerceMacro(id: string): Macro | undefined
export function coerceMacro(name: string): Macro | undefined
export function coerceMacro(uuid: string): Macro | undefined
export function coerceMacro(macro: Macro): Macro
export function coerceMacro(arg: unknown): Macro | undefined {
  if (arg instanceof Macro) return arg;
  if (!(game as Game).macros) return;

  if (typeof arg === "string") {
    let macro = (game as Game).macros?.get(arg);
    if (macro) return macro;
    macro = (game as Game).macros?.getName(arg);
    if (macro) return macro;
    if (arg.split(".")[0] === "Macro") return (game as Game).macros?.get(arg.split(".").slice(1).join("."));
  }
}