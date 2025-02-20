import { assertDeepEqual, assertEqual } from "../../__fixture__.mjs";
import {
  createConfiguration,
  extendConfiguration,
} from "../../configuration/index.mjs";
import {
  openAgent,
  closeAgent,
  instrument,
  takeLocalAgentTrace,
  recordStartTrack,
  recordStopTrack,
  getSerializationEmptyValue,
  getFreshTab,
  recordGroup,
  recordBeforeEvent,
  recordAfterEvent,
  formatQueryPayload,
  getAnswerPayload,
} from "./index.mjs";

const { eval: evalGlobal } = globalThis;

const configuration = extendConfiguration(
  createConfiguration("protocol://host/home/"),
  {
    packages: ["*"],
  },
  "protocol://host/base/",
);

const agent = openAgent(configuration);

getSerializationEmptyValue(agent);

recordStartTrack(agent, "record", configuration);
recordGroup(agent, 123, "description");
assertEqual(
  evalGlobal(
    instrument(
      agent,
      { url: "protocol://host/base/main.js", content: "123;" },
      null,
    ),
  ),
  123,
);

const tab = getFreshTab(agent);
recordBeforeEvent(
  agent,
  tab,
  formatQueryPayload(agent, "mysql", null, "SELECT 123;", []),
);
recordAfterEvent(agent, tab, getAnswerPayload(agent));
recordStopTrack(agent, "record", { type: "manual" });
assertDeepEqual(takeLocalAgentTrace(agent, "record"), [
  {
    type: "source",
    url: "protocol://host/base/main.js",
    content: "123;",
  },
  {
    type: "start",
    track: "record",
    configuration,
  },
  {
    type: "group",
    group: 0,
    child: 123,
    description: "description",
  },
  {
    type: "event",
    site: "before",
    tab: 1,
    group: 0,
    time: 0,
    payload: {
      type: "query",
      database: "mysql",
      version: null,
      sql: "SELECT 123;",
      parameters: [],
    },
  },
  {
    type: "event",
    site: "after",
    tab: 1,
    group: 0,
    time: 0,
    payload: { type: "answer" },
  },
  {
    type: "stop",
    track: "record",
    termination: { type: "manual" },
  },
]);
closeAgent(agent);
