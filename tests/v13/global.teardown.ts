import { test } from "@playwright/test";
import { downOne } from "docker-compose"
import path from "path";
import { exec as tempExec } from "child_process";
import util from "util";

const exec = util.promisify(tempExec);

test("Closing container", async () => {
  await downOne("foundry13", { cwd: path.resolve(__dirname, "../..") });
  await exec("docker system prune --volumes -f");
})