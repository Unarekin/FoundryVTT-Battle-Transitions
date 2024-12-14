import { ClearEffectsConfiguration } from "../../steps";
import { Migrator } from "../Migrator";

export class ClearEffectsMigrator extends Migrator<ClearEffectsConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => ClearEffectsConfiguration } = {};

  public readonly NewestVersion: string = "1.1.0";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}
