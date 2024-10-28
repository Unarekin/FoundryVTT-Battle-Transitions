import { TransitionConfigHandler, FadeConfiguration } from '../interfaces';
import { BackgroundType } from '../types';
import { formatBackgroundSummary, generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';



export class FadeConfigHandler implements TransitionConfigHandler<FadeConfiguration> {

  public get key() { return "fade"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.FADE"; }

  public readonly defaultSettings: FadeConfiguration = {
    duration: 1000,
    backgroundType: "color" as BackgroundType,
    backgroundImage: "",
    backgroundColor: "#00000000"
  }


  generateSummary(flag: FadeConfiguration): string {
    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: flag.duration }),
      formatBackgroundSummary(flag)
    ].filter(val => !!val).join(": ");
  }

  renderTemplate(flag?: FadeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/fade-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      easingSelect: generateEasingSelectOptions()
    }
    );
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): FadeConfiguration {
    const backgroundImage = $(html).find("form #backgroundImage").val() as string ?? "";
    return {
      ...this.defaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "easing", "backgroundType", "backgroundColor")
    }
  }

}