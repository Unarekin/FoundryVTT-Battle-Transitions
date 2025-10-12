try {
  const scene = await BattleTransition.SelectScene(true);

  if (!(scene instanceof Scene)) return;

  await new BattleTransition(scene).executeSequence([
    {
      id: "CXflZsftpbjYkm4J",
      type: "sound",
      volume: 44,
      file: "modules/battle-transitions/assets/sfx/boss%20battle%20start.mp3",
      version: "1.1.0",
      label: "",
    },
    {
      id: "Kjzde13zMhk6hUdg",
      type: "wait",
      duration: 500,
      version: "1.1.0",
      label: "",
    },
    {
      id: "tAL81AenmI9Z7S3x",
      type: "hueshift",
      duration: 1000,
      version: "1.1.6",
      maxShift: 0.5,
      easing: "none",
      applyToOverlay: true,
      applyToScene: false,
      label: "",
      dualStyle: "overlay",
    },
    {
      id: "ep0Ss8jWPgmKzvjl",
      type: "wait",
      duration: 500,
      version: "1.1.0",
      label: "",
    },
    {
      id: "FoU1NRWcReTsKCUE",
      type: "startplaylist",
      version: "1.1.0",
    },
    {
      id: "5jzvFDI3pkAzodST",
      type: "wait",
      duration: 500,
      version: "1.1.0",
      label: "",
    },
    {
      id: "Ew85Io2tqQuwZj5c",
      type: "melt",
      duration: 1000,
      version: "1.1.6",
      easing: "none",
      bgSizingMode: "stretch",
      backgroundType: "color",
      backgroundImage: "",
      backgroundColor: "#00000000",
      label: "",
    },
  ]);
} catch (err) {
  console.error(err);
  ui.notifications.error(err.message, { console: false });
}
