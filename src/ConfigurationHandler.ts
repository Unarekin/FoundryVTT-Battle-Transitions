import { SceneConfiguration } from "./interfaces";
import { DataMigration } from "./DataMigration";
import { SceneChangeConfiguration, SceneChangeStep, TransitionConfiguration } from "./steps";
import { SceneConfigV11, SceneConfigV12 } from "./dialogs";
import { BattleTransition } from "./BattleTransition";
import { InvalidSceneError } from "./errors";

export class ConfigurationHandler {
  public static AddToNavigationBar(buttons: any[]) {
    buttons.push(
      {
        name: "BATTLETRANSITIONS.NAVIGATION.TRIGGER",
        icon: `<i class="fas bt-icon fa-fw crossed-swords"></i>`,
        condition: (li: JQuery<HTMLLIElement>) => {
          try {
            const scene = getScene(li);
            if (!scene) return false;

            if (scene.id === canvas?.scene?.id) return false;
            const steps = this.GetSceneTransition(scene) ?? [];
            return Array.isArray(steps) && steps.length;
          } catch (err) {
            ui.notifications?.error((err as Error).message, { console: false });
            console.error(err as Error)
          }
        },
        callback: (li: JQuery<HTMLLIElement>) => {
          const scene = getScene(li);
          if (!scene) throw new InvalidSceneError(typeof li.data("sceneId") === "string" ? li.data("sceneId") as string : typeof li.data("sceneId"));
          const sequence = this.GetSceneTransition(scene) ?? [];
          if (!(Array.isArray(sequence) && sequence.length)) return;

          const sceneChange = new SceneChangeStep({ scene: scene.id ?? "" });
          const step: SceneChangeConfiguration = {
            ...SceneChangeStep.DefaultSettings,
            ...sceneChange.config
          };

          void BattleTransition.executeSequence([
            step,
            ...sequence
          ])
        }
      },
      {
        name: "BATTLETRANSITIONS.NAVIGATION.CUSTOM",
        icon: "<i class='fas fa-fw fa-hammer'></i>",
        condition: (li: JQuery<HTMLLIElement>) => {
          const scene = getScene(li);
          if (!scene) return false;
          return scene.id !== canvas?.scene?.id;
        },
        callback: (li: JQuery<HTMLLIElement>) => {
          const sceneId = li.data("sceneId") as string;
          const scene = game.scenes?.get(sceneId);
          if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId)
          // if (scene.canUserModify(game.user as User, "update"))
          // void ConfigurationHandler.BuildTransition(scene);

        }
      }
    )
  }

  public static SetSceneConfiguration(scene: Scene, config: SceneConfiguration): Promise<Scene | undefined> {
    const newConfig: { [x: string]: unknown } = { ...config };

    const oldFlag = scene.flags[__MODULE_ID__] as object;
    for (const key in oldFlag) {
      if (!Object.keys(newConfig).includes(key)) newConfig[`-=${key}`] = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return (scene as any).update({
      flags: {
        "battle-transitions": newConfig
      }
    });
  }

  public static GetSceneConfiguration(scene: Scene): SceneConfiguration {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const flags = scene.flags[__MODULE_ID__] as any;
    // Check for data migration
    if (DataMigration.SceneConfiguration.NeedsMigration(flags)) return DataMigration.SceneConfiguration.Migrate(flags);
    else return flags as SceneConfiguration;
  }

  public static GetSceneTransition(scene: Scene): TransitionConfiguration[] {
    const config = ConfigurationHandler.GetSceneConfiguration(scene);
    return config.sequence;
  }

  public static async InjectSceneConfig(app: SceneConfig, html: JQuery<HTMLElement>, options: any) {
    const config = ConfigurationHandler.GetSceneConfiguration(app.object);

    if (game.release?.isNewer("12")) await SceneConfigV12.inject(app, html, options, config);
    else await SceneConfigV11.inject(app, html, options, ConfigurationHandler.GetSceneConfiguration(app.object));
  }

  public static BuildTransitionFromForm(html: JQuery<HTMLElement>) {
    const sequence: TransitionConfiguration[] = [];
    html.find("#transition-step-list [data-transition-type]").each((index, element) => {
      const flag = element.dataset.flag ?? "";
      const step = JSON.parse(flag) as TransitionConfiguration;
      sequence.push(step);
    });
    return sequence;
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
