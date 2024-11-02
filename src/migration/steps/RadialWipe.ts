import { Migrator } from "../Migrator";
import { RadialWipeConfiguration } from "../../steps";
import { Easing, RadialDirection } from "../../types";
import { migratev10XBackground } from "../../utils";

export class RadialWipeMigrator extends Migrator<RadialWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => RadialWipeConfiguration; } = {
    "~1.0": v10Migration
  };
  public NewestVersion: string = "1.1.0"

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return (data as any).version as string; }
}

interface V10Config {
  id?: string;
  easing?: string;
  duration: number;
  background: string;
  radial: RadialDirection;
}

function v10Migration(old: V10Config): RadialWipeConfiguration {
  return {
    id: old.id,
    easing: (old.easing ?? "none") as Easing,
    version: "1.1.0",
    radial: old.radial,
    duration: old.duration,
    type: "radialwipe",
    ...migratev10XBackground(old)
  }
}