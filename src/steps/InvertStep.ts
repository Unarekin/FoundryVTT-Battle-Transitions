import { InvertFilter } from "../filters";
import { PreparedTransitionHash, TransitionSequence } from "../interfaces";
import { addFilterToScene, removeFilterFromScene } from "../transitionUtils";
import { parseConfigurationFormElements, renderTemplateFunc } from "../utils";
import { generateDualStyleSelectOptions } from "./selectOptions";
import { TransitionStep } from "./TransitionStep";
import { InvertConfiguration } from "./types";

export class InvertStep extends TransitionStep<InvertConfiguration> {
  // #region Properties (6)

  public static DefaultSettings: InvertConfiguration = Object.freeze({
    id: "",
    type: "invert",
    version: "1.1.0",
    applyToOverlay: true,
    applyToScene: false
  });

  public static hidden: boolean = false;
  public static key = "invert";
  public static name = "INVERT";
  public static template = "invert-config";
  public static category = "effect";
  public static icon = "<i class='bt-icon bt-invert fa-fw fas'></i>"

  // #endregion Properties (6)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: InvertConfiguration): Promise<string> {
    return (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/config/${InvertStep.template}.hbs`, {
      ...InvertStep.DefaultSettings,
      ...(config ? config : {}),
      dualStyleSelect: generateDualStyleSelectOptions(),
      dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
    })
  }

  public static from(config: InvertConfiguration): InvertStep
  public static from(form: JQuery<HTMLFormElement>): InvertStep
  public static from(form: HTMLFormElement): InvertStep
  public static from(arg: unknown): InvertStep {
    if (arg instanceof HTMLFormElement) return InvertStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return InvertStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new InvertStep(arg as InvertConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): InvertStep {
    const elem = $(form) as JQuery<HTMLFormElement>;

    const dualStyle = elem.find("#dualStyle").val() as string;
    return new InvertStep({
      ...InvertStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...parseConfigurationFormElements(elem, "id"),
      applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
      applyToScene: dualStyle === "scene" || dualStyle === "both"
    })
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  #sceneFilter: PIXI.Filter | null = null;

  public teardown(): Promise<void> | void {
    if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
    this.#sceneFilter = null;
  }

  public execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): void {
    const config = {
      ...InvertStep.DefaultSettings,
      ...this.config
    };

    if (config.applyToOverlay) {
      const filter = new InvertFilter();
      this.addFilter(container, filter);
    }

    if (config.applyToScene && canvas?.stage) {
      const filter = new InvertFilter();
      addFilterToScene(filter, prepared.prepared);
      this.#sceneFilter = filter;
    }


  }

  // #endregion Public Methods (1)
}