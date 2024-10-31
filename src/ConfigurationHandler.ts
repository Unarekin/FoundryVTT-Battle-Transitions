/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvalidSceneError } from "./errors";
import * as tempSteps from "./steps";
import { TransitionStep } from "./steps";
import { localize } from "./utils";
import { AddTransitionStepDialog } from "./dialogs";

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

  static async InjectSceneConfig(app: Application, html: JQuery<HTMLElement>, options: any) {
    if (game.release?.isNewer("12")) await injectV12(app, html, options);
    else await injectV11(app, html, options);
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


async function injectV11(app: Application, html: JQuery<HTMLElement>, options: any) {
  const navElement = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/scene-nav-bar.hbs`, {});
  const navBar = html.find("nav.sheet-tabs.tabs");
  navBar.append(navElement);

  const navContent = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-config.hbs`, {});
  html.find(`button[type="submit"]`).before(`<div class="tab" data-tab="battle-transitions">${navContent}</div>`);
  addMainDialogEventListeners(app, html);
}

async function injectV12(app: Application, html: JQuery<HTMLElement>, options: any) {
  const navElement = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/scene-nav-bar.hbs`, {});
  const navBar = html.find("nav.sheet-tabs.tabs");
  navBar.append(navElement);

  const navContent = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-config.hbs`, {});
  html.find("footer.sheet-footer").before(`<div class="tab" data-group="main" data-tab="battle-transitions">${navContent}</div>`);
  addMainDialogEventListeners(app, html);
}

function addMainDialogEventListeners(app: Application, html: JQuery<HTMLElement>) {
  // Add step dialog
  html.find(`button[data-action="add-step"]`).on("click", e => {
    e.preventDefault();
    void AddTransitionStepDialog.add();
  });

  // Drag-and-drop sorting
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (html.find("#transition-step-list") as any).sortable({
    handle: ".drag-handle",
    containment: "parent",
    axis: "y"
  });


  // Save button
  html.find(`button[type="submit"]`).on("click", () => {
    // Update
  });
}