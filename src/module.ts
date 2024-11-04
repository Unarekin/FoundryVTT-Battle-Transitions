/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { initializeCanvas } from './transitionUtils';
import { CUSTOM_HOOKS } from "./constants";
import { registerHelpers, registerTemplates } from "./templates";
import { ConfigurationHandler } from './ConfigurationHandler';

import SocketHandler from "./SocketHandler";
import { BattleTransition } from "./BattleTransition";

import semver from "semver";
import { SceneChangeConfiguration } from './steps';
import { log } from './utils';

(window as any).semver = semver;
(window as any).BattleTransition = BattleTransition;


Hooks.once("canvasReady", () => {
  initializeCanvas();
  Hooks.callAll(CUSTOM_HOOKS.INITIALIZE)
})



Hooks.once("init", async () => {
  registerHelpers();
  await registerTemplates();
});

Hooks.on("renderSceneConfig", (app: SceneConfig, html: JQuery<HTMLElement>, options: any) => {
  void ConfigurationHandler.InjectSceneConfig(app, html, options);
});

Hooks.once("socketlib.ready", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  SocketHandler.register(socketlib.registerModule(__MODULE_ID__));
});

Hooks.on("getSceneNavigationContext", (html: JQuery<HTMLElement>, buttons: any[]) => {
  ConfigurationHandler.AddToNavigationBar(buttons);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("preUpdateScene", (scene: Scene, delta: Partial<Scene>, mod: unknown, userId: string) => {
  if (delta.active) {
    const config = ConfigurationHandler.GetSceneConfiguration(scene);
    if (!config.isTriggered && config.autoTrigger) {
      // Check for ambience sound
      if (scene.playlist?.playing) void scene.playlist.stopAll();
      if (scene.playlistSound && ((scene.playlistSound as any) instanceof PlaylistSound) && (scene.playlistSound as unknown as PlaylistSound).playing)
        void (scene.playlistSound as unknown as PlaylistSound).parent?.stopSound(scene.playlistSound as unknown as PlaylistSound);

      delta.active = false;
      void new BattleTransition(scene).execute({
        caller: game.user?.id ?? "",
        remote: false,
        sequence: [
          { type: "scenechange", scene: scene.id, version: "1.1.0" } as SceneChangeConfiguration,
          ...config.sequence
        ]
      })

    }

  }
});

let IN_TRANSITION: boolean = false;

Hooks.on("preUpdatePlaylist", (playlist: Playlist, delta: Partial<Playlist>) => {
  if (delta.playing) {
    if (IN_TRANSITION) {
      // Trigger after the transition has ended
      Hooks.once(CUSTOM_HOOKS.TRANSITION_END, () => {
        log("Sounds:", delta.sounds);
        if ((delta.sounds as any)?.length) {
          for (const soundDelta of (delta.sounds ?? [])) {
            const sound = playlist.sounds.get(soundDelta._id as string);
            if (sound instanceof PlaylistSound) void sound.parent?.playSound(sound);
          }
        }
      });
      return false;
    } else if (typeof (delta as any).delayed === "undefined") {
      // Delay
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        void (playlist as any).update({
          ...delta,
          delayed: true
        })
      }, 100);

      return false;
    }
  }
});

Hooks.on("preUpdatePlaylistSound", (sound: PlaylistSound, delta: Partial<PlaylistSound>) => {
  if (delta.playing) {

    if (IN_TRANSITION) {
      Hooks.once(CUSTOM_HOOKS.TRANSITION_END, () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        void (sound as any).update({
          ...delta,
          delayed: true
        });
        void sound.parent?.playSound(sound);
      })
      return false;
    } else if (!(delta as any).delayed) {
      log("Delaying");
      setTimeout(() => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        void (sound as any).update({
          ...delta,
          delayed: true
        })
      }, 100);
      return false;
    }

  }
})

Hooks.on(CUSTOM_HOOKS.TRANSITION_START, (...args: unknown[]) => {
  log("Transition start:", args);
  IN_TRANSITION = true;
})

Hooks.on(CUSTOM_HOOKS.TRANSITION_END, (...args: unknown[]) => {
  log("Transition end:", args);
  IN_TRANSITION = false;
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("updateScene", (scene: Scene, delta: Partial<Scene>, mod: unknown, userId: string) => {
  if (delta.active) {
    Hooks.callAll(CUSTOM_HOOKS.SCENE_ACTIVATED, scene);
    if (scene.canUserModify(game.user as User, "update")) void scene.unsetFlag(__MODULE_ID__, "isTriggered");
  }

})