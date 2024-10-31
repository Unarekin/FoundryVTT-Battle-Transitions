/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvalidSceneError } from "./errors";
import { SceneConfiguration } from "./interfaces";
import * as tempSteps from "./steps";
import { TransitionConfiguration, TransitionStep } from "./steps";
import { localize } from "./utils";
import semver from "semver";

const STEPS: (typeof TransitionStep<any>)[] = Object.values(tempSteps).sort((a, b) => localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${a.name}`).localeCompare(localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${b.name}`)));



export class ConfigurationHandler {
  static AddToNavigationBar(buttons: any[]) {
    buttons.push(
      {
        name: "BATTLETRANSITIONS.NAVIGATION.TRIGGER",
        icon: `<i class="fas bt-icon fa-fw crossed-swords"></i>`,
        condition: (li: JQuery<HTMLLIElement>) => {
          try {
            const scene = getScene(li);
            if (!scene) return false;

            if (scene.id === canvas?.scene?.id) return false;

            const steps = (scene.getFlag(__MODULE_ID__, "steps") ?? []) as unknown[];
            if (Array.isArray(steps) && steps.length) return true;
          } catch (err) {
            ui.notifications?.error((err as Error).message, { console: false });
            console.error(err as Error)
          }
        },
        callback: () => { }
      },
      {
        name: "BATTLETRANSITIONS.NAVIGATION.CUSTOM",
        icon: "<i class='fas fa-fw fa-hammer'></i>",
        condition: (li: JQuery<HTMLLIElement>) => {
          const scene = getScene(li);
          if (!scene) return false;
          return scene.id !== canvas?.scene?.id;
        },
        callback: () => { }
      }
    )
  }

  // static GetSceneTransition(scene: Scene): TransitionStep[] {
  //   const steps = scene.getFlag(__MODULE_ID__, "steps");
  //   return []


  // }

  // static async SetSceneTransition(scene: Scene, transition: TransitionStep[]) {
  //   // await (scene as any).setFlag(__MODULE_ID__, "steps", transition);
  // }

  static InjectSceneConfig(app: Application, html: JQuery<HTMLElement>, options: any) {

  }
}



function getScene(li: JQuery<HTMLLIElement>): Scene | undefined {
  const sceneId = li.data("sceneId") as string | undefined;
  if (!sceneId) return undefined;
  if (!sceneId) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
  const scene = game.scenes?.get(sceneId);
  if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
  return scene;
}

function getConfigurationVersion(config: any): string | null {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (typeof config.version === "undefined") return "1.0";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  else if (config.version === "#{VERSION}#") return __MODULE_VERSION__;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
  else return semver.valid(semver.coerce(config.version)) ?? null;
}