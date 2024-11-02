import { Migrator } from "../Migrator";
import { VideoConfiguration } from "../../steps";
import { migratev10XBackground } from "../../utils";

export class VideoMigrator extends Migrator<VideoConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => VideoConfiguration; } = {
    "~1.0": v10X
  }

  public NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}

interface v10Configuration {
  file: string;
  background: string;
  volume: number;
  clear?: boolean;
  id?: string;
  easing?: string;
}

function v10X(old: v10Configuration): VideoConfiguration {
  return {
    version: "1.1.0",
    type: "video",
    id: old.id,
    file: old.file,
    volume: old.volume,
    clear: old.clear,
    videoSizingMode: "stretch",
    ...migratev10XBackground(old)
  }
}