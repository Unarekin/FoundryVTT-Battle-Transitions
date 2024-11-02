import { Migrator } from "../Migrator";
import { RemoveOverlayConfiguration, TransitionConfiguration } from "../../steps";

export class RemoveOverlayMigrator extends Migrator<RemoveOverlayConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => TransitionConfiguration; } = {
    "~1.0": v10Migration
  }

  public NewestVersion: string = "1.1.0";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return (data as any).version as string; }
}

interface v10Config {
  type: string;
}

function v10Migration(old: v10Config): RemoveOverlayConfiguration {
  return {
    type: old.type,
    version: "1.1.0"
  }
}