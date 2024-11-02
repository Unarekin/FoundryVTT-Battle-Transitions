import { Migrator } from "../Migrator";
import { SceneChangeConfiguration } from "../../steps";

export class SceneChangeMigrator extends Migrator<SceneChangeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: unknown) => SceneChangeConfiguration } = {};

  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return (data as any).version as string; }
}