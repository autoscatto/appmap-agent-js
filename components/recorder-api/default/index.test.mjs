import {
  assertEqual,
  assertDeepEqual,
  assertThrow,
} from "../../__fixture__.mjs";
import {
  createConfiguration,
  extendConfiguration,
} from "../../configuration/index.mjs";
import { Appmap } from "./index.mjs";

const configuration = extendConfiguration(
  createConfiguration("protocol://host/home/"),
  {
    name: "name1",
    recorder: "manual",
    packages: ["*"],
    hooks: {
      cjs: false,
      esm: false,
      eval: false,
      apply: false,
      http: false,
      mysql: false,
      pg: false,
      sqlite3: false,
    },
  },
  "protocol://host/base/",
);

const appmap = new Appmap(configuration);
assertEqual(
  typeof appmap.instrumentModule("123;", "protocol://host/base/main.js"),
  "string",
);

const track = appmap.startRecording(null, { name: "name2" }, null);
assertThrow(
  () => appmap.recordScript("123;", "INVALID URL"),
  /^ExternalAppmapError: Invalid url argument$/u,
);
assertEqual(appmap.recordScript("123;", "protocol://host/base/main.js"), 123);
assertDeepEqual(appmap.stopRecording(track), [
  {
    type: "source",
    url: "protocol://host/base/main.js",
    content: "123;",
  },
  {
    type: "source",
    url: "protocol://host/base/main.js",
    content: "123;",
  },
  {
    type: "start",
    track: "uuid",
    configuration: { ...configuration, name: "name2" },
  },
  {
    type: "stop",
    track: "uuid",
    termination: { type: "manual" },
  },
]);
appmap.terminate();
