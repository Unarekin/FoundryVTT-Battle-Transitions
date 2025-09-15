try {
  const scene = await BattleTransition.SelectScene(true);
  if (!(scene instanceof Scene)) return;

  await new BattleTransition(scene).executeSequence([
    {
      id: "ZSa4VLg7u2YdjWKH",
      type: "sound",
      volume: 100,
      file: "modules/battle-transitions/assets/sfx/normal battle start.mp3",
    },
    {
      id: "CN8bTlarKfO2WAjV",
      type: "wait",
      duration: 1500,
      version: "1.1.0",
    },
    {
      id: "G5PtzM9F5kOYd5it",
      type: "zoomblur",
      version: "1.1.6",
      duration: 1000,
      maxStrength: 0.5,
      easing: "none",
      innerRadius: 0,
      applyToOverlay: true,
      applyToScene: false,
    },
    {
      id: "qVueES60KdfcVCL8",
      type: "fade",
      duration: 1000,
      version: "1.1.6",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundColor: "#000000FF",
      easing: "none",
      label: "",
      backgroundImage: "",
    },
    {
      id: "ML9eNfkhotGltFJZ",
      type: "startplaylist",
      version: "1.1.0",
    },
    {
      id: "s4amvUsbUHaoxff5",
      type: "wait",
      duration: 1000,
      version: "1.1.0",
    },
    {
      id: "YJxhEYnTj1d59Efb",
      type: "fade",
      duration: 1000,
      version: "1.1.6",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundColor: "#00000000",
      easing: "none",
      label: "",
      backgroundImage: "",
    },
  ]);
} catch (err) {
  console.error(err);
  ui.notifications.error(err.message, { console: false });
}
