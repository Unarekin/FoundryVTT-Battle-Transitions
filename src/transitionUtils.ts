import { COVER_ID } from "./constants";
import { ScreenSpaceCanvasGroup } from './ScreenSpaceCanvasGroup';
import { CanvasNotFoundError, NotInitializedError, NoCoverElementError, InvalidSceneError, CannotInitializeCanvasError, InvalidTransitionError } from './errors';
import { awaitHook, getStepClassByKey } from "./utils";
import { coerceScene } from "./coercion";
import { TransitionConfiguration } from "./steps";
import { PreparedTransitionSequence } from "./interfaces";



// Create cover HTMLElement
const transitionCover = document.createElement("div");
transitionCover.style.display = "none";
transitionCover.style.position = "absolute";
transitionCover.style.width = "100%";
transitionCover.style.height = "100%";
transitionCover.style.backgroundRepeat = "no-repeat";

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

  // const { sceneWidth, sceneHeight } = canvas.scene.dimensions;
  const sceneWidth = window.innerWidth;
  const sceneHeight = window.innerHeight;

  const renderer = canvas.app.renderer;

  const rt = PIXI.RenderTexture.create({ width: sceneWidth, height: sceneHeight });
  // const bgTexture = createColorTexture(renderer.background.backgroundColor.toHex());
  // const bgSprite = new PIXI.Sprite(bgTexture);
  // bgSprite.width = sceneWidth;
  // bgSprite.height = sceneHeight;
  // renderer.render(bgSprite, { renderTexture: rt, skipUpdateTransform: true, clear: false })
  renderer.render(canvas.stage, { renderTexture: rt, skipUpdateTransform: true, clear: true });

  const transitionCover = document.getElementById(COVER_ID) as HTMLImageElement | null;
  if (!transitionCover) throw new NoCoverElementError();

  transitionCover.style.backgroundImage = "";
  const img = await renderer.extract.image(rt);

  const tempCanvas = document.createElement("canvas");
  const ctx = tempCanvas.getContext("2d");
  if (!ctx) throw new CannotInitializeCanvasError();

  tempCanvas.width = img.width;
  tempCanvas.height = img.height;

  ctx.fillStyle = renderer.background.backgroundColor.toHex();
  ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
  ctx.drawImage(img, 0, 0);

  const src = tempCanvas.toDataURL();

  // const img = renderer.extract.canvas(rt) as HTMLCanvasElement;
  transitionCover.style.backgroundImage = `url(${src})`;
  transitionCover.style.backgroundColor = renderer.background.backgroundColor.toHex()
  transitionCover.style.display = "block";

  const sprite = new PIXI.Sprite(rt);
  return sprite;
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

export async function setupTransition(): Promise<PIXI.Container> {
  if (!canvasGroup) throw new CannotInitializeCanvasError();
  const snapshot = await createSnapshot();
  const container = new PIXI.Container();
  container.width = window.innerWidth;
  container.height = window.innerHeight;
  container.addChild(snapshot);
  canvasGroup.addChild(container);
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
}

export function showLoadingBar() {
  const loadingBar = document.getElementById("loading");
  if (loadingBar) loadingBar.style.removeProperty("opacity");
}

export function hideTransitionCover() {
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

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await (scene as any).setFlag(__MODULE_ID__, "isTriggered", true);
  void scene.activate();
  // // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  // void (scene as any).update({
  //   active: true,
  //   flags: {
  //     [__MODULE_ID__]: {
  //       autoTriggered: true
  //     }
  //   }
  // });
  await awaitHook("canvasReady");
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
    const res = step.getDuration(config, sequence);
    duration += res instanceof Promise ? await res : res;
  }
  return duration;
}
