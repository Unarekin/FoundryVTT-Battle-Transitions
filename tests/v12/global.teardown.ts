import { test as teardown } from "@playwright/test";
import { downAll } from "docker-compose";
import { exec as tempExec } from "child_process"
import util from "util";

const exec = util.promisify(tempExec);

teardown("Stop container", async () => {
  await new Promise(resolve => { setTimeout(resolve, 5000) });
  await downAll();
  await exec("docker system prune --volumes -f");
});