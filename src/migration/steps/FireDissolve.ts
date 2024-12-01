import { Migrator } from "../Migrator";
import { FireDissolveConfiguration } from "../../steps";
import { Easing } from "../../types";

export class FireDissolveMigrator extends Migrator<FireDissolveConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => FireDissolveConfiguration; } = {
    "~1.0": v10XMigration
  };
  public NewestVersion: string = "1.1.0";


  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }

}

interface v10XConfig {
  id?: string;
  duration: number;
  easing: Easing;
  burnSize: number;
}

function v10XMigration(old: v10XConfig): FireDissolveConfiguration {
  return {
    id: old.id ?? foundry.utils.randomID(),
    easing: old.easing,
    duration: old.duration,
    burnSize: old.burnSize,
    type: "firedissolve",
    version: "1.1.0"
  }
}