try {
  if (!game.user.isGM) return;
  const sounds = game.playlists
    .reduce((prev, curr) => {
      // Limit to only playlists playing on the music channel
      if (!curr.playing || curr.channel !== "music") return prev;

      return [...prev, curr.sounds.contents.filter((sound) => sound.playing)];
    }, [])
    .flat();

  await Promise.all(
    sounds.map((sound) => fadeSound(sound, scope.duration ?? 1000))
  );

  async function wait(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  async function fadeSound(sound, duration) {
    const currVol = sound.volume;
    if (currVol === 0) return;
    await Promise.all([
      sound.sound.fade(0, { duration, from: currVol }),
      wait(duration + 500).then(() => {
        sound.parent.stopAll();
      }),
    ]);
  }
} catch (err) {
  ui.notifications.error(err.message, { localize: true });
}
