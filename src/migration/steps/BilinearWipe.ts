import { Migrator } from "../Migrator";
import { AnimatedTransition, BilinearWipeConfiguration } from "../../steps";
import { BilinearDirection, Easing, RadialDirection } from "../../types";
import { migratev10XBackground } from "../../utils";
import { v115EasingFix } from "./functions";

export class BilinearWipeMigrator extends Migrator<BilinearWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => BilinearWipeConfiguration; } = {
    "~1.0": V10X,
    ">=1.1.0 <=1.1.5": (old: any) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...v115EasingFix(old),
      version: "1.1.6"
    })
  };
  public NewestVersion: string = "1.1.6";


  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}

interface V10XConfig {
  id?: string;
  easing: Easing;
  duration: number;
  direction: BilinearDirection;
  radial: RadialDirection;
  background: string;
}

function V10X(old: V10XConfig): BilinearWipeConfiguration {
  return v115EasingFix({
    id: old.id ?? foundry.utils.randomID(),
    type: "bilinearwipe",
    version: "1.1.6",
    duration: old.duration,
    easing: old.easing,
    direction: old.direction,
    radial: old.radial,
    ...migratev10XBackground(old)
  } as AnimatedTransition)
}