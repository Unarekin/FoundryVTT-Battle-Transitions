import { ReverseConfiguration } from "../../steps";
import { Migrator } from "../Migrator";

export class ReverseMigrator extends Migrator<ReverseConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => ReverseConfiguration } = {};
  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }

}

// import { RestoreOverlayConfiguration } from "../../steps";

// export class RestoreOverlayMigrator extends Migrator<RestoreOverlayConfiguration> {
//   protected migrationFunctions: { [x: string]: (old: unknown) => RestoreOverlayConfiguration } = {};
//   public readonly NewestVersion: string = "1.1.0";

//   // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
//   public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
// }