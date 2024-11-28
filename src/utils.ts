import { coerceTexture } from "./coercion";
import { LOG_ICON } from "./constants";
import { CannotInitializeCanvasError, CanvasNotFoundError, InvalidImportError, InvalidObjectError, InvalidTextureError, NoFileError } from "./errors";
import { DataURLBuffer, TextureBuffer } from "./interfaces";
import { createNoise2D, RandomFn } from "./lib/simplex-noise";
import { ScreenSpaceCanvasGroup } from "./ScreenSpaceCanvasGroup";
import { bytesToBase64 } from "./lib/base64Utils";
import { TransitionStep, BackgroundTransition, TransitionConfiguration } from "./steps";
import * as steps from "./steps"
import { BackgroundType, TextureLike } from "./types";

// #region Functions (33)

/**
 * Quick wrapper to wait for a hook to get called
 * @param {string} hook The hook to await
 * @returns 
 */
export async function awaitHook(hook: string): Promise<unknown[]> {
  return new Promise<unknown[]>(resolve => {
    Hooks.once(hook, (...args: unknown[]) => {
      resolve(args);
    })
  })
}

/**
 * Generates a 1x1 {@link PIXI.Texture} with a given color
 * @param {PIXI.Color} color {@link PIXI.Color}
 * @returns 
 */
export function createColorTexture(color: PIXI.ColorSource): PIXI.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new CannotInitializeCanvasError();
  const actualColor = new PIXI.Color(color);
  ctx.fillStyle = actualColor.toHexa();
  ctx.fillRect(0, 0, 1, 1);
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

function dataURLToBuffer(url: string): Uint8Array {
  const binary = atob(url.split(",")[1]);
  const buffer = new Uint8Array(binary.length);
  for (let i = 0; i < buffer.length; i++)
    buffer[i] = binary.charCodeAt(i);
  return buffer;
}

function deserializeDataURL(data: DataURLBuffer): PIXI.Texture {
  const base64 = bytesToBase64((data.buffer instanceof ArrayBuffer) ? new Uint8Array(data.buffer) : data.buffer);
  return PIXI.Texture.from(`data:${data.mimeType};base64,${base64}`);
}

export function deserializeTexture(data: string | DataURLBuffer | TextureBuffer): PIXI.Texture {
  if (typeof data === "string") return coerceTexture(data) ?? createColorTexture("transparent");

  const urlBuffer = data as DataURLBuffer;
  if (urlBuffer.buffer && urlBuffer.mimeType) return deserializeDataURL(urlBuffer);

  const textureBuffer = data as TextureBuffer;
  if (textureBuffer.buffer && textureBuffer.width && textureBuffer.height) return deserializeTextureBuffer(textureBuffer);

  else throw new InvalidTextureError()
}

function deserializeTextureBuffer(data: TextureBuffer): PIXI.Texture {
  return PIXI.Texture.fromBuffer(data.buffer, data.width, data.height);
}

function isNumeric(value: unknown): boolean {
  if (typeof value === "number") return true;

  if (typeof value === "string") {
    const temp = parseFloat(value);
    return temp.toString() === value;
  }
  return false;
}

function findFormValue(serialized: { name: string, value: unknown }[], key: string): unknown {
  const elem = serialized.find(({ name }) => name === key);

  if (key === "background") {
    const bgType = serialized.find(({ name }) => name === "backgroundType");
    if (!bgType) return null;
    if (bgType.value === "image") return findFormValue(serialized, "backgroundImage");
    else return findFormValue(serialized, "backgroundColor");
  }

  if (!elem) return null;
  if (key === "id" && !elem.value) return foundry.utils.randomID();

  return isNumeric(elem.value) ? parseFloat(elem.value as string) : elem.value;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function formatBackgroundSummary(flag: any): string {
  return "";
  // return (flag.backgroundType === "image" ? flag.backgroundImage?.split("/").splice(-1)[0] : flag.backgroundColor) ?? "";
}

export function generateBilinearDirectionSelectOptions(): { [x: string]: string } {
  return {
    "horizontal": "BATTLETRANSITIONS.DIRECTIONS.HORIZONTAL",
    "vertical": "BATTLETRANSITIONS.DIRECTIONS.VERTICAL",
    "topleft": "BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",
    "topright": "BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT"
  }
}

export function generateClockDirectionSelectOptions(): { [x: string]: string } {
  return {
    "clockwise": "BATTLETRANSITIONS.DIRECTIONS.CLOCKWISE",
    "counterclockwise": "BATTLETRANSITIONS.DIRECTIONS.COUNTERCLOCKWISE"
  }
}

export function generateEasingSelectOptions(): { [x: string]: string } {
  return {
    "none": "BATTLETRANSITIONS.EASINGS.NONE",
    "power1in": "BATTLETRANSITIONS.EASINGS.POWER1IN",
    "power1out": "BATTLETRANSITIONS.EASINGS.POWER1OUT",
    "power1inout": "BATTLETRANSITIONS.EASINGS.POWER1INOUT",
    "power2in": "BATTLETRANSITIONS.EASINGS.POWER2IN",
    "power2out": "BATTLETRANSITIONS.EASINGS.POWER2OUT",
    "power2inout": "BATTLETRANSITIONS.EASINGS.POWER2INOUT",
    "power3in": "BATTLETRANSITIONS.EASINGS.POWER3IN",
    "power3out": "BATTLETRANSITIONS.EASINGS.POWER3OUT",
    "power3inout": "BATTLETRANSITIONS.EASINGS.POWER3INOUT",
    "power4in": "BATTLETRANSITIONS.EASINGS.POWER4IN",
    "power4out": "BATTLETRANSITIONS.EASINGS.POWER4OUT",
    "power4inout": "BATTLETRANSITIONS.EASINGS.POWER4INOUT",
    "backin": "BATTLETRANSITIONS.EASINGS.BACKIN",
    "backout": "BATTLETRANSITIONS.EASINGS.BACKOUT",
    "backinout": "BATTLETRANSITIONS.EASINGS.BACKINOUT",
    "bouncein": "BATTLETRANSITIONS.EASINGS.BOUNCEIN",
    "bounceout": "BATTLETRANSITIONS.EASINGS.BOUNCEOUT",
    "bounceinout": "BATTLETRANSITIONS.EASINGS.BOUNCEINOUT",
    "circin": "BATTLETRANSITIONS.EASINGS.CIRCIN",
    "circout": "BATTLETRANSITIONS.EASINGS.CIRCOUT",
    "circinout": "BATTLETRANSITIONS.EASINGS.CIRCINOUT",
    "elasticin": "BATTLETRANSITIONS.EASINGS.ELASTICIN",
    "elasticout": "BATTLETRANSITIONS.EASINGS.ELASTICOUT",
    "elasticinout": "BATTLETRANSITIONS.EASINGS.ELASTICINOUT",
    "expoin": "BATTLETRANSITIONS.EASINGS.EXPOIN",
    "expoout": "BATTLETRANSITIONS.EASINGS.EXPOOUT",
    "expoinout": "BATTLETRANSITIONS.EASINGS.EXPOINOUT",
    "sinein": "BATTLETRANSITIONS.EASINGS.SINEIN",
    "sineout": "BATTLETRANSITIONS.EASINGS.SINEOUT",
    "sineinout": "BATTLETRANSITIONS.EASINGS.SINEINOUT"
  }
}

export function generateLinearDirectionSelectOptions(): { [x: string]: string } {
  return {
    "top": "BATTLETRANSITIONS.DIRECTIONS.TOP",
    "left": "BATTLETRANSITIONS.DIRECTIONS.LEFT",
    "right": "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
    "bottom": "BATTLETRANSITIONS.DIRECTIONS.BOTTOM",
    "topleft": "BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",
    "topright": "BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT",
    "bottomleft": "BATTLETRANSITIONS.DIRECTIONS.BOTTOMLEFT",
    "bottomright": "BATTLETRANSITIONS.DIRECTIONS.BOTTOMRIGHT"
  }
}

export function generateRadialDirectionSelectOptions(): { [x: string]: string } {
  return {
    "inside": "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
    "outside": "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
  }
}

export function generateFontSelectOptions(): { [x: string]: string } {
  return Object.fromEntries(FontConfig.getAvailableFonts().map(font => [font, font]));
}

export function getCanvasGroup(): ScreenSpaceCanvasGroup | undefined {
  return canvas?.stage?.children.find(child => child instanceof ScreenSpaceCanvasGroup);
}

export function getCurrentOverlayObject(): PIXI.DisplayObject | undefined {
  const canvasGroup = getCanvasGroup();
  if (!canvasGroup) throw new CanvasNotFoundError();
  if (canvasGroup.children.length === 0) return;
  return canvasGroup.children[canvasGroup.children.length - 1];
}

export function getSortedSteps(): (typeof TransitionStep)[] {
  return Object.values(steps).sort((a, b) => localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${a.name}`).localeCompare(localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${b.name}`))) as (typeof TransitionStep)[];
}

export function getStepClassByKey(key: string): (typeof TransitionStep) | undefined {
  return Object.values(steps).find(obj => obj.key === key) as (typeof TransitionStep) | undefined;
}

/**
 * Inverts a {@link PIXI.Texture}
 * @param {PIXI.Texture} texture {@link PIXI.Texture} to be inverted
 * @returns {PIXI.Texture} {@link PIXI.Texture}
 */
export function invertTexture(texture: PIXI.Texture): PIXI.Texture {
  const extracted = canvas?.app?.renderer.extract.canvas(PIXI.Sprite.from(texture)) as HTMLCanvasElement;
  if (!extracted) throw new CannotInitializeCanvasError();

  const newCanvas = document.createElement("canvas");
  newCanvas.width = extracted.width;
  newCanvas.height = extracted.height;
  const ctx = newCanvas.getContext("2d");
  if (!ctx) throw new CannotInitializeCanvasError();
  ctx.drawImage(extracted, 0, 0);
  ctx.globalCompositeOperation = "difference";
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, newCanvas.width, newCanvas.height);
  return PIXI.Texture.from(newCanvas);
}

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

export function localize(key: string, data: Record<string, unknown> = {}): string {
  return game.i18n?.format(key, data) ?? key;
}

export function log(...args: unknown[]) {
  console.log(LOG_ICON, __MODULE_TITLE__, "|", ...args);
}

export function logImage(url: string, size: number = 256) {
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

export function logTexture(texture: PIXI.Texture, size: number = 256) {
  const renderTexture = PIXI.RenderTexture.create({ width: texture.width, height: texture.height });
  const sprite = PIXI.Sprite.from(texture);
  canvas?.app?.renderer.render(sprite, { renderTexture });
  canvas?.app?.renderer.extract.base64(renderTexture)
    .then(base64 => {
      logImage(base64, size);
    }).catch(console.error);
}

export function parseConfigurationFormElements<t = any>(form: JQuery<HTMLFormElement>, ...elements: string[]): Partial<t> {
  const serialized = form.serializeArray();

  const elem = Object.fromEntries(
    elements.map(key => [key, findFormValue(serialized, key)])
  );
  return elem as Partial<t>;
}

/**
 * Rotates a texture by a preset
 * @param {PIXI.Texture} texture {@link PIXI.Texture}
 * @param {number} rotation 
 * @returns {PIXI.Texture} {@link PIXI.Texture}
 */
export function rotateTexture(texture: PIXI.Texture, rotation: number): PIXI.Texture {
  const { frame } = texture;

  const h = PIXI.groupD8.isVertical(rotation) ? texture.frame.width : texture.frame.height;
  const w = PIXI.groupD8.isVertical(rotation) ? texture.frame.height : texture.frame.width;

  const crop = new PIXI.Rectangle(texture.frame.x, texture.frame.y, w, h);
  const trim = crop;

  let rotated: PIXI.Texture;
  if (rotation % 2 === 0) {
    rotated = new PIXI.Texture(texture.baseTexture, frame, crop, trim, rotation);
  } else {
    rotated = new PIXI.Texture(texture.baseTexture, frame, crop, trim, rotation - 1);
    rotated.rotate++;
  }

  return rotated;
}

function serializeCanvas(canvas: HTMLCanvasElement): TextureBuffer {
  const buffer = dataURLToBuffer(canvas.toDataURL());
  return {
    width: canvas.width,
    height: canvas.height,
    buffer
  }
}

function serializeDataURL(url: string): DataURLBuffer {
  const buffer = dataURLToBuffer(url);
  return {
    mimeType: url.split(";")[0].split(":")[1],
    buffer
  }
}

export function serializeTexture(texture: any): string | TextureBuffer | DataURLBuffer {
  if (typeof texture === "string" && texture === "overlay") return "overlay";
  if (typeof texture === "string" && texture.startsWith("data:")) return serializeDataURL(texture);
  if (typeof texture === "string") return texture;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  if (typeof texture.src === "string") return texture.src;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
  if (typeof texture.value !== "undefined") return texture.value;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const baseTexture: PIXI.BaseTexture = texture.baseTexture;
  const resource = baseTexture.resource;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  if (typeof (resource as any).data !== "undefined") return { width: resource.width, height: resource.height, buffer: (resource as any).data };

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const source = (resource as any).source;

  if (source instanceof HTMLImageElement) return source.getAttribute("src") as string;
  else if (source instanceof HTMLCanvasElement) return serializeCanvas(source);

  console.error(texture);
  throw new InvalidTextureError();
}

export function shouldUseAppV2(): boolean {
  return (game.release?.isNewer("12") ?? false) && !!foundry.applications.api.ApplicationV2;
}

export function sizeOf(obj: unknown) {
  const objectList: unknown[] = [];
  const stack = [obj];
  let size = 0;

  while (stack.length) {
    const value = stack.pop();

    switch (typeof value) {
      case "boolean":
        size += 4;
        break;
      case "string":
        size += value.length * 2;
        break;
      case "number":
        size += 8;
        break;
      case "object":
        if (!objectList.includes(value)) {
          objectList.push(value);
          for (const prop in value) {
            if (Object.prototype.hasOwnProperty.call(value, prop))
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
              stack.push((value as any)[prop]);
          }
        }
        break;
    }
  }
  return size;
}

export async function wait(duration: number) {
  return new Promise(resolve => { setTimeout(resolve, duration); });
}

// #endregion Functions (33)


// export async function confirmDialog(title: string, content: string): Promise<boolean> {
//   if (shouldUseAppV2() && foundry.applications.api.DialogV2) return confirmV2(title, content);
//   else return confirmV1(title, content);

// }

// async function confirmV1(title: string, content: string): Promise<boolean> {
//   return Dialog.confirm({
//     title: localize(title),
//     content: localize(content),
//     rejectClose: false
//   }).then(val => !!val)
// }

// async function confirmV2(title: string, content: string): Promise<boolean> {
//   return foundry.applications.api.DialogV2.confirm({
//     // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//     window: { title: localize(title) } as any,
//     content: localize(content),
//     rejectClose: false
//   }).then(val => !!val);
// }

export function isColor(data: string): boolean {
  return CSS.supports("color", data);
}

export function migratev10XBackground(old: { background: string }): BackgroundTransition {
  return {
    backgroundType: old.background && !isColor(old.background) ? "image" : "color",
    backgroundColor: isColor(old.background) ? old.background : "",
    backgroundImage: !isColor(old.background) && old.background ? old.background : "",
    bgSizingMode: "stretch"
  }
}

export function getMacros(): Macro[] {
  return [
    ...((game.macros?.contents.slice() as Macro[]) ?? []),
    ...(game.packs?.contents.reduce((prev, curr) => {
      if (curr.documentName !== "Macro") return prev;
      return [
        ...prev,
        ...curr.index.contents
      ] as Macro[];
    }, [] as Macro[]) ?? [])
  ]
}

export function getActors(): Actor[] {
  return [
    ...((game.actors?.contents.slice() as Actor[]) ?? []),
    ...(game.packs?.contents.reduce((prev, curr) => {
      if (curr.documentName !== "Actor") return prev;
      return [
        ...prev,
        ...curr.index.contents
      ] as Actor[]
    }, [] as Actor[]) ?? [])
  ]
}

export function getCompendiumFromUUID(uuid: string): string {
  const split = uuid.split(".");
  if (split[0] !== "Compendium") return "";
  return split[2];
}

export async function nextFrame() {
  return new Promise(resolve => { requestAnimationFrame(resolve); });
}

/**
 * Returns a {@link Promise} that rejects after the specified amount of time
 */
export async function timeout(time: number, err?: Error): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      reject(err ? err : new Error());
    }, time)
  });
}

export function formatDuration(duration: number): string {
  return localize(`BATTLETRANSITIONS.FORMATTERS.MILLISECONDS`, { value: duration.toLocaleString() });
}

// function parseDuration(duration: number) {
//   return {
//     days: Math.trunc(duration / 86400000),
//     hours: Math.trunc(duration / 3600000) % 24,
//     minutes: Math.trunc(duration / 60000) % 60,
//     seconds: Math.trunc(duration / 1000) % 60,
//     ms: Math.trunc(duration) % 1000
//   }
// }

// export function formatDuration(duration: number): string {
//   const parsed = parseDuration(duration);

//   const output: number[] = [
//     ...(parsed.days ? [parsed.days] : []),
//     ...(parsed.hours || parsed.days ? [parsed.hours] : []),
//     parsed.minutes,
//     parsed.seconds
//   ];

//   return `${output.map(item => item.toString().padStart(2, "0")).join(":")}${parsed.ms ? `.${parsed.ms.toString().padEnd(3, "0")}` : ''}`;
// }

export function deepCopy(target: any, source: any): void {
  if (typeof target !== "object") throw new InvalidObjectError(target);
  if (typeof source !== "object") throw new InvalidObjectError(source);

  for (const prop in source) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (Array.isArray(source[prop]))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      target[prop] = source[prop].slice();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (typeof source[prop] === "object")
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      deepCopy(target[prop], source[prop]);
    else
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      target[prop] = source[prop];
  }
}

export function backgroundType(background: TextureLike): BackgroundType {
  if (typeof background === "string" && background === "overlay") return "overlay";
  else if (typeof background === "string" && isColor(background)) return "color";
  else return "image";
}

export function downloadJSON(json: object, name: string) {
  const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
  const objUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objUrl;
  link.download = name.endsWith(".json") ? name : `${name}.json`;
  link.click();
  URL.revokeObjectURL(objUrl);
}

export async function importSequence(): Promise<TransitionConfiguration[] | null> {
  const json = await uploadJSON<TransitionConfiguration[]>();
  const sequence: TransitionConfiguration[] = [];
  if (!json) return null;
  if (!Array.isArray(json)) throw new InvalidImportError();
  for (const config of json) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidImportError();
    const res = step.validate(config, json);
    const actual = (res instanceof Promise) ? await res : res;
    if (actual instanceof Error) throw actual;
    sequence.push(actual);
  }
  return sequence;
}

export function uploadJSON<t = any>(): Promise<t> {
  return new Promise<t>((resolve, reject) => {
    const file = document.createElement("input");
    file.setAttribute("type", "file");
    file.setAttribute("accept", "application/json");
    file.onchange = e => {
      const file = (e.currentTarget as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new NoFileError());
        return;
      }
      const reader = new FileReader();
      reader.onload = e => {
        if (!e.target?.result) throw new NoFileError();
        if (typeof e.target.result === "string") resolve(JSON.parse(e.target.result) as t);
      }
      reader.readAsText(file);
    }
    file.onerror = (event, source, line, col, error) => {
      if (error) reject(error);
      else reject(new Error(typeof event === "string" ? event : typeof undefined));
    }

    file.click();
  })

}