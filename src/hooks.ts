import { awaitHook, log } from './utils';
import { SceneChangeStep } from './steps';
import { SceneConfigMixin } from "./applications";
import SocketHandler from "./SocketHandler";
import { CUSTOM_HOOKS } from "./constants";
import { registerHelpers, registerTemplates } from "./templates";
import { ConfigurationHandler } from './ConfigurationHandler';
import { BattleTransition } from 'BattleTransition';




Hooks.once("canvasReady", () => {
  BattleTransition.initialize();
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (Hooks as any).callAll(CUSTOM_HOOKS.INITIALIZE)
})

Hooks.once("ready", () => {
  const entries = Object.entries(CONFIG.Scene.sheetClasses.base);
  for (const [key, { cls }] of entries) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const mixed = SceneConfigMixin(cls as any);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    CONFIG.Scene.sheetClasses.base[key].cls = mixed as any;
  }
});

Hooks.once("init", async () => {
  registerHelpers();
  await registerTemplates();

  if (typeof libWrapper === "function") {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-member-access
    libWrapper.register(__MODULE_ID__, "Scene.prototype.update", function (this: Scene, wrapped: Function, ...args: unknown[]) {
      const delta = args[0] as Partial<Scene>;

      if (delta.active && ConfigurationHandler.ShouldAutoTrigger(this)) {
        // const config = ConfigurationHandler.GetSceneConfiguration(this);
        // if (delta.active && config.autoTrigger && config.sequence?.length && !(this.flags[__MODULE_ID__] as any).isTriggered) {
        const config = ConfigurationHandler.GetSceneConfiguration(this);
        delete delta.active;
        const sceneChangeStep = new SceneChangeStep({ scene: this.id ?? "" });
        void BattleTransition.ExecuteSequence([
          {
            ...SceneChangeStep.DefaultSettings,
            id: foundry.utils.randomID(),
            ...sceneChangeStep.config
          },
          ...config.sequence
        ]);
        if (Object.keys(delta).length === 0) return false;
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return wrapped(...args);
    }, "MIXED");

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-member-access
    libWrapper.register(__MODULE_ID__, "TextureLoader.prototype.load", function (this: TextureLoader, wrapped: Function, ...args: unknown[]) {

      if (BattleTransition.HideLoadingBar) {
        const opt = args[1] as Record<string, unknown>;
        opt.displayProgress = false;
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return wrapped(...args);
    });
  }
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
(Hooks as any).once("socketlib.ready", () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  SocketHandler.register(socketlib.registerModule(__MODULE_ID__));
});


Hooks.on("getSceneContextOptions", (app: foundry.applications.ui.SceneNavigation, options: ContextMenu.Entry<HTMLElement>[]) => {
  ConfigurationHandler.AddToNavigationBar(options);
  return options;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("preUpdatePlaylist", (playlist: Playlist, delta: Playlist.UpdateData, options: Playlist.Database.PreUpdateOptions, userId: string) => {
  if (delta.playing && BattleTransition.SuppressSoundUpdates)
    return false;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("preUpdatePlaylistSound", (sound: PlaylistSound, delta: PlaylistSound.UpdateData, options: PlaylistSound.Database.PreUpdateOptions, userId: string) => {
  if (delta.playing && BattleTransition.SuppressSoundUpdates)
    return false;
});


// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
(Hooks as any).on(CUSTOM_HOOKS.TRANSITION_START, (...args: unknown[]) => {
  log("Transition start:", args);
});

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
(Hooks as any).on(CUSTOM_HOOKS.TRANSITION_END, (...args: unknown[]) => {
  log("Transition end:", args);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
Hooks.on("updateScene", (scene: Scene, delta: Scene.UpdateData, options: Scene.Database.UpdateOptions, userId: string) => {
  if (delta.active) {
    if (scene.canUserModify(game.user as User, "update")) {
      void scene.unsetFlag(__MODULE_ID__, "isTriggered");
      void scene.unsetFlag(__MODULE_ID__, "bypassTransition");
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    awaitHook("canvasReady").then(() => { (Hooks as any).callAll(CUSTOM_HOOKS.SCENE_ACTIVATED, scene); }).catch(console.error);
  }
});