Hooks.on("init", () => {
  if (!game?.settings) return;

  game.settings.register(__MODULE_ID__, "alwaysHideLoadingBar", {
    name: "BATTLETRANSITIONS.SETTINGS.ALWAYSHIDELOADINGBAR.LABEL",
    hint: "BATTLETRANSITIONS.SETTINGS.ALWAYSHIDELOADINGBAR.HINT",
    config: true,
    scope: "world",
    requiresReload: false,
    type: Boolean,
    default: false
  });
})