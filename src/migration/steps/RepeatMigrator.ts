import { Migrator } from "../Migrator";
import { RepeatConfiguration } from '../../steps/types';

export class RepeatMigrator extends Migrator<RepeatConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => RepeatConfiguration } = {};

  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}
