import { Migrator } from "../Migrator";
import { AnimatedTransition, LinearWipeConfiguration } from "../../steps";
import { Easing, WipeDirection } from "../../types";
import { migratev10XBackground } from "../../utils";
import { v115EasingFix } from "./functions";

export class LinearWipeMigrator extends Migrator<LinearWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => LinearWipeConfiguration; } = {
    "~1.0": v10XMigration,
    ">=1.1.0 <=1.1.5": v115EasingFix
  };

  public NewestVersion: string = "1.1.6";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}


interface v10XConfig {
  id?: string;
  duration: number;
  direction: WipeDirection;
  easing: Easing;
  background: string;
}

function v10XMigration(old: v10XConfig): LinearWipeConfiguration {
  return v115EasingFix({
    id: old.id ?? foundry.utils.randomID(),
    type: "linearwipe",
    version: "1.1.6",
    duration: old.duration,
    direction: old.direction,
    easing: old.easing,
    ...migratev10XBackground(old)
  } as AnimatedTransition)
}

