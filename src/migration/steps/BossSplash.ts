import { Migrator } from "../Migrator";
import { BossSplashConfiguration } from "../../steps";

export class BossSplashMigrator extends Migrator<BossSplashConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => BossSplashConfiguration } = {

  };

  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}
