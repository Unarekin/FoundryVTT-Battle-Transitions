import { InvalidSceneError, InvalidTransitionError } from './errors';
import { awaitHook, getStepClassByKey } from "./utils";
import { coerceScene } from "./coercion";
import { TransitionConfiguration } from "./steps";
import { PreparedTransitionSequence } from "./interfaces";
import { BattleTransition } from "./BattleTransition";





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
