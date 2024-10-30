import { BattleTransition } from "../BattleTransition";
import { TransitionStep } from "./TransitionStep";
import { SceneChangeConfiguration } from "./types";

export class SceneChangeStep extends TransitionStep<SceneChangeConfiguration> {
  public key: string;
  public name: string;
  public template: string;
  public defaultSettings: SceneChangeConfiguration;
  public validateConfig(flag: SceneChangeConfiguration): Promise<boolean | Error> {
    throw new Error("Method not implemented.");
  }
  public execute(flag: SceneChangeConfiguration, container: PIXI.Container): Promise<void> {
    throw new Error("Method not implemented.");
  }
  public addEventListeners(html: JQuery<HTMLElement>): void {
    throw new Error("Method not implemented.");
  }
  public addToSequence(transition: BattleTransition, ...args: unknown[]): BattleTransition {
    throw new Error("Method not implemented.");
  }

}