import { MeltConfiguration, TransitionConfigHandler } from '../interfaces';
import { generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';

export class MeltConfigHandler implements TransitionConfigHandler<MeltConfiguration> {
  public readonly key = "melt";
  public readonly name = "BATTLETRANSITIONS.TRANSITIONTYPES.MELT";

  public readonly defaultSettings = {
    background: "#00000000",
    duration: 1000
  };

  renderTemplate(flag: MeltConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/melt-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      easingSelect: generateEasingSelectOptions()
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): MeltConfiguration {
    return {
      ...this.defaultSettings,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "background", "easing")
    }
  }

  generateSummary(flag: MeltConfiguration): string {
    if (flag) return [localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: flag.duration }), flag.background].join("; ");
    else return ""
  }

}