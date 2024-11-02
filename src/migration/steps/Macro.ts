import { Migrator } from "../Migrator";
import { MacroConfiguration } from "../../steps";

export class MacroMigrator extends Migrator<MacroConfiguration> {
  protected migrationFunctions: { [x: string]: (old: unknown) => MacroConfiguration; } = {};

  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}