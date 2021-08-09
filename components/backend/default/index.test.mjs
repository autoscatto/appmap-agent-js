import { strict as Assert } from "assert";
import { readFile } from "fs/promises";
import { tmpdir } from "os";
import { buildDependenciesAsync, buildOneAsync } from "../../build.mjs";
import Backend from "./index.mjs";

const { deepEqual: assertDeepEqual, throws: assertThrows } = Assert;

const testAsync = async () => {
  const dependencies = await buildDependenciesAsync(import.meta.url, "test");
  const { createConfiguration, extendConfiguration } = await buildOneAsync(
    "configuration",
    "test",
  );
  const { openBackend, sendBackend, closeBackend } = Backend(dependencies);

  const filename = Math.random().toString(36).substring(2);
  const configuration = extendConfiguration(
    createConfiguration("/cwd"),
    {
      pruning: false,
      output: {
        directory: tmpdir(),
        postfix: ".postfix",
      },
    },
    "/cwd",
  );

  {
    const backend = openBackend();
    sendBackend(backend, { type: "initialize", data: configuration });
    sendBackend(backend, {
      type: "trace",
      data: {
        type: "track",
        data: { type: "start", index: 123, options: { output: { filename } } },
      },
    });
    assertThrows(
      () => sendBackend(backend, { type: "invalid" }),
      /^AssertionError: invalid message type/,
    );
    sendBackend(backend, {
      type: "terminate",
      data: {
        errors: [{ name: "error-name", message: "error-message" }],
        status: 1,
      },
    });

    closeBackend(backend);
    const {
      metadata: { exception: error },
      ...rest
    } = JSON.parse(
      await readFile(`${tmpdir()}/${filename}.postfix.json`, "utf8"),
    );
    assertDeepEqual(error, { class: "error-name", message: "error-message" });
    assertDeepEqual(rest, { version: "1.6.0", classMap: [], events: [] });
  }

  {
    const backend = openBackend();
    sendBackend(backend, { type: "initialize", data: configuration });
    closeBackend(backend);
  }
};

testAsync();
