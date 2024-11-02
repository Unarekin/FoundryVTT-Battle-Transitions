import { Migrator } from "../Migrator";
import { SpiralRadialWipeConfiguration } from '../../steps/types';

export class SpiralRadialWipeMigrator extends Migrator<SpiralRadialWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: unknown) => SpiralRadialWipeConfiguration } = {};

  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return (data as any).version as string; }
}