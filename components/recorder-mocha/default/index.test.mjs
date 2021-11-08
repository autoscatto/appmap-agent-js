import { strict as Assert } from "assert";
import { EventEmitter } from "events";
import {
  buildTestDependenciesAsync,
  buildTestComponentAsync,
} from "../../build.mjs";
import RecorderMocha from "./index.mjs";

const {
  // equal: assertEqual,
  // deepEqual: assertDeepEqual,
} = Assert;

const { createMochaHooks } = RecorderMocha(
  await buildTestDependenciesAsync(import.meta.url),
);

const { createConfiguration, extendConfiguration } =
  await buildTestComponentAsync("configuration");

const configuration = createConfiguration("/repository");

{
  const emitter = Object.assign(new EventEmitter(), {
    cwd: () => "/cwd",
    argv: ["node", "main.mjs"],
    version: "v1.2.3",
  });
  createMochaHooks(
    emitter,
    extendConfiguration(
      configuration,
      { recorder: "mocha", processes: false, main: "foo.js" },
      "/cwd",
    ),
  );
}

{
  const emitter = Object.assign(new EventEmitter(), {
    cwd: () => "/cwd",
    argv: ["node", "main.mjs"],
    version: "v1.2.3",
  });
  const { beforeEach, afterEach } = createMochaHooks(
    emitter,
    extendConfiguration(
      configuration,
      {
        recorder: "mocha",
        hooks: { cjs: false, esm: false, apply: false, http: false },
      },
      "/directory",
    ),
  );
  beforeEach.call({
    currentTest: {
      parent: {
        fullTitle: () => "full-title-1",
      },
    },
  });
  afterEach();
  // beforeEach.call({
  //   currentTest: {
  //     parent: {
  //       fullTitle: () => "full-title-2",
  //     },
  //   },
  // });
  emitter.emit("uncaughtExceptionMonitor", new Error("BOUM"));
  emitter.emit("exit", 123, "SIGINT");
}
