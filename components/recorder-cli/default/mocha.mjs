import { hooks } from "../../../lib/node/mocha-hook.mjs";
import { ExternalAppmapError } from "../../error/index.mjs";
import { logErrorWhen } from "../../log/index.mjs";
import { hook } from "../../hook/index.mjs";
import { extendConfiguration } from "../../configuration/index.mjs";
import { assert, coalesce, matchVersion } from "../../util/index.mjs";
import { requirePeerDependency } from "../../peer/index.mjs";
import {
  openAgent,
  recordStartTrack,
  recordStopTrack,
} from "../../agent/index.mjs";

const { undefined, String } = globalThis;

// Accessing mocha version via the prototype is not documented but it seems stable enough.
// Added in https://github.com/mochajs/mocha/pull/3535
//
// v6.0.0  https://github.com/mochajs/mocha/blob/42303e2acba217af554294b1174ee53b5627cc33/lib/mocha.js#L765
// v7.0.0  https://github.com/mochajs/mocha/blob/69339a3e7710a790b106b922ce53fcb87772f689/lib/mocha.js#L816
// v8.0.0  https://github.com/mochajs/mocha/blob/612fa31228c695f16173ac675f40ccdf26b4cfb5/lib/mocha.js#L914
// v9.0.0  https://github.com/mochajs/mocha/blob/8339c3db2cb273f6b56a4cfa7974510f1bf72934/lib/mocha.js#L979
// v10.0.0 https://github.com/mochajs/mocha/blob/023f548213e571031b41cabbcb8bb20e458b2725/lib/mocha.js#L928

const validateMocha = (Mocha) => {
  const prototype = coalesce(Mocha, "prototype", undefined);
  const version = coalesce(prototype, "version", undefined);
  assert(
    !logErrorWhen(
      typeof version !== "string",
      "Expected mocha version to be >= 8.0.0 but got < 6.0.0",
    ),
    "Incompatible mocha version (< 6.0.0)",
    ExternalAppmapError,
  );
  assert(
    !logErrorWhen(
      !matchVersion(version, "8.0.0"),
      "Expected Mocha.prototype.version >= 8.0.0 but got: %o",
      version,
    ),
    "Incompatible mocha version (< 8.0.0)",
    ExternalAppmapError,
  );
};

export const record = (configuration) => {
  validateMocha(
    requirePeerDependency("mocha", {
      directory: configuration.repository.directory,
      strict: true,
    }),
  );
  const agent = openAgent(configuration);
  hook(agent, configuration);
  let running = null;
  let counter = 0;
  hooks.beforeEach = (context) => {
    const name = context.currentTest.parent.fullTitle();
    assert(
      !logErrorWhen(
        running !== null,
        "Detected conccurent mocha test cases: %j and %j",
        running,
        name,
      ),
      "Concurrent mocha test cases",
      ExternalAppmapError,
    );
    running = name;
    counter += 1;
    recordStartTrack(
      agent,
      `mocha-${String(counter)}`,
      extendConfiguration(
        configuration,
        {
          "map-name": name,
        },
        null,
      ),
    );
  };
  hooks.afterEach = (context) => {
    recordStopTrack(agent, `mocha-${String(counter)}`, {
      type: "test",
      passed: context.currentTest.state === "passed",
    });
    running = null;
  };
};
