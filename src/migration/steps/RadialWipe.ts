import { Migrator } from "../Migrator";
import { AnimatedTransition, RadialWipeConfiguration } from "../../steps";
import { Easing, RadialDirection } from "../../types";
import { migratev10XBackground } from "../../utils";
import { v115EasingFix } from "./functions";

export class RadialWipeMigrator extends Migrator<RadialWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => RadialWipeConfiguration; } = {
    "<2.0.0": (old: any) => ({
      falloff: 0,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...v115EasingFix(old),
      version: "2.0.0"
    }),
    "~1.0": v10Migration,
    ">=1.1.0 <=1.1.5": v115EasingFix
  };
  public NewestVersion: string = "2.0.0"

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}

interface V10Config {
  id?: string;
  easing?: string;
  duration: number;
  background: string;
  radial: RadialDirection;
}

function v10Migration(old: V10Config): RadialWipeConfiguration {
  return v115EasingFix({
    id: old.id ?? foundry.utils.randomID(),
    easing: (old.easing ?? "none") as Easing,
    version: "1.1.6",
    radial: old.radial,
    duration: old.duration,
    type: "radialwipe",
    target: [0.5, 0.5],
    ...migratev10XBackground(old)
  } as AnimatedTransition)
}
