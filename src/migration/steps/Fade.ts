import { Migrator } from "../Migrator";
import { AnimatedTransition, FadeConfiguration } from "../../steps";
import { Easing } from '../../types';
import { migratev10XBackground } from "../../utils";
import { v115EasingFix } from "./functions";

export class FadeMigrator extends Migrator<FadeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => FadeConfiguration; } = {
    "~1.0": V10X,
    ">=1.1.0 <=1.1.5": v115EasingFix
  }
  public NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}

interface V10XConfig {
  id?: string;
  easing: Easing;
  duration: number;
  background: string;
}

function V10X(old: V10XConfig): FadeConfiguration {
  return v115EasingFix({
    id: old.id ?? foundry.utils.randomID(),
    easing: old.easing,
    duration: old.duration,
    type: "fade",
    version: "1.1.0",
    ...migratev10XBackground(old)
  } as AnimatedTransition)
}