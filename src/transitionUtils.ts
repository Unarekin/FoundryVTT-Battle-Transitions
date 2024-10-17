/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { COVER_ID } from "./constants";
import { ScreenSpaceCanvasGroup } from './ScreenSpaceCanvasGroup';
import { CanvasNotFoundError, NotInitializedError, NoCoverElementError, InvalidSceneError } from './errors';




// Create cover HTMLElement
const transitionCover = document.createElement("div");
transitionCover.style.display = "none";
transitionCover.style.position = "absolute";
transitionCover.style.width = "100%";
transitionCover.style.height = "100%";
transitionCover.id = COVER_ID;
document.body.appendChild(transitionCover);

let canvasGroup: ScreenSpaceCanvasGroup | null = null;

export function initializeCanvas() {
  canvasGroup = new ScreenSpaceCanvasGroup();
  canvas?.stage?.addChild(canvasGroup);

  const bgSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
  bgSprite.tint = canvas?.app?.renderer.background.backgroundColor ?? new PIXI.Color("white")
  bgSprite.width = window.innerWidth;
  bgSprite.height = window.innerHeight;
  canvasGroup?.addChild(bgSprite);
  canvasGroup.alpha = 0;
}

export async function createSnapshot() {
  if (!canvas) throw new CanvasNotFoundError();
  if (!(canvas.app && canvas.hidden && canvas.primary && canvas.tiles && canvas.drawings && canvas.scene && canvas.stage)) throw new NotInitializedError();

  const { sceneWidth, sceneHeight } = canvas.scene.dimensions;

  const renderer = canvas.app.renderer;

  const rt = PIXI.RenderTexture.create({ width: sceneWidth, height: sceneHeight });
  renderer.render(canvas.stage, { renderTexture: rt, skipUpdateTransform: true, clear: true });

  const transitionCover = document.getElementById(COVER_ID) as HTMLImageElement | null;
  if (!transitionCover) throw new NoCoverElementError();

  transitionCover.style.backgroundImage = "";
  const start = Date.now();
  const img = await renderer.extract.image(rt);
  // const img = renderer.extract.canvas(rt) as HTMLCanvasElement;
  console.log(`Image transfered in ${Date.now() - start}ms`);
  transitionCover.style.backgroundImage = `url(${img.src})`;
  transitionCover.style.backgroundColor = renderer.background.backgroundColor.toHex()
  transitionCover.style.display = "block";

  const sprite = PIXI.Sprite.from(rt);
  return sprite;
}

export type TransitionCallback = (placeholder: PIXI.DisplayObject) => Promise<void>;

function cleanupTransition() {
  if (!canvasGroup) return;
  canvasGroup.children[1].destroy();
  canvasGroup.alpha = 0;
  if (Array.isArray(canvasGroup.filters) && canvasGroup.filters.length) console.warn("PIXI filters left on transition overlay, please be sure to clean these up when you're done.");
  canvasGroup.filters = [];
}

export async function transitionTo(name: string, callback: TransitionCallback): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      if (!canvasGroup) throw new NotInitializedError();
      const scene = (game as any).scenes.getName(name) as Scene;
      if (!scene) throw new InvalidSceneError(name);

      const sprite = await createSnapshot();
      canvasGroup?.addChild(sprite);

      const loadingBar = document.getElementById("loading");
      if (loadingBar) loadingBar.style.opacity = "0";

      canvasGroup.alpha = 1;
      Hooks.once("canvasReady", () => {
        if (loadingBar) loadingBar.style.removeProperty("opacity");
        if (!canvasGroup) return;
        transitionCover.style.display = "none";
        transitionCover.style.backgroundImage = "";

        if (callback) {
          const res = callback(canvasGroup);
          if (res?.then) res.then(() => { cleanupTransition(); resolve() }).catch(reject);
          else cleanupTransition(); resolve();
        }
      })


      void scene.activate();
    })().then(resolve).catch(reject);
  })
}