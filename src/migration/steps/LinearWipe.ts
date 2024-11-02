import { Migrator } from "../Migrator";
import { LinearWipeConfiguration } from "../../steps";
import { Easing, WipeDirection } from "../../types";
import { migratev10XBackground } from "../../utils";

export class LinearWipeMigrator extends Migrator<LinearWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => LinearWipeConfiguration; } = {
    "~1.0": v10XMigration
  };

  public NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return (data as any).version as string; }
}


interface v10XConfig {
  id?: string;
  duration: number;
  direction: WipeDirection;
  easing: Easing;
  background: string;
}

function v10XMigration(old: v10XConfig): LinearWipeConfiguration {
  return {
    id: old.id,
    type: "linearwipe",
    version: "1.1.0",
    duration: old.duration,
    direction: old.direction,
    easing: old.easing,
    ...migratev10XBackground(old)
  }
}