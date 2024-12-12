import { Migrator } from "../Migrator";
import { StartPlaylistConfiguration } from '../../steps/types';

export class StartPlaylistMigrator extends Migrator<StartPlaylistConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => StartPlaylistConfiguration; } = {};

  public readonly NewestVersion: string = "1.1.0";
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}
