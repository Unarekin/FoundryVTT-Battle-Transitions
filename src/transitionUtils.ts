import { COVER_ID } from "./constants";
import { CanvasNotFoundError, NotInitializedError, InvalidSceneError, InvalidTransitionError } from './errors';
import { awaitHook, getStepClassByKey, log } from "./utils";
import { coerceScene } from "./coercion";
import { TransitionConfiguration } from "./steps";
import { PreparedTransitionSequence } from "./interfaces";
import { BattleTransition } from "./BattleTransition";



// Create cover HTMLElement
const transitionCover = document.createElement("canvas");
transitionCover.style.display = "none";
transitionCover.style.position = "absolute";
transitionCover.style.width = "100%";
transitionCover.style.height = "100%";
transitionCover.style.backgroundRepeat = "no-repeat";
transitionCover.style.pointerEvents = "none";
transitionCover.id = COVER_ID;

document.body.appendChild(transitionCover);


export function createSnapshot() {
  if (!canvas) throw new CanvasNotFoundError();

  if (!(canvas.app?.renderer && canvas?.stage)) throw new NotInitializedError();
  const start = Date.now();
  const renderer = canvas.app.renderer;

  // const coverCanvas = document.createElement("canvas");
  // const ctx = coverCanvas.getContext("2d");
  // if (!ctx) throw new CanvasNotFoundError();

  // Render to RenderTexture for later
  const rt = PIXI.RenderTexture.create({ width: window.innerWidth, height: window.innerHeight });
  if (canvas.scene) {
    renderer.render(canvas.stage, { renderTexture: rt, skipUpdateTransform: true, clear: false });
  } else {
    const graphics = new PIXI.Graphics();
    graphics.beginFill(0x000000);
    graphics.drawRect(0, 0, rt.width, rt.height);
    graphics.endFill();
    renderer.render(graphics, { renderTexture: rt, skipUpdateTransform: true, clear: false });
  }

  const pixels = Uint8ClampedArray.from(renderer.extract.pixels(rt));
  const imageData = new ImageData(pixels, rt.width, rt.height);
  transitionCover.width = rt.width;
  transitionCover.height = rt.height;
  const ctx = transitionCover.getContext("2d");
  if (!ctx) throw new CanvasNotFoundError();
  ctx.putImageData(imageData, 0, 0);
  transitionCover.style.display = "block";

  const duration = Date.now() - start;
  log(`Snapshot duration: ${duration}ms (${duration / 16} frames)`);
  return PIXI.Sprite.from(rt);
}

export function removeFiltersFromScene(sequence: PreparedTransitionSequence) {
  sequence.sceneFilters.forEach(filter => removeFilterFromScene(filter));
}

export function addFilterToScene(filter: PIXI.Filter, sequence: PreparedTransitionSequence) {
  if (Array.isArray(canvas?.environment?.filters)) canvas.environment.filters.push(filter);
  else if (canvas?.environment) canvas.environment.filters = [filter];
  sequence.sceneFilters.push(filter);
}

export function removeFilterFromScene(filter: PIXI.Filter) {
  if (Array.isArray(canvas?.environment?.filters) && canvas.environment.filters.includes(filter)) canvas.environment?.filters?.splice(canvas.environment.filters.indexOf(filter), 1);
  filter.destroy();
}

export function setupTransition(): PIXI.Container {
  // if (!canvasGroup) throw new CannotInitializeCanvasError();
  const snapshot = createSnapshot();
  const container = new PIXI.Container();
  container.width = window.innerWidth;
  container.height = window.innerHeight;
  container.addChild(snapshot);
  // canvasGroup.addChild(container);
  return container;
}

export function cleanupTransition(container?: PIXI.DisplayObject) {
  // Ensure our cover is hidden
  transitionCover.style.display = "none";
  transitionCover.style.backgroundImage = "";
  if (container) {
    if (Array.isArray(container.children) && container.children.length) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const children = [...(container.children ?? [])];
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      for (const child of children) child.destroy();
    }
    container.destroy();
  }

  // // Ensure no scene is set to trigger
  // // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
  // void Promise.all((game.scenes as any).contents.map((scene: any) => scene.unsetFlag(__MODULE_ID__, "autoTriggered")));
}

export function hideLoadingBar() {
  const loadingBar = document.getElementById('loading');
  if (loadingBar) loadingBar.style.opacity = "0";
  BattleTransition.HideLoadingBar = true;
}

export function showLoadingBar() {
  const loadingBar = document.getElementById("loading");
  if (loadingBar) loadingBar.style.removeProperty("opacity");
  BattleTransition.HideLoadingBar = false;
}

export function hideTransitionCover() {
  log("Hiding transition cover");
  transitionCover.style.display = "none";
  transitionCover.style.removeProperty("backgroundImage");
}

export async function activateScene(name: string): Promise<Scene>
export async function activateScene(id: string): Promise<Scene>
export async function activateScene(uuid: string): Promise<Scene>
export async function activateScene(scene: Scene): Promise<Scene>
export async function activateScene(arg: unknown): Promise<Scene> {
  const scene = coerceScene(arg);
  if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : "[Object object]");
  // void scene.activate();

  const shouldAwaitHook = (canvas?.scene?.id !== scene.id);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await (scene as any).setFlag(__MODULE_ID__, "isTriggered", true);


  if (shouldAwaitHook) {
    void scene.activate();
    await awaitHook("canvasReady");
  } else {
    await scene.activate();
  }

  return scene;
}


export function removeFilter(element: PIXI.DisplayObject, filter: PIXI.Filter) {
  if (Array.isArray(element.filters)) {
    const index = element.filters.indexOf(filter);
    if (index !== -1) element.filters.splice(index, 1);
  }
}

export async function sequenceDuration(sequence: TransitionConfiguration[]): Promise<number> {
  let duration: number = 0;
  for (const config of sequence) {
    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);
    if (step.addDurationToTotal) {
      try {
        const res = step.getDuration(config, sequence);
        duration += res instanceof Promise ? await res : res;
      } catch (err) {
        ui.notifications?.error((err as Error).message, { console: false });
        console.error(err);
      }
    }
  }
  return duration;
}
