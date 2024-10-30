
import { WaitConfiguration } from "./types";
import { TransitionStep } from "./TransitionStep";

export class WaitStep extends TransitionStep<WaitConfiguration> {
  public readonly template = "wait-config";
  public readonly defaultSettings = {
    type: "wait",
    duration: 0
  }

  execute(): Promise<void> {
    return new Promise<void>(resolve => { setTimeout(resolve, this.config.duration); });
  }
}

// export class WaitStep extends TransitionStep {
//   public readonly key: string = "wait";
//   public readonly name: string = "WAIT";
//   public readonly template: string = "wait-config";

//   public readonly defaultSettings: WaitConfiguration = {
//     type: "wait",
//     duration: 0
//   }

//   public async validateConfig(flag: WaitConfiguration): Promise<boolean | Error> {
//     return Promise.resolve(!!(flag.type === "wait" && flag.duration));
//   }
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   public execute(flag: WaitConfiguration, container: PIXI.Container): Promise<void> {
//     return new Promise<void>(resolve => { setTimeout(resolve, flag.duration) });
//   }
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   public addEventListeners(html: JQuery<HTMLElement>): void { }

//   constructor(duration: number) {
//     super();
//   }
// }