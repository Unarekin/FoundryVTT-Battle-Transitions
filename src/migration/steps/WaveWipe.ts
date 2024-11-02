import { Migrator } from "../Migrator";
import { WaveWipeConfiguration } from '../../steps/types';

export class WaveWipeMigrator extends Migrator<WaveWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: unknown) => WaveWipeConfiguration } = {};
  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}