import { Migrator } from "../Migrator";
import { InvertConfiguration } from "../../steps";

export class InvertMigrator extends Migrator<InvertConfiguration> {
  protected migrationFunctions: { [x: string]: (old: unknown) => InvertConfiguration } = {};
  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return (data as any).version as string; }
}