import { InvalidTransitionError, StepNotReversibleError } from "../errors";
import { TransitionSequence, PreparedTransitionHash } from "../interfaces";
import { getStepClassByKey, parseConfigurationFormElements, wait } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { ReverseConfiguration, TransitionConfiguration } from "./types";

export class ReverseStep extends TransitionStep<ReverseConfiguration> {
  public static DefaultSettings: ReverseConfiguration = {
    id: "",
    type: "reverse",
    version: "1.1.0",
    delay: 0
  }

  public static category = "technical";
  public static hidden: boolean = false;
  public static icon: string = `<i class="fas fa-fw fa-backward"></i>`;
  public static key: string = "reverse";
  public static name: string = "REVERSE";
  public static template: string = "reverse-config";
  public static skipConfig = false;

  public static from(config: ReverseConfiguration): ReverseStep
  public static from(form: HTMLFormElement): ReverseStep
  public static from(form: JQuery<HTMLFormElement>): ReverseStep
  public static from(arg: unknown): ReverseStep {
    if (arg instanceof HTMLFormElement) return ReverseStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if ((arg as any)[0] instanceof HTMLFormElement) return ReverseStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new ReverseStep(arg as ReverseConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): ReverseStep {
    return new ReverseStep({
      ...ReverseStep.DefaultSettings,
      ...parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "delay")
    });
  }

  public static RenderTemplate(config?: ReverseConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${ReverseStep.template}.hbs`, {
      ...ReverseStep.DefaultSettings,
      ...(config ? config : {})
    });
  }

  public static validate(config: TransitionConfiguration, sequence: TransitionConfiguration[]): TransitionConfiguration | Error {
    const index = sequence.findIndex(step => step.id === config.id);
    if (index < 1) return new InvalidTransitionError("reverse");
    const prev = sequence[index - 1];
    const step = getStepClassByKey(prev.type);
    if (!step) throw new InvalidTransitionError(typeof prev.type === "string" ? prev.type : typeof prev.type);
    if (!step.reversible) throw new StepNotReversibleError(step.key);
    return config;
  }

  public execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> | void {
    const config: ReverseConfiguration = {
      ...ReverseStep.DefaultSettings,
      ...this.config
    }
    const current = prepared.prepared.sequence.findIndex(step => step.config.id === config.id);
    if (current < 1) throw new InvalidTransitionError("reverse");
    const prev = prepared.prepared.sequence[current - 1];
    if (config.delay) return wait(config.delay).then(() => prev.reverse());
    else return prev.reverse();
  }

}