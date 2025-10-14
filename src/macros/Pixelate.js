try {
  const scene = await BattleTransition.SelectScene(true);
  if (!(scene instanceof Scene)) return;

  await new BattleTransition(scene)
    .parallel(
      (seq) => seq.pixelate(100, 1000, "none", 2).reverse(),
      (seq) => seq.wait(1000).hideOverlay()
    )
    .execute();
} catch (err) {
  ui.notifications.error(err.message);
}
