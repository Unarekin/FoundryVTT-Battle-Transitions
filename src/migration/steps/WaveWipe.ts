import { Migrator } from "../Migrator";
import { WaveWipeConfiguration } from '../../steps/types';
import { v115EasingFix } from "./functions";

export class WaveWipeMigrator extends Migrator<WaveWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => WaveWipeConfiguration } = {
    "<2.0.0": (old: any) => ({
      ...({ falloff: 0 }),  // This is entirely to trick TSC
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...v115EasingFix(old),
      version: "2.0.0"
    }),
    "<=1.1.5": (old: any) => ({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ...v115EasingFix(old),
      version: "1.1.6"
    })
  };
  public readonly NewestVersion: string = "2.0.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}
