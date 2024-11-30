import { Migrator } from "../Migrator";
import { ClockWipeConfiguration } from "../../steps";
import { ClockDirection, Easing, WipeDirection } from "../../types";
import { migratev10XBackground } from "../../utils";

export class ClockWipeMigrator extends Migrator<ClockWipeConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => ClockWipeConfiguration; } = {
    "~1.0": V10X
  };

  public NewestVersion: string = "1.1.0";


  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }

}


interface V10XConfig {
  id?: string;
  easing: Easing;
  duration: number;
  background: string;
  direction: WipeDirection;
  clockdirection: ClockDirection;
}

function V10X(old: V10XConfig): ClockWipeConfiguration {
  return {
    id: old.id ?? foundry.utils.randomID(),
    type: "clockwipe",
    version: "1.1.0",
    easing: old.easing,
    duration: old.duration,
    direction: old.direction,
    clockDirection: old.clockdirection,
    ...migratev10XBackground(old)
  }
}