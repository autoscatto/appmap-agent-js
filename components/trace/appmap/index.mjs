import {
  InternalAppmapError,
  ExternalAppmapError,
} from "../../error/index.mjs";
import { assert } from "../../util/index.mjs";
import { logError, logDebug, logInfo } from "../../log/index.mjs";
import { validateAppmap } from "../../validate-appmap/index.mjs";
import { compileMetadata } from "./metadata.mjs";
import {
  createClassmap,
  addClassmapSource,
  compileClassmap,
} from "./classmap/index.mjs";
import { digestEventTrace } from "./event/index.mjs";
import { orderEventArray } from "./ordering/index.mjs";
import { getOutputUrl } from "./output.mjs";

const {
  Map,
  Array: { from: toArray },
  String,
  Math: { round },
  RangeError,
} = globalThis;

const VERSION = "1.8.0";

const summary_template = `\
Received %j raw events.

Event Distribution:
%f

Most frequently applied functions:
%f
`;

const stackoverflow_template = `\
We cannot process your appmap because it has too many (nested) events.\
There is three ways to solve this issue:

  * You could tweak the \`appmap.yml\` configuration file to record fewer events:
    \`\`\`yaml
    # disable asynchronous jump recording
    ordering: chronological
    # exclude anonymous functions
    anonymous-name-separator: '-'
    exclude:
      - name: '-'
    # exclude functions in dependencies
    packages:
      - glob: 'node_modules/**/*'
        enabled: false
    \`\`\`
  * You could reduce the scope of the recording.\
    For instance, by splitting test files or reducing the time span of remote recording.
  * You could increase the callstack size of this node process.\
    This can be done via the node \`--stack-size\` cli option.
    \`\`\`
    > node --stack-size=5000 node_modules/bin/appmap-agent-js -- npm run test
    \`\`\`
    NB: Unfortunately, \`--stack-size\` cannot be set via the \`NODE_OPTIONS\` environment variable.

${summary_template}`;

export const compileTrace = (messages) => {
  logDebug("Trace: %j", messages);
  let configuration = null;
  const sources = [];
  const errors = [];
  const events = [];
  let termination = { type: "unknown" };
  for (const message of messages) {
    const { type } = message;
    if (type === "start") {
      assert(
        configuration === null,
        "duplicate start message",
        InternalAppmapError,
      );
      ({ configuration } = message);
    } else if (type === "stop") {
      termination = message.termination;
    } else if (type === "error") {
      errors.push(message.error);
    } else if (type === "event") {
      events.push(message);
    } else if (type === "group") {
      events.push(
        {
          type: "event",
          site: "begin",
          tab: 0,
          group: message.group,
          time: 0,
          payload: {
            type: "group",
            group: message.child,
            description: message.description,
          },
        },
        {
          type: "event",
          site: "end",
          tab: 0,
          group: message.group,
          time: 0,
          payload: {
            type: "ungroup",
            group: message.child,
          },
        },
      );
    } else if (type === "source") {
      sources.push(message);
    } else if (type === "amend") {
      for (let index = events.length - 1; index >= 0; index -= 1) {
        const event = events[index];
        if (event.tab === message.tab && event.site === message.site) {
          events[index] = { ...event, payload: message.payload };
          break;
        }
      }
    } /* c8 ignore start */ else {
      throw new InternalAppmapError("invalid message type");
    } /* c8 ignore stop */
  }
  assert(configuration !== null, "missing start message", InternalAppmapError);
  const classmap = createClassmap(configuration);
  for (const source of sources) {
    addClassmapSource(classmap, source);
  }
  const printEventDistribution = () => {
    const counters = new Map();
    for (const { payload } of events) {
      const { type } = payload;
      counters.set(type, (counters.has(type) ? counters.get(type) : 0) + 1);
    }
    const { length: total } = events;
    return toArray(counters.keys())
      .map(
        (key) =>
          `  - ${key}: ${String(counters.get(key))} [${String(
            round((100 * counters.get(key)) / total),
          )}%]`,
      )
      .join("\n");
  };
  const printApplyDistribution = () => {
    const counters = new Map();
    let total = 0;
    for (const { payload } of events) {
      if (payload.type === "apply") {
        total += 1;
        const { function: location } = payload;
        counters.set(
          location,
          (counters.has(location) ? counters.get(location) : 0) + 1,
        );
      }
    }
    return toArray(counters.keys())
      .sort((key1, key2) => counters.get(key1) - counters.get(key2))
      .slice(0, 20)
      .map(
        (key) =>
          `  - ${key}: ${String(counters.get(key))} [${String(
            round((100 * counters.get(key)) / total),
          )}%]`,
      )
      .join("\n");
  };
  let digested_events = null;
  /* c8 ignore start */
  try {
    digested_events = digestEventTrace(orderEventArray(events), classmap);
  } catch (error) {
    if (error instanceof RangeError) {
      logError(
        stackoverflow_template,
        events.length,
        printEventDistribution,
        printApplyDistribution,
      );
      throw new ExternalAppmapError(
        "Cannot create appmap because it contains too deeply nested events",
      );
    } else {
      throw error;
    }
  }
  /* c8 ignore stop */
  const appmap = {
    version: VERSION,
    metadata: compileMetadata(configuration, errors, termination),
    classMap: compileClassmap(classmap),
    events: digested_events,
  };
  if (configuration.validate.appmap) {
    validateAppmap(appmap);
  }
  logInfo(
    summary_template,
    events.length,
    printEventDistribution,
    printApplyDistribution,
  );
  return {
    url: getOutputUrl(configuration),
    content: appmap,
  };
};
