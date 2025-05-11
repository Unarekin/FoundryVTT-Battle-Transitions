import { createColorTexture } from "./utils";

export function coerceColor(source: unknown): PIXI.Color | undefined {
  try {
    return new PIXI.Color(source as PIXI.ColorSource);
  } catch { /* empty */ }
}

export function coerceColorHex(source: unknown): string | undefined {
  const color = coerceColor(source);
  if (color) return color.toHexa();
  return;
}

export function coerceTexture(source: unknown): PIXI.Texture | undefined {
  const color = coerceColor(source);
  if (color) return createColorTexture(color);


  // Attempt to get a texture directly
  try {
    return PIXI.Texture.from(source as PIXI.TextureSource);
  } catch { /* empty */ }
}

export function coerceScene(arg: unknown): Scene | undefined {
  if (!((game instanceof Game) && game.scenes)) return;

  if (typeof arg === "string") {
    let scene = game.scenes.get(arg);
    if (scene instanceof Scene) return scene;
    scene = game.scenes.getName(arg);
    if (scene instanceof Scene) return scene;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    scene = fromUuidSync(arg) as any;
    if (scene instanceof Scene) return scene;
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

export function coerceUser(arg: unknown): User | undefined {
  if (arg instanceof User) return arg;
  if (typeof arg === "string") {
    let user: User | undefined = game?.users?.get(arg);
    if (user instanceof User) return user;
    user = game?.users?.getName(arg);
    if (user instanceof User) return user;
    user = (fromUuidSync(arg) as User | undefined);
    if (user instanceof User) return user;
  }
}