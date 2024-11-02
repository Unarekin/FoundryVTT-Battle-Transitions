import { Migrator } from "../Migrator"
import { ParallelConfiguration } from "../../steps"

export class ParallelMigrator extends Migrator<ParallelConfiguration> {
  protected migrationFunctions: { [x: string]: (old: unknown) => ParallelConfiguration; } = {};

  public readonly NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return (data as any).version as string; }
}