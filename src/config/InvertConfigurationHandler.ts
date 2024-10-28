/* eslint-disable @typescript-eslint/no-unused-vars */
import { InvertConfiguration, TransitionConfigHandler } from '../interfaces';

export class InvertConfigurationHandler implements TransitionConfigHandler<InvertConfiguration> {
  key: string = "invert";
  name: string = "BATTLETRANSITIONS.TRANSITIONTYPES.INVERT";
  skipConfig: boolean = true;
  defaultSettings: InvertConfiguration = {};

  renderTemplate(flag?: InvertConfiguration): Promise<string> {
    throw new Error('Method not implemented.');
  }
  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): InvertConfiguration {
    return { ...this.defaultSettings };
  }
  generateSummary(flag?: InvertConfiguration): string {
    return "";
  }

  public validate() { return true; }
}

//TransitionConfigHandler