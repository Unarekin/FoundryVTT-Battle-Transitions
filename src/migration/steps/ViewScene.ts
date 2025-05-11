import { Migrator } from "../Migrator";
import { ViewSceneConfiguration } from "../../steps";

export class ViewSceneMigrator extends Migrator<ViewSceneConfiguration> {
  protected migrationFunctions: { [x: string]: (old: unknown) => ViewSceneConfiguration } = {};

  public readonly NewestVersion: string = "2.0.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}