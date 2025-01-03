import { Migrator } from "../Migrator";
import { LoadingTipConfiguration } from "../../steps";

export class LoadingTipMigrator extends Migrator<LoadingTipConfiguration> {
  protected migrationFunctions: { [x: string]: (old: unknown) => LoadingTipConfiguration } = {};
  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}