import { SceneConfiguration } from "../interfaces";
import { Migrator } from "./Migrator";
import { InvalidTransitionError, UnableToMigrateError } from "../errors";
import { getStepClassByKey } from "../utils";
import { TransitionConfiguration } from "../steps";
import { DataMigration } from "../DataMigration";

const CURRENT_VERSION = "1.1.0";

export class SceneConfigurationMigrator extends Migrator<SceneConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => SceneConfiguration; } = {
    "~1.0": v10X
  }

  public Version(data: unknown): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof (data as any).version === "undefined") return "1.0.5";
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
    sequence: []
  };

  if (Array.isArray(old.steps) && old.steps.length) {
    updated.sequence = old.steps.map(step => {
      const stepClass = getStepClassByKey(step.type);
      if (!stepClass) throw new InvalidTransitionError(typeof step.type === "string" ? step.type : typeof step.class);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const migrator = (DataMigration as any).TransitionSteps[step.type] as Migrator<TransitionConfiguration>;
      if (!migrator) throw new UnableToMigrateError(typeof undefined, __MODULE_VERSION__);
      if (migrator.NeedsMigration(step)) return migrator.Migrate(step);
      else return step;
    }) as TransitionConfiguration[];
  }
  return updated;
}