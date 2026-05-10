import { BTTextureLoader } from "interfaces"

export function ScenesMixin(base: typeof foundry.documents.collections.Scenes): typeof foundry.documents.collections.Scenes {
  return class BTScenes extends base {
    preload(sceneId: string, push = false) {
      const loader = foundry.canvas.TextureLoader.loader as BTTextureLoader;
      loader.isPreloading = true;
      const retVal = super.preload(sceneId, push);
      loader.isPreloading = false;

      return retVal;
    }
  }
}
