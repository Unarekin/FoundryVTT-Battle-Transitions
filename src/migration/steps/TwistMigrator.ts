import { TwistConfiguration } from "../../steps";
import { Migrator } from "../Migrator";
import { v115EasingFix } from "./functions";

export class TwistMigrator extends Migrator<TwistConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => TwistConfiguration } = {
    "<=1.1.5": v115EasingFix
  }

  public readonly NewestVersion: string = "1.1.6";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}