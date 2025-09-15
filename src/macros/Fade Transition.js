try {
  const scene = await BattleTransition.SelectScene(true);
  if (!(scene instanceof Scene)) return;

  const { fadeIn = 1000, duration = 2000, fadeOut = 1000 } = scope;

  const macro = await fromUuid("Macro.sEHGeD83Dv5POL4P");
  if (macro instanceof Macro) await macro.execute({ duration: 500 });

  await new BattleTransition(scene)
    .fade(fadeIn, "black")
    .wait(duration)
    .startPlaylist()
    .fade(fadeOut)
    .execute();
} catch (err) {
  ui.notifications.error(err.message);
}
