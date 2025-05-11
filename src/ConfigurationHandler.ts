import { SceneConfiguration } from "./interfaces";
import { SceneChangeConfiguration, SceneChangeStep, TransitionConfiguration } from "./steps";
import { BattleTransition } from "./BattleTransition";
import { InvalidSceneError, UnableToMigrateError } from "./errors";

import { DataMigration } from "./DataMigration";
import { log } from "./utils";

const DEFAULT_CONFIG: SceneConfiguration = {
  version: "1.1.6",
  autoTrigger: false,
  isTriggered: false,
  sequence: []
};

export class ConfigurationHandler {
  public static AddToNavigationBar(buttons: any[]) {
    log("Adding to navigation bar:", buttons);
    const iconClasses = game?.release?.isNewer("13") ? [] : ["v12"];
    buttons.push(
      {
        name: "BATTLETRANSITIONS.NAVIGATION.TRIGGER",
        icon: `<i class="fas bt-icon fa-fw crossed-swords ${iconClasses.join(" ")}"></i>`,
        condition: (li: JQuery<HTMLLIElement> | HTMLLIElement) => {
          try {
            const scene = getScene(li);
            if (!scene) return false;

            // if (scene.id === game?.scenes?.active?.id) return false;
            return ConfigurationHandler.HasTransition(scene, true);
            // const steps = this.GetSceneTransition(scene) ?? [];
            // return Array.isArray(steps) && steps.length;
          } catch (err) {
            ui.notifications?.error((err as Error).message, { console: false });
            console.error(err as Error)
          }
        },
        callback: (li: JQuery<HTMLLIElement> | HTMLLIElement) => {
          const scene = getScene(li);
          if (!(scene instanceof Scene)) {
            if (li instanceof HTMLLIElement) throw new InvalidSceneError(typeof li.dataset.sceneId === "string" ? li.dataset.sceneId : typeof li.dataset.sceneId);
            else throw new InvalidSceneError(typeof li.data("sceneId") === "string" ? li.data("sceneId") as string : typeof li.data("sceneId"));
          }

          if (!ConfigurationHandler.HasTransition(scene, true)) return;
          const sequence = [...this.GetSceneTransition(scene) ?? []];

          if (scene !== canvas?.scene) {
            const sceneChange = new SceneChangeStep({ scene: scene.id ?? "" });
            const step: SceneChangeConfiguration = {
              ...SceneChangeStep.DefaultSettings,
              id: foundry.utils.randomID(),
              ...sceneChange.config
            };
            sequence.unshift(step);
          }

          void BattleTransition.ExecuteSequence(sequence);
        }
      },
      {
        name: "BATTLETRANSITIONS.NAVIGATION.CUSTOM",
        icon: "<i class='fas fa-fw fa-hammer'></i>",
        condition: (li: JQuery<HTMLLIElement> | HTMLLIElement) => {
          const scene = getScene(li);
          if (!scene) return false;
          // return scene.id !== game?.scenes?.active?.id
          return true;
        },
        callback: (li: JQuery<HTMLLIElement> | HTMLLIElement) => {
          const scene = getScene(li);
          // const sceneId = li.data("sceneId") as string;
          // const scene = game.scenes?.get(sceneId);
          if (!(scene instanceof Scene)) {
            if (li instanceof HTMLLIElement) throw new InvalidSceneError(typeof li.dataset.sceneId === "string" ? li.dataset.sceneId : typeof li.dataset.sceneId);
            else throw new InvalidSceneError(typeof li.data("sceneId") === "string" ? li.data("sceneId") as string : typeof li.data("sceneId"));
          }
          if (scene.canUserModify(game.user as User, "update"))
            void BattleTransition.BuildTransition(scene);
        }
      }
    )
  }

  // public static async MigrateAllScenes() {
  //   const scenesToMigrate = game.scenes?.contents.filter(scene => {
  //     if (!(game.user instanceof User)) return false;
  //     if (!scene.flags[__MODULE_ID__]) return false;
  //     if (!scene.canUserModify(game.user, "update")) return false;
  //     return DataMigration.SceneConfiguration.NeedsMigration(scene.flags[__MODULE_ID__]);
  //   }) ?? [];

  //   if (scenesToMigrate.length) {
  //     await Promise.all(scenesToMigrate.map(scene => ConfigurationHandler.MigrateScene(scene)));
  //     ui.notifications?.info(localize("BATTLETRANSITIONS.INFO.SCENESMIGRATED", { count: scenesToMigrate.length }), { localize: true })
  //   }
  // }


  // public static async MigrateScene(scene: Scene) {
  //   const originalConfig = scene.flags[__MODULE_ID__];
  //   if ((game.user instanceof User) &&
  //     scene.canUserModify(game.user, "update") &&
  //     DataMigration.SceneConfiguration.NeedsMigration(originalConfig)) {
  //     log("Migrating scene:", scene.name, originalConfig);
  //     const newConfig = ConfigurationHandler.GetSceneConfiguration(scene);
  //     log(newConfig);
  //     await ConfigurationHandler.SetSceneConfiguration(scene, newConfig);
  //   }
  // }

  public static SetSceneConfiguration(scene: Scene, config: Partial<SceneConfiguration>): Promise<Scene | undefined> {
    // const newConfig: { [x: string]: unknown } = { ...config };
    const newConfig: Record<string, unknown> = {
      ...DEFAULT_CONFIG,
      ...config
    };

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

  /**
   * Returns whether or not the transition for a given scene should be automatically triggered if it is being activated
   * @param {Scene} scene - {@link Scene}
   * @returns 
   */
  public static ShouldAutoTrigger(scene: Scene): boolean {
    if (!ConfigurationHandler.HasTransition(scene, true)) return false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const flags = scene.flags[__MODULE_ID__] as any;
    if (!flags) return false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (flags.isTriggered || flags.autoTriggered) return false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return !!(flags.autoTrigger || flags.config?.autoTrigger);
  }

  /**
   * Will determine if a given scene has a transition sequence configured
   * @param {Scene} scene - {@link Scene}
   * @param {boolean} [requireSteps=false] - Whether to require that the transition have any actual steps
   * @returns 
   */
  public static HasTransition(scene: Scene, requireSteps: boolean = false): boolean {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const flags = scene.flags[__MODULE_ID__] as any;
    // No flags?  Can't be a sequence
    if (!flags) return false;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (Array.isArray(flags.steps) && requireSteps && flags.steps.length) return true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (Array.isArray(flags.steps) && !requireSteps) return true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (Array.isArray(flags.sequence) && requireSteps && flags.sequence.length) return true;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (Array.isArray(flags.sequence) && !requireSteps) return true;

    return false;
  }

  public static GetSceneConfiguration(scene: Scene): SceneConfiguration {

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const flags = scene.flags[__MODULE_ID__] as any;
    if (!flags) return DEFAULT_CONFIG

    // Check for data migration
    if (DataMigration.SceneConfiguration.NeedsMigration(flags)) {
      log("Migrating scene configuration:", flags);
      const migrated = DataMigration.SceneConfiguration.Migrate(flags);
      if (!migrated) throw new UnableToMigrateError(DataMigration.SceneConfiguration.Version(flags), DataMigration.SceneConfiguration.NewestVersion);
      return migrated;
    } else {
      return flags as SceneConfiguration;
    }
  }

  public static GetSceneTransition(scene: Scene): TransitionConfiguration[] {
    const config = ConfigurationHandler.GetSceneConfiguration(scene);
    return config.sequence;
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


function getScene(li: JQuery<HTMLLIElement> | HTMLLIElement): Scene | undefined {
  const sceneId = (li instanceof HTMLLIElement ? li.dataset.sceneId : li.data("sceneId")) as string | undefined;
  if (!sceneId) return undefined;
  if (!sceneId) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
  const scene = game.scenes?.get(sceneId);
  if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId);
  return scene;
}
