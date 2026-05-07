import { ConfigurationHandler } from "ConfigurationHandler";
import { SceneConfiguration, BTScene as BTSceneInterface } from "interfaces";
import { TransitionConfiguration } from "steps";

export function SceneMixin(base: typeof Scene): typeof Scene {
  return class BTScene extends base implements BTSceneInterface {
    public get battleTransitionConfiguration(): SceneConfiguration { return ConfigurationHandler.GetSceneConfiguration(this); }
    public get battleTransition(): TransitionConfiguration[] { return ConfigurationHandler.GetSceneTransition(this); }
    public get hasBattleTransition(): boolean { return ConfigurationHandler.HasTransition(this); }
  }
}