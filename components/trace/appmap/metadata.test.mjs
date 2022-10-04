import { assertDeepEqual, assertEqual } from "../../__fixture__.mjs";
import {
  createConfiguration,
  extendConfiguration,
} from "../../configuration/index.mjs?env=test";
import { compileMetadata } from "./metadata.mjs?env=test";

const test = (conf, url, errors = [], status = 0) => {
  let configuration = createConfiguration(url);
  configuration = extendConfiguration(configuration, conf, url);
  configuration = extendConfiguration(
    configuration,
    {
      recorder: "process",
      agent: {
        directory: "file:///agent",
        package: {
          name: "appmap-agent-js",
          version: "1.2.3",
          homepage: "http://homepage",
        },
      },
    },
    null,
  );
  return compileMetadata(configuration, errors, status);
};

const default_meta_data = {
  app: null,
  name: null,
  labels: [],
  language: { name: "javascript", version: "ES.Next", engine: null },
  frameworks: [],
  client: {
    name: "appmap-agent-js",
    version: "1.2.3",
    url: "http://homepage",
  },
  recorder: { name: "process" },
  recording: null,
  git: null,
  test_status: "succeeded",
  exception: null,
};

assertDeepEqual(test({}, "file:///cwd"), default_meta_data);

// history //
assertEqual(
  typeof test(
    {
      recorder: "process",
      repository: {
        directory: import.meta.url,
        history: { repository: null, branch: null, commit: null },
        package: null,
      },
    },
    "file:///cwd",
  ).git.repository,
  "string",
);

// recorder //
assertDeepEqual(test({ recorder: "process" }, "file:///cwd"), {
  ...default_meta_data,
  recorder: { name: "process" },
});

// termination //

assertDeepEqual(
  test(
    {},
    "file:///cwd",
    [
      {
        name: "error-name",
        message: "error-message",
      },
    ],
    0,
  ),
  {
    ...default_meta_data,
    test_status: "failed",
    exception: { class: "error-name", message: "error-message" },
  },
);

// app //

assertDeepEqual(test({ name: "app-name" }, "file:///cwd"), {
  ...default_meta_data,
  app: "app-name",
});

// name //

assertDeepEqual(test({ "map-name": "map-name" }, "file:///cwd"), {
  ...default_meta_data,
  name: "map-name",
});

assertDeepEqual(test({ appmap_file: "basename" }, "file:///cwd"), {
  ...default_meta_data,
  name: "basename",
});

assertDeepEqual(test({ main: "/directory/filename.js" }, "file:///cwd"), {
  ...default_meta_data,
  name: "filename",
});

// recording //

assertDeepEqual(
  test(
    {
      recording: {
        "defined-class": "defined-class",
        "method-id": "method-id",
      },
    },
    "file:///cwd",
  ),
  {
    ...default_meta_data,
    recording: { defined_class: "defined-class", method_id: "method-id" },
  },
);
