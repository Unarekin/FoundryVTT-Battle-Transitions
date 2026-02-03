import { SceneConfiguration } from "../interfaces";
import { Migrator } from "./Migrator";
import { InvalidTransitionError, MigratorNotFoundError } from "../errors";
import { getStepClassByKey } from "../utils";
import { TransitionConfiguration } from "../steps";
import { DataMigration } from "../DataMigration";

const CURRENT_VERSION = "1.1.6";

export class SceneConfigurationMigrator extends Migrator<SceneConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => SceneConfiguration; } = {
    "~1.0": v10X,
    "<=1.1.5": v115
  }

  public Version(data: unknown): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof (data as any).version === "undefined") return "1.0.5";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
    else return (data as any).version;
  }

  public readonly NewestVersion: string = CURRENT_VERSION;

  public Migrate(old: unknown): SceneConfiguration | undefined {
    const migrated = super.Migrate(old);
    if (!migrated) {
      const newConfig = foundry.utils.deepClone(old) as SceneConfiguration;
      newConfig.sequence = this.MigrateSequence(newConfig.sequence);
      return newConfig;
    } else {
      return migrated;
    }
  }

  public MigrateSequence(sequence: any[]): TransitionConfiguration[] {
    return sequence.map(item => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const stepClass = getStepClassByKey(item.type);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      if (!stepClass) throw new InvalidTransitionError(typeof item.type === "string" ? item.type : typeof item.type);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const migrator = (DataMigration.TransitionSteps as any)[stepClass.key] as Migrator<TransitionConfiguration>;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      if (!migrator) throw new MigratorNotFoundError(typeof item.type === "string" ? item.type : typeof item.type, typeof undefined, typeof undefined);
      return migrator.NeedsMigration(item) ? migrator.Migrate(item) : item as TransitionConfiguration;
    }) as TransitionConfiguration[];
  }
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

interface V115Config {
  autoTrigger: boolean;
  sequence: TransitionConfiguration[];
  version: string;
  isTriggered?: boolean;
}

function v115(old: V115Config): SceneConfiguration {
  return {
    ...old,
    sequence: migrateSequence(old.sequence),
    version: "1.1.6"
  }
}

function v10X(old: V10Config): SceneConfiguration {
  return {
    autoTrigger: old.config?.autoTrigger ?? false,
    version: "1.1.6",
    isTriggered: false,
    sequence: migrateSequence(old.steps as any[])
  } as SceneConfiguration;
}

function migrateSequence(sequence: any[]): TransitionConfiguration[] {
  if (Array.isArray(sequence)) {
    if (!sequence.length) return [];
    return sequence.map(step => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      const stepClass = getStepClassByKey(step.type);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      if (!stepClass) throw new InvalidTransitionError(typeof step.type === "string" ? step.type : typeof step.class);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const migrator = (DataMigration as any).TransitionSteps[step.type] as Migrator<TransitionConfiguration>;
      if (!migrator) throw new MigratorNotFoundError(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        typeof step.type === "string" ? step.type : typeof step.type,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        typeof step.version === "string" ? step.version : typeof step.version,
        CURRENT_VERSION);
      // if (!migrator) throw new UnableToMigrateError(typeof undefined, __MODULE_VERSION__);
      if (migrator.NeedsMigration(step)) return migrator.Migrate(step);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      else return step;
    }) as TransitionConfiguration[];

  } else {
    return []
  }
}