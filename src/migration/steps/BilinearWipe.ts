import { Migrator } from "../Migrator";
import { BilinearWipeConfiguration } from "../../steps";
import { BilinearDirection, Easing, RadialDirection } from "../../types";
import { migratev10XBackground } from "../../utils";

export class BilinearWipeMigrator extends Migrator<BilinearWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => BilinearWipeConfiguration; } = {
    "~1.0": V10X
  };
  public NewestVersion: string = "1.1.0";


  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return (data as any).version as string; }
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
  return {
    id: old.id,
    type: "bilinearwipe",
    version: "1.1.0",
    duration: old.duration,
    easing: old.easing,
    direction: old.direction,
    radial: old.radial,
    ...migratev10XBackground(old)
  }
}