import { Migrator } from "../Migrator";
import { DiamondWipeConfiguration } from "../../steps";
import { Easing } from "../../types";
import { migratev10XBackground } from "../../utils";

export class DiamondWipeMigrator extends Migrator<DiamondWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => DiamondWipeConfiguration; } = {
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
  size: number;
  background: string;
}

function V10X(old: V10XConfig): DiamondWipeConfiguration {
  return {
    id: old.id,
    type: "diamondwipe",
    version: "1.1.0",
    duration: old.duration,
    size: old.size,
    easing: old.easing,
    ...migratev10XBackground(old)
  }
}