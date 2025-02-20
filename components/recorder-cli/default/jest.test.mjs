import process from "node:process";
import { platform as getPlatform } from "node:os";
import { spawn } from "child_process";

const { String, Error } = globalThis;

const child = spawn(
  getPlatform() === "win32" ? "npx.cmd" : "npx",
  [
    "jest",
    "--runInBand",
    "--testMatch",
    "**/*.mjs",
    "--",
    "components/recorder-cli/default/__fixture_jest__.mjs",
  ],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_OPTIONS: `--experimental-vm-modules ${
        process.env.NODE_OPTIONS || ""
      }`,
    },
  },
);

child.on("exit", (status, signal) => {
  if (status !== 0) {
    throw new Error(`Exit status ${String(status)}`);
  }
  if (signal !== null) {
    throw new Error(`Kill signal ${signal}`);
  }
});
