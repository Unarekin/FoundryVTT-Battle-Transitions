import path from "path";
import { promises as fs } from "fs";
import semver from "semver";

const STEP_PATH = "src/steps";
const MIGRATOR_PATH = "src/migration/steps";

const stepFiles = await fs.readdir(STEP_PATH);
const migratorFiles = await fs.readdir(MIGRATOR_PATH);

const versionPattern = /(?<=version: ")(.*?)(?=")/gi;
const newestVersionPattern = /(?<=public NewestVersion(.*?)= ")(.*?)(?=")/;

// Parse through steps getting most recent version
const noMigrator = [];
const noDefaultVersion=[];
const noNewestVersion = [];

for (const stepFile of stepFiles) {
  const content = (
    await fs.readFile(path.join(STEP_PATH, stepFile))
  ).toString();
  const match = content.match(versionPattern);
  if (match) {
    const defaultVersion = match[0];
    // const migratorContent = await fs.readFile(path.join(MIGRATOR_PATH, path.substring(path.basename(stepFile, path.extname(stepFile)),))
    const fileName = path.basename(stepFile, path.extname(stepFile));
    const migratorPath = path.join(
      MIGRATOR_PATH,
      fileName.substring(0, fileName.length - 4) + path.extname(stepFile)
    );
    try {
      const migratorContent = (await fs.readFile(migratorPath)).toString();
      const newestMatch = migratorContent.match(newestVersionPattern);
      if (newestMatch) {
        // console.log(stepFile, defaultVersion,newestMatch[0], semver.gt(defaultVersion, newestMatch[0]))
        if (semver.gt(defaultVersion, newestMatch[0])) {
          console.log("Mismatch:", stepFile);
          // console.log(stepFile, defaultVersion, newestMatch[0])
        }
      } else {
        noNewestVersion.push(stepFile);
      }
      
    } catch(err) {
      noMigrator.push(stepFile);
    }
  } else {
    noDefaultVersion.push(stepFile);
  }
}

if (noMigrator.length) {
  console.log(
    "Could not find a migrator for the following files:\n",
    noMigrator.join(", ")
  );
}
