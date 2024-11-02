import { SceneConfiguration } from "../interfaces";
import { Migrator } from "./Migrator";
import { InvalidTransitionError } from "../errors";
import { getStepClassByKey } from "../utils";
import { TransitionConfiguration } from "../steps";

const CURRENT_VERSION = "1.1.0";

export class SceneConfigurationMigrator extends Migrator<SceneConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => SceneConfiguration; } = {
    "~1.0": v10X
  }

  public Version(data: unknown): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof (data as any).version === "undefined") return "1.0";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    else return (data as any).version;
  }

  public readonly NewestVersion: string = CURRENT_VERSION;

}

interface V10Config {
  autoTriggered?: boolean;
  config?: {
    autoTrigger?: boolean;
  };
  steps?: {
    type: string,
    [x: string]: unknown
  }[]
}

function v10X(old: V10Config): SceneConfiguration {
  const updated: SceneConfiguration = {
    autoTrigger: old.config?.autoTrigger ?? false,
    version: "1.1.0",
    isTriggered: false,
    overrideSequence: [],
    sequence: []
  };

  if (Array.isArray(old.steps) && old.steps.length) {
    updated.sequence = old.steps.map(step => {
      const stepClass = getStepClassByKey(step.type);
      if (!stepClass) throw new InvalidTransitionError(step.type);
      if (stepClass.NeedsMigration(step)) return stepClass.MigrateConfiguration(step);
      else return step as unknown as TransitionConfiguration;
    });
  }
  return updated;
}