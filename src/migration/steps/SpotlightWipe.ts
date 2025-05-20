import { Migrator } from "../Migrator";
import { AnimatedTransition, SpotlightWipeConfiguration } from "../../steps";
import { migratev10XBackground } from "../../utils";
import { Easing } from "../../types";
import { v115EasingFix } from "./functions";

export class SpotlightWipeMigrator extends Migrator<SpotlightWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => SpotlightWipeConfiguration; } = {
    "<2.0.0": (old: any) => ({
      ...({ falloff: 0 }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...v115EasingFix(old),
      version: "2.0.0"
    }),
    "~1.0": v10X,
    ">=1.1.0 <=1.1.5": (old: any) => ({
      ...({ falloff: 0 }),
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...v115EasingFix(old),
      version: "1.1.6"
    })
  };
  public NewestVersion: string = "2.0.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}



interface V10XConfig {
  duration: number;
  direction: "top" | "left" | "bottom" | "right";
  radial: "inside" | "outside";
  background: string;
  id?: string;
  easing?: string;
}

function v10X(old: V10XConfig): SpotlightWipeConfiguration {
  return v115EasingFix({
    id: old.id ?? foundry.utils.randomID(),
    version: "1.1.6",
    type: "spotlightwipe",
    duration: old.duration,
    easing: (old.easing ?? "none") as Easing,
    direction: old.direction,
    radial: old.radial,
    ...migratev10XBackground(old)
  } as AnimatedTransition)
}
