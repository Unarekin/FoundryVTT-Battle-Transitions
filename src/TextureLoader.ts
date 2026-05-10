import { BTTextureLoader as IBTTextureLoader } from "interfaces";

let _loadingBarSet = false;

export function TextureLoaderMixin(base: typeof foundry.canvas.TextureLoader): IBTTextureLoader {
  return class BTTextureLoader extends base implements IBTTextureLoader {
    public isPreloading = false;

    public get hideLoadingBar() {
      if (game?.settings?.get(__MODULE_ID__, "alwaysHideLoadingBar")) return true;
      return _loadingBarSet;
    }
    public set hideLoadingBar(val) { _loadingBarSet = val; }

    async load(sources: string[], options?: foundry.canvas.TextureLoader.LoadOptions) {
      const actualOptions = options ?? {};
      if (!this.isPreloading && this.hideLoadingBar)
        actualOptions.displayProgress = false;
      await super.load(sources, actualOptions);
    }

  }
}
