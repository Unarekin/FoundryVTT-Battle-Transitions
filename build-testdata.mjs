import { promises as fs } from "fs";
import path from "path";
import yoctoSpinner from "yocto-spinner";

const files = (await fs.readdir("./src/steps")).filter(
  (file) => !["TransitionStep.ts", "index.ts", "types.ts"].includes(file)
);

const defaults = {};
const defaultsUnprocessed = [];

const categories = {};
const categoriesUnprocessed = [];

const defaultsPattern = /(?<=DefaultSettings:(.*?)){((.|\n)*?)}/g;
const categoryPattern = /(?<=static category(.*?)=(.*?)")(.*?)(?=")/g;

const spinner = yoctoSpinner({ text: "Processing..." }).start();
for (const file of files) {
  const content = (
    await fs.readFile(path.join("./src/steps", file))
  ).toString();

  // Check for default settings
  if (defaultsPattern.test(content)) {
    const match = content.match(defaultsPattern)?.[0];
    try {
      const json = eval(`(${match})`);
      defaults[json.type] = json;

      if (categoryPattern.test(content)) {
        const match = content.match(categoryPattern)?.[0];
        if (match) categories[json.type] = match;
      } else {
        categoriesUnprocessed.push(file);
      }
    } catch (err) {
      defaultsUnprocessed.push(file);
      categoriesUnprocessed.push(file);
    }
  }
}

await fs.writeFile(
  "./tests/data/defaults.json",
  JSON.stringify(defaults, null, 2)
);
await fs.writeFile(
  "./tests/data/categories.json",
  JSON.stringify(categories, null, 2)
);

spinner.success();

if (defaultsUnprocessed.length) {
  console.log(
    `Unable to process default settings from the following files:\n  ${defaultsUnprocessed.join(
      "\n  "
    )}`
  );
}

if (categoriesUnprocessed.length) {
  console.log(
    `Unable to process category from the following files:\n  ${defaultsUnprocessed.join(
      "\n  "
    )}`
  );
}

// import { promises as fs } from "fs";
// import path from "path";

// const files = await fs.readdir("./src/steps");

// const defaults = {};
// const unprocessed = [];

// const defaultsPattern = /(?<=DefaultSettings:(.*?)){((.|\n)*?)}/g;

// for (const file of files) {
//   const content = (
//     await fs.readFile(path.join("./src/steps", file))
//   ).toString();
//   if (defaultsPattern.test(content)) {
//     const match = content.match(defaultsPattern)?.[0];
//     try {
//       const json = eval(`(${match})`);
//       defaults[json.type] = json;
//     } catch (err) {
//       unprocessed.push(file);
//     }
//   }
// }

// await fs.writeFile(
//   "./tests/data/defaults.json",
//   JSON.stringify(defaults, null, 2)
// );
// if (unprocessed.length) {
//   console.log(
//     `Unable to process the following files:\n  ${unprocessed.join("\n  ")}`
//   );
// }
