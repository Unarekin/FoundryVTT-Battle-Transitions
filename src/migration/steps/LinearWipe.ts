import { Migrator } from "../Migrator";
import { AnimatedTransition, LinearWipeConfiguration } from "../../steps";
import { BackgroundType, Easing, SizingMode, WipeDirection } from "../../types";
import { migratev10XBackground } from "../../utils";
import { v115EasingFix } from "./functions";

export class LinearWipeMigrator extends Migrator<LinearWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => LinearWipeConfiguration; } = {
    "~1.0": v10XMigration,
    ">=1.1.0 <=1.1.5": v115Migration,
    ">=1.1.6 <1.2.0": v116Migration
  };

  public NewestVersion: string = "1.2.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}

interface v116Config {
  id: string;
  type: "linearwipe";
  duration: number;
  easing: Easing;
  direction: WipeDirection;
  version: string;
  bgSizingMode: SizingMode;
  backgroundType: BackgroundType;
  backgroundImage: string;
  backgroundColor: string;
}


function v116Migration(old: v116Config): LinearWipeConfiguration {
  return {
    ...old,
    falloff: 0
  }
}

function v115Migration(old: v10XConfig): LinearWipeConfiguration {
  return {
    ...old,
    ...v115EasingFix(old),
    falloff: 0
  }
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
    version: "1.2.0",
    duration: old.duration,
    direction: old.direction,
    easing: old.easing,
    falloff: 0,
    ...migratev10XBackground(old)
  } as AnimatedTransition)
}

