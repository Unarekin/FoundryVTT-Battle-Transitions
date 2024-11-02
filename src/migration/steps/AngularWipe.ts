import { Migrator } from '../Migrator';
import { AngularWipeConfiguration } from '../../steps/types';

export class AngularWipeMigrator extends Migrator<AngularWipeConfiguration> {

  protected migrationFunctions: { [x: string]: (old: unknown) => AngularWipeConfiguration } = {}
  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return (data as any).version as string; }

}