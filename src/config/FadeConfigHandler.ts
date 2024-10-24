import { TransitionConfigHandler, FadeConfiguration } from '../interfaces';
import { generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';



export class FadeConfigHandler implements TransitionConfigHandler<FadeConfiguration> {

  public get key() { return "fade"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.FADE"; }

  public readonly defaultSettings: FadeConfiguration = {
    duration: 1000,
    background: "#00000000"
  }


  generateSummary(flag: FadeConfiguration): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (flag) return [localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: (flag as any).duration }), (flag as any).background].join("; ");
    else return "";
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
    return {
      ...this.defaultSettings,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "background", "easing")
    }
  }

}