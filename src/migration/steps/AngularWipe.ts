import { Migrator } from '../Migrator';
import { AngularWipeConfiguration } from '../../steps/types';
import { v115EasingFix } from "./functions";

export class AngularWipeMigrator extends Migrator<AngularWipeConfiguration> {

  protected migrationFunctions: { [x: string]: (old: any) => AngularWipeConfiguration } = {
    "<=1.1.5": (old: any) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...v115EasingFix(old),
      version: "1.1.6"
    })
  }
  public readonly NewestVersion: string = "1.1.6";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }

}
