import { promises as fs } from "fs";
import path from "path";
import yoctoSpinner from "yocto-spinner";

let spinner = null;
let db = null;

try {
  spinner = !process.env.GITHUB_ACTIONS
    ? yoctoSpinner({ text: "Downloading db..." }).start()
    : null;
  const dbSource = await fetch(
    "https://raw.githubusercontent.com/jshttp/mime-db/refs/heads/master/db.json"
  );
  db = await dbSource.json();
  if (spinner) spinner.success("Downloaded.");
} catch (err) {
  if (spinner) spinner.error("Download failed.");
  console.error(err);
  process.exit();
}

try {
  if (!db) throw new Error("Database not loaded.");
  spinner = !process.env.GITHUB_ACTIONS
    ? yoctoSpinner({ text: "Writing..." }).start()
    : null;
  const hash = Object.fromEntries(
    Object.entries(db).reduce((prev, [key, value]) => {
      if (value.extensions) {
        return [...prev, ...value.extensions.map((ext) => [ext, key])];
      }
      return prev;
    }, [])
  );

  await fs.writeFile("./src/mime.json", JSON.stringify(hash));
  if (spinner) spinner.success("Done.");
} catch (err) {
  if (spinner) spinner.error("Unable to write database.");
  console.error(err);
  process.exit();
}
