import { Page } from '@playwright/test';

export async function awaitHook(page: Page, hook: string): Promise<void> {
  return page.evaluate((hook: string) => new Promise(resolve => {
    Hooks.once(hook, () => { resolve(); });
  }), hook)
}

export async function configureScene(page: Page, name: string) {
  console.log("Configuring:", name);
  await page.evaluate((name: string) => {
    const scene = game.scenes?.getName(name);
    console.log("Scene:", scene);
    if (scene) scene.sheet?.render(true);
  }, name)
}

export async function activateScene(page: Page, name: string) {
  await page.evaluate(async () => {
    const scene = game?.scenes?.getName(name);
    if (!scene) throw new Error(`Unknown scene: ${name}`);
    if (canvas?.scene?.id !== scene.id) {
      void scene.activate();
      await awaitHook(page, "canvasReady");
    } else {
      await scene.activate();
    }
  });
}


export async function getSceneFlag<t = any>(page: Page, name: string, flag: string): Promise<t> {
  return page.evaluate<t, string[]>(([name, flag]) => {
    const scene = game?.scenes?.getName(name);
    if (!scene) throw new Error(`Unknown scene: ${name}`);
    return (scene as any).getFlag("battle-transitions", flag);

  }, [name, flag]);
}

export async function isGameReady(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return !!game?.ready;
  });
}