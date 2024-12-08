/**
 * Quick wrapper to wait for a hook to get called
 * @param {string} hook The hook to await
 * @returns 
 */
export async function awaitHook(hook: string): Promise<unknown[]> {
  return new Promise<unknown[]>(resolve => {
    Hooks.once(hook, (...args: unknown[]) => {
      resolve(args);
    })
  })
}