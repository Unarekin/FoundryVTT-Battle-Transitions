import { Migrator } from "../Migrator";
import { SpotlightWipeConfiguration } from "../../steps";
import { migratev10XBackground } from "../../utils";
import { Easing } from "../../types";

export class SpotlightWipeMigrator extends Migrator<SpotlightWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => SpotlightWipeConfiguration; } = {
    "~1.0": v10X
  };
  public NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return (data as any).version as string; }
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
  return {
    version: "1.1.0",
    type: "spotlightwipe",
    duration: old.duration,
    easing: (old.easing ?? "none") as Easing,
    direction: old.direction,
    radial: old.radial,
    ...migratev10XBackground(old)
  }
}