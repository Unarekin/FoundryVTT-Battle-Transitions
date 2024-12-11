import semver from "semver";
import { InvalidVersionError, MigratorNotFoundError, NewerVersionError } from "../errors";
import { log } from "../utils";

export abstract class Migrator<t> {
  // #region Properties (2)

  protected abstract migrationFunctions: { [x: string]: (old: any) => t };

  public abstract readonly NewestVersion: string;

  // #endregion Properties (2)

  // #region Public Methods (2)

  public Migrate(old: unknown): t {
    log("Migrating:", old);
    const version = this.Version(old);
    if (semver.gt(version, this.NewestVersion)) throw new NewerVersionError(version);
    if (!version) throw new InvalidVersionError(typeof version === "string" ? version : version);

    if (version === this.NewestVersion) return old as t;

    log("Version:", version);

    const knownRanges = Object.keys(this.migrationFunctions);
    const funcKey = knownRanges.find(range => semver.satisfies(version, range));

    // const knownVersions = Object.keys(this.migrationFunctions);
    // const funcKey = semver.maxSatisfying(knownVersions, version);

    log("Versions:", knownRanges);
    log("Key:", funcKey);

    if (typeof funcKey === "string") {
      const migrated = this.migrationFunctions[funcKey](old);
      log("Migrated:", migrated);
      return migrated;
    } else {
      throw new MigratorNotFoundError(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        typeof (old as any).type === "string" ? (old as any).type : typeof (old as any).type,
        version,
        this.NewestVersion
      );
    }
  }

  public NeedsMigration(data: unknown): boolean {
    const version = this.Version(data);
    if (semver.gt(version, this.NewestVersion)) throw new NewerVersionError(version);
    return semver.lt(version, this.NewestVersion);
  }

  // #endregion Public Methods (2)

  // #region Public Abstract Methods (1)

  public abstract Version(data: unknown): string;

  // #endregion Public Abstract Methods (1)
}
