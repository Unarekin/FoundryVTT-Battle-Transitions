import { COVER_ID } from "./constants";
import { ScreenSpaceCanvasGroup } from './ScreenSpaceCanvasGroup';
import { CanvasNotFoundError, NotInitializedError, NoCoverElementError, InvalidSceneError, CannotInitializeCanvasError } from './errors';
import { awaitHook, createColorTexture } from "./utils";
import { TransitionStep } from "./types";



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

export async function setupTransition(): Promise<PIXI.DisplayObject> {
  if (!canvasGroup) throw new CannotInitializeCanvasError();
  const snapshot = await createSnapshot();
  const container = new PIXI.Container();

  const bgTexture = createColorTexture(canvas?.app?.renderer.background.backgroundColor ?? "white");
  container.addChild(new PIXI.Sprite(bgTexture));
  container.addChild(snapshot);
  canvasGroup.addChild(container);

  return container;
}

export function cleanupTransition(container: PIXI.DisplayObject) {
  container.destroy();
}

export function hideLoadingBar() {
  const loadingBar = document.getElementById('loading');
  if (loadingBar) loadingBar.style.opacity = "0";
}

export function showLoadingBar() {
  const loadingBar = document.getElementById("loading");
  if (loadingBar) loadingBar.style.removeProperty("opacity");
}

export function hideTransitionCover() {
  transitionCover.style.display = "none";
  transitionCover.style.backgroundImage = "";
}

export async function transitionTo(name: string, callback: TransitionStep): Promise<void>
export async function transitionTo(scene: Scene, callback: TransitionStep): Promise<void>
export async function transitionTo(arg: string | Scene, callback: TransitionStep): Promise<void> {
  const scene = typeof arg === "string" ? (game as Game).scenes?.getName(arg) : arg;
  if (!scene) throw new InvalidSceneError(arg as string);

  const container = await setupTransition();

  // Hide loading bar for transition
  hideLoadingBar();
  void scene.activate();
  // Wait for transition
  await awaitHook("canvasReady");


  showLoadingBar();
  hideTransitionCover();

  await callback(container);
  cleanupTransition(container);
}


