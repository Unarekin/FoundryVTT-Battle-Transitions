import { Migrator } from "../Migrator";
import { SpiralShutterConfiguration } from '../../steps/types';

export class SpiralRadialWipeMigrator extends Migrator<SpiralShutterConfiguration> {
  protected migrationFunctions: { [x: string]: (old: unknown) => SpiralShutterConfiguration } = {};

  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}