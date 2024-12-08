import { Page } from '@playwright/test';
export async function awaitHook(page: Page, hook: string): Promise<void> {
  return page.evaluate((hook: string) => new Promise(resolve => {
    Hooks.once(hook, () => { resolve(); });
  }), hook)
}
