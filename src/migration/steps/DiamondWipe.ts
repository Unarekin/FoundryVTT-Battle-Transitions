import { Migrator } from "../Migrator";
import { AnimatedTransition, DiamondWipeConfiguration } from "../../steps";
import { Easing } from "../../types";
import { migratev10XBackground } from "../../utils";
import { v115EasingFix } from "./functions";

export class DiamondWipeMigrator extends Migrator<DiamondWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => DiamondWipeConfiguration; } = {
    "~1.0": V10X,
    ">=1.1.0 <=1.1.5": v115EasingFix
  };
  public NewestVersion: string = "1.1.6";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}


interface V10XConfig {
  id?: string;
  easing: Easing;
  duration: number;
  size: number;
  background: string;
}

function V10X(old: V10XConfig): DiamondWipeConfiguration {
  return v115EasingFix({
    id: old.id ?? foundry.utils.randomID(),
    type: "diamondwipe",
    version: "1.1.6",
    duration: old.duration,
    size: old.size,
    easing: old.easing,
    ...migratev10XBackground(old)
  } as AnimatedTransition)
}