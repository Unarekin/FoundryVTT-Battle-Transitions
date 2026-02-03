import { Migrator } from "../Migrator";
import { LoadingTipConfiguration } from "../../steps";

export class LoadingTipMigrator extends Migrator<LoadingTipConfiguration> {
  protected migrationFunctions: { [x: string]: (old: any) => LoadingTipConfiguration } = {
    "<=1.1.0": v110Migration
  };
  public readonly NewestVersion: string = "2.0.12";

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  public Version(data: unknown): string { return ((data as any).version as string) ?? "1.0.5"; }
}

function v110Migration(old: Record<string, unknown>): LoadingTipConfiguration {
  const config = foundry.utils.deepClone(old) as unknown as LoadingTipConfiguration;

  if (config.source === "rolltable" && !config.table && config.message) {
    config.table = config.message;
    delete config.message;
  }
  config.version = "2.0.12";
  return config;
}