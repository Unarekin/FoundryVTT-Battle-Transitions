import { SceneConfiguration } from "./interfaces";
import { DataMigration } from "./DataMigration";
import { SceneChangeConfiguration, SceneChangeStep, TransitionConfiguration } from "./steps";
import { SceneConfigV11, SceneConfigV12 } from "./dialogs";
import { BattleTransition } from "./BattleTransition";
import { InvalidSceneError } from "./errors";
import { localize, log } from "./utils";

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

            if (scene.id === game?.scenes?.active?.id) return false;
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
            id: foundry.utils.randomID(),
            ...sceneChange.config
          };

          void BattleTransition.ExecuteSequence([
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
          return scene.id !== game?.scenes?.active?.id
        },
        callback: (li: JQuery<HTMLLIElement>) => {
          const sceneId = li.data("sceneId") as string;
          const scene = game.scenes?.get(sceneId);
          if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof sceneId === "string" ? sceneId : typeof sceneId)
          if (scene.canUserModify(game.user as User, "update"))
            void BattleTransition.BuildTransition(scene);

        }
      }
    )
  }

  public static async MigrateAllScenes() {
    const scenesToMigrate = game.scenes?.contents.filter(scene => {
      if (!(game.user instanceof User)) return false;
      if (!scene.flags[__MODULE_ID__]) return false;
      if (!scene.canUserModify(game.user, "update")) return false;
      return DataMigration.SceneConfiguration.NeedsMigration(scene.flags[__MODULE_ID__]);
    }) ?? [];

    if (scenesToMigrate.length) {
      await Promise.all(scenesToMigrate.map(scene => ConfigurationHandler.MigrateScene(scene)));
      ui.notifications?.info(localize("BATTLETRANSITIONS.INFO.SCENESMIGRATED", { count: scenesToMigrate.length }), { localize: true })
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  public static async MigrateScene(scene: Scene) {
    const originalConfig = scene.flags[__MODULE_ID__];
    if ((game.user instanceof User) &&
      scene.canUserModify(game.user, "update") &&
      DataMigration.SceneConfiguration.NeedsMigration(originalConfig)) {
      log("Migrating scene:", scene.name, originalConfig);
      const newConfig = ConfigurationHandler.GetSceneConfiguration(scene);
      await ConfigurationHandler.SetSceneConfiguration(scene, newConfig);
    }
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
    if (!flags) {
      return {
        autoTrigger: false,
        version: DataMigration.SceneConfiguration.NewestVersion,
        sequence: []
      }
    }
    try {
      // Check for data migration
      if (DataMigration.SceneConfiguration.NeedsMigration(flags)) {
        const migrated = DataMigration.SceneConfiguration.Migrate(flags);
        if (!migrated) return {
          autoTrigger: false,
          version: DataMigration.SceneConfiguration.NewestVersion,
          sequence: []
        };
      } else {
        return flags as SceneConfiguration;
      }
    } catch (err) {
      ui.notifications?.error((err as Error).message, { console: false, localize: true });
      console.error(err);
    }
    return {
      autoTrigger: false,
      version: DataMigration.SceneConfiguration.NewestVersion,
      sequence: []
    }
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
