import { Migrator } from "../Migrator";
import { AnimatedTransition, FireDissolveConfiguration } from "../../steps";
import { Easing } from "../../types";
import { v115EasingFix } from "./functions";

export class FireDissolveMigrator extends Migrator<FireDissolveConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => FireDissolveConfiguration; } = {
    "~1.0": v10XMigration,
    ">=1.1.0 <=1.1.5": v115EasingFix
  };
  public NewestVersion: string = "1.1.6";


  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }

}

interface v10XConfig {
  id?: string;
  duration: number;
  easing: Easing;
  burnSize: number;
}

function v10XMigration(old: v10XConfig): FireDissolveConfiguration {
  return v115EasingFix({
    id: old.id ?? foundry.utils.randomID(),
    easing: old.easing,
    duration: old.duration,
    burnSize: old.burnSize,
    type: "firedissolve",
    version: "1.1.0"
  } as AnimatedTransition)
}