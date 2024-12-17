import { test } from "@playwright/test";
import { downOne } from "docker-compose"
import path from "path";

test("Closing container", async () => {
  await downOne("foundry11", { cwd: path.resolve(__dirname, "../..") });
})