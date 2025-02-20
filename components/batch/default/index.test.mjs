import { cwd, env, platform } from "node:process";
import { assertReject } from "../../__fixture__.mjs";
import { EventEmitter } from "events";
import {
  createConfiguration,
  extendConfiguration,
} from "../../configuration/index.mjs";
import { convertPathToFileUrl } from "../../path/index.mjs";
import { mainAsync } from "./index.mjs";

const { setTimeout } = globalThis;

const cwd_url = convertPathToFileUrl(cwd());

const configuration = extendConfiguration(
  createConfiguration("protocol://host/home"),
  {
    "command-options": { shell: false },
  },
  cwd_url,
);

// no child
{
  const emitter = new EventEmitter();
  emitter.env = env;
  await mainAsync(emitter, configuration);
}

// throw
{
  const emitter = new EventEmitter();
  emitter.env = env;
  await assertReject(
    mainAsync(
      emitter,
      extendConfiguration(
        configuration,
        {
          command: ["MISSING-EXECUTABLE"],
        },
        cwd_url,
      ),
    ),
    platform === "win32"
      ? /^ExternalAppmapError: Could not locate executable$/u
      : /^ExternalAppmapError: Failed to spawn child process$/u,
  );
}

// single killed child
{
  const emitter = new EventEmitter();
  emitter.env = env;
  setTimeout(() => {
    emitter.emit("SIGINT");
  }, 0);
  await mainAsync(
    emitter,
    extendConfiguration(
      configuration,
      {
        scenario: "^",
        scenarios: {
          key: { command: ["node", "--eval", `setTimeout(() => {}, 5000)`] },
        },
      },
      cwd_url,
    ),
  );
}

// single child
{
  const emitter = new EventEmitter();
  emitter.env = env;
  await mainAsync(
    emitter,
    extendConfiguration(
      configuration,
      {
        recorder: "process",
        scenario: "^",
        scenarios: {
          key: {
            command: ["node", "--eval", `"success";`],
          },
        },
      },
      cwd_url,
    ),
  );
}

// multiple child
{
  const emitter = new EventEmitter();
  emitter.env = env;
  await mainAsync(
    emitter,
    extendConfiguration(
      configuration,
      {
        recorder: "process",
        scenario: "^",
        scenarios: {
          key1: {
            command: ["node", "--eval", `"success";`],
          },
          key2: {
            command: ["node", "--eval", `throw "failure";`],
          },
        },
      },
      cwd_url,
    ),
  );
}
