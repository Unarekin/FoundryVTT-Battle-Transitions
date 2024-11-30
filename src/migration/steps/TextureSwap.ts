import { Migrator } from "../Migrator";
import { TextureSwapConfiguration } from "../../steps";
import { isColor } from '../../utils';


export class TextureSwapMigrator extends Migrator<TextureSwapConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => TextureSwapConfiguration; } = {
    "~1.0": v10X
  };
  public readonly NewestVersion: string = "1.1";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}

interface V10Config {
  id?: string;
  easing?: string;
  texture: string;
}

function v10X(old: V10Config): TextureSwapConfiguration {
  return {
    id: old.id ?? foundry.utils.randomID(),
    version: "1.1.0",
    type: "textureswap",
    bgSizingMode: "stretch",
    backgroundImage: old.texture && !(isColor(old.texture)) ? old.texture : "",
    backgroundColor: old.texture && !(isColor(old.texture)) ? "" : old.texture,
    backgroundType: old.texture && !isColor(old.texture) ? "image" : "color",
    applyToOverlay: true,
    applyToScene: false
  }
}