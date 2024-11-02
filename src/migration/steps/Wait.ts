import { Migrator } from "../Migrator";
import { WaitConfiguration } from "../../steps";

export class WaitMigrator extends Migrator<WaitConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => WaitConfiguration; } = {
    "~1.0": v10X
  }

  public readonly NewestVersion: string = "1.1.0";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return (data as any).version as string; }
}

interface V10XConfig {
  id?: string;
  easing?: string;
  duration: number;
}

function v10X(old: V10XConfig): WaitConfiguration {
  return {
    type: "wait",
    version: "1.1.0",
    duration: old.duration
  };
}