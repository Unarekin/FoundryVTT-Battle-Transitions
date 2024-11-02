import { Migrator } from "../Migrator";
import { SoundConfiguration } from "../../steps";


export class SoundMigrator extends Migrator<SoundConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => SoundConfiguration; } = {
    "~1.0": V10X
  };
  public NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}

interface V10XConfig {
  id: string;
  file: string;
  volume: number;
}

function V10X(old: V10XConfig): SoundConfiguration {
  return {
    id: old.id,
    file: old.file,
    type: "sound",
    version: "1.1.0",
    volume: old.volume,
  }
}