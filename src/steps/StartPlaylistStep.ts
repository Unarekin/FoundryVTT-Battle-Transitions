import { TransitionStep } from "./TransitionStep";
import { TransitionSequence } from "../interfaces";
import { SceneChangeConfiguration, StartPlaylistConfiguration } from "./types";
import { InvalidSceneError, NotImplementedError } from "../errors";
import { log, parseConfigurationFormElements } from "../utils";
import { SceneChangeStep } from "./SceneChangeStep";
import { BattleTransition } from "../BattleTransition";

export class StartPlaylistStep extends TransitionStep<StartPlaylistConfiguration> {
  public static readonly template = "";
  public static hidden: boolean = false;
  public static skipConfig: boolean = true;

  public static key = "startplaylist";
  public static name = "STARTPLAYLIST";

  public static DefaultSettings: StartPlaylistConfiguration = {
    type: "startplaylist",
    version: "1.1.0"
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static RenderTemplate(config?: StartPlaylistConfiguration): Promise<string> {
    throw new NotImplementedError();
  }

  public static from(config: StartPlaylistConfiguration): StartPlaylistStep
  public static from(form: JQuery<HTMLFormElement>): StartPlaylistStep
  public static from(form: HTMLFormElement): StartPlaylistStep
  public static from(arg: unknown): StartPlaylistStep {
    if (arg instanceof HTMLFormElement) return StartPlaylistStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return StartPlaylistStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new StartPlaylistStep(arg as StartPlaylistConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): StartPlaylistStep {
    return new StartPlaylistStep({
      ...StartPlaylistStep.DefaultSettings,
      ...parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id")
    });
  }

  async prepare(sequence: TransitionSequence): Promise<void> {
    const sceneChanges = sequence.sequence.filter(step => step.type === "scenechange");
    for (const step of sceneChanges) {
      const config = step as SceneChangeConfiguration;
      const scene = game.scenes?.get(config.scene);
      if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof config.scene === "string" ? config.scene : typeof config.scene);
      if (scene.playlist) {
        if (scene.playlistSound) {
          const sound = typeof scene.playlistSound === "string" ? scene.playlist.sounds.get(scene.playlistSound) : (scene.playlistSound as PlaylistSound);
          log("Preloading;", sound);
          if (sound) await sound.load();
        } else {
          const firstId = scene.playlist.playbackOrder[0];
          const sound = scene.playlist.sounds.get(firstId);
          log("Preloading:", sound);
          if (sound) await sound.load();
        }
      }


    }
  }

  public execute(container: PIXI.Container, sequence: TransitionSequence): void {
    log("Executing StartPlaylistStep")
    BattleTransition.SuppressSoundUpdates = false;

    const sceneChange = sequence.sequence.reduce((prev, curr) => curr instanceof SceneChangeStep ? curr : prev) as SceneChangeConfiguration;
    if (!sceneChange) throw new InvalidSceneError(typeof sceneChange);
    const scene = game.scenes?.get(sceneChange.scene) as Scene;
    if (!(scene instanceof Scene)) throw new InvalidSceneError(sceneChange.scene);
    if (!scene.canUserModify(game.user as User, "update")) return;
    if (scene.playlist && !scene.playlistSound) {
      // Playlist only
      switch (scene.playlist.mode) {
        case CONST.PLAYLIST_MODES.SEQUENTIAL:
        case CONST.PLAYLIST_MODES.SHUFFLE:
          if (scene.playlist.playbackOrder.length) {
            const sound = scene.playlist.sounds.get(scene.playlist.playbackOrder[0]);
            if (sound) void scene.playlist.playSound(sound);
          }
          break;
        case CONST.PLAYLIST_MODES.SIMULTANEOUS:
          void scene.playlist.playAll();
          break;
      }
    } else if (scene.playlist && ((scene.playlistSound as any) instanceof PlaylistSound)) {
      // Specific sound, easy peasy
      void scene.playlist.playSound(scene.playlistSound as unknown as PlaylistSound);
    }

  }

}