import { ZoomConfiguration } from '../../steps';
import { Migrator } from '../Migrator';
import { v115EasingFix } from './functions';


export class ZoomMigrator extends Migrator<ZoomConfiguration> {
  protected readonly migrationFunctions: { [x: string]: (old: any) => ZoomConfiguration } = {
    "<=1.1.5": v115EasingFix
  }

  public readonly NewestVersion: string = "1.1.6";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}