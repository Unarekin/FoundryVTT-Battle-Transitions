import { Migrator } from "../Migrator";
import { VideoConfiguration } from "../../steps";
import { migratev10XBackground } from "../../utils";
import { BackgroundType, SizingMode } from "../../types";

export class VideoMigrator extends Migrator<VideoConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => VideoConfiguration; } = {
    ">= 1.1.0 <=1.1.8": v118,
    "~1.0": v10X
  }

  public NewestVersion: string = "1.1.9";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}


interface v118Configuration {
  id: string;
  type: "video";
  volume: number;
  clear: boolean;
  file: string;
  bgSizingMode: SizingMode;
  backgroundType: BackgroundType;
  backgroundImage: string;
  backgroundColor: string;
  videoSizingMode: SizingMode;
  version: string;
}

function v118(old: v118Configuration): VideoConfiguration {
  return {
    ...old,
    version: "1.1.9",
    chromaKey: [0.05, 0.63, 0.14, 1],
    chromaRange: [0.11, 0.22],
    enableChromaKey: false
  }
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
    version: "1.1.9",
    type: "video",
    id: old.id ?? foundry.utils.randomID(),
    file: old.file,
    volume: old.volume,
    clear: old.clear,
    videoSizingMode: "stretch",
    chromaKey: [0.05, 0.63, 0.14, 1],
    chromaRange: [0.11, 0.22],
    enableChromaKey: false,
    ...migratev10XBackground(old)
  }
}