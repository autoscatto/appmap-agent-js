import { strict as Assert } from "assert";
import { buildTestAsync } from "../../../src/build.mjs";
import Session from "./session.mjs";
import Recording from "./recording.mjs";

const { deepEqual: assertDeepEqual, equal: assertEqual } = Assert;

const testAsync = async () => {
  const dependencies = await buildTestAsync({
    ...import.meta,
    deps: ["configuration"],
  });
  const {
    configuration: { createConfiguration },
  } = dependencies;
  const {
    createRecording,
    setCurrentGroup,
    getSerializationEmptyValue,
    incrementEventCounter,
    recordBeforeApply,
    recordAfterApply,
    recordBeforeQuery,
    recordAfterQuery,
  } = Recording(dependencies);
  const { createSession, initializeSession } = Session(dependencies);
  const configuration = createConfiguration("/");
  const recording = createRecording(configuration);
  const session = createSession(configuration);
  setCurrentGroup({ recording }, "group");
  initializeSession(session);
  assertEqual(typeof incrementEventCounter({ recording }), "number");
  assertEqual(typeof getSerializationEmptyValue({ recording }), "symbol");
  assertDeepEqual(
    recordBeforeApply({ session, recording }, "index", {
      function: "function",
      this: 123,
      arguments: [456],
    }),
    {
      type: "send",
      data: {
        type: "event",
        data: {
          type: "before",
          time: 0,
          index: "index",
          group: "group",
          data: {
            type: "apply",
            function: "function",
            this: { type: "number", print: "123" },
            arguments: [{ type: "number", print: "456" }],
          },
        },
      },
    },
  );
  assertDeepEqual(
    recordAfterApply({ session, recording }, "index", {
      result: 123,
      error: 456,
    }),
    {
      type: "send",
      data: {
        type: "event",
        data: {
          type: "after",
          time: 0,
          index: "index",
          group: "group",
          data: {
            type: "apply",
            result: { type: "number", print: "123" },
            error: { type: "number", print: "456" },
          },
        },
      },
    },
  );
  assertDeepEqual(
    recordBeforeQuery({ session, recording }, "index", {
      database: "database",
      version: "version",
      sql: "sql",
      parameters: [123],
    }),
    {
      type: "send",
      data: {
        type: "event",
        data: {
          type: "before",
          time: 0,
          index: "index",
          group: "group",
          data: {
            type: "query",
            database: "database",
            version: "version",
            sql: "sql",
            parameters: [{ type: "number", print: "123" }],
          },
        },
      },
    },
  );
  assertDeepEqual(
    recordAfterQuery({ session, recording }, "index", {
      error: 123,
    }),
    {
      type: "send",
      data: {
        type: "event",
        data: {
          type: "after",
          time: 0,
          index: "index",
          group: "group",
          data: {
            type: "query",
            error: { type: "number", print: "123" },
          },
        },
      },
    },
  );
};

testAsync();
