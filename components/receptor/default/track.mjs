import { createServer } from "node:http";
import { InternalAppmapError } from "../../error/index.mjs";
import { assert, coalesce } from "../../util/index.mjs";
import { generateRespond } from "../../http/index.mjs";
import { logDebug, logError } from "../../log/index.mjs";
import { extendConfiguration } from "../../configuration/index.mjs";
import {
  sendBackend,
  hasBackendTrack,
  compileBackendTrace,
} from "../../backend/index.mjs";

export const success = {
  code: 200,
  message: "OK",
  body: null,
};

export const failure = {
  code: 400,
  message: "Bad Request",
  body: null,
};

export const createTrackServer = (configuration, backend) => {
  configuration = {
    ...configuration,
    recorder: "remote",
  };
  const server = createServer();
  server.on(
    "request",
    generateRespond((method, path, body) => {
      logDebug("Received remote recording request: %s %s", method, path);
      const parts = path.split("/");
      if (parts.length !== 3 || parts[0] !== "") {
        logError("Could not parse request path %j", path);
        return failure;
      } else {
        const [, session, record] = parts;
        if (method === "POST") {
          if (
            sendBackend(backend, session, {
              type: "start",
              track: record,
              configuration: extendConfiguration(
                configuration,
                coalesce(body, "data", {}),
                coalesce(body, "path", null),
              ),
            })
          ) {
            return success;
          } else {
            return failure;
          }
        } else if (method === "GET") {
          const maybe_boolean = hasBackendTrack(backend, session, record);
          if (maybe_boolean === null) {
            return failure;
          } else {
            return {
              ...success,
              body: { enabled: maybe_boolean },
            };
          }
        } else if (method === "DELETE") {
          if (
            sendBackend(backend, session, {
              type: "stop",
              track: record,
              termination: { type: "manual" },
            })
          ) {
            const maybe_trace = compileBackendTrace(backend, session, record);
            assert(
              maybe_trace !== null,
              "expected compiled trace after stop",
              InternalAppmapError,
            );
            return {
              ...success,
              body: maybe_trace.content,
            };
          } else {
            return failure;
          }
        } else {
          logError("Unsupported http method %j", method);
          return failure;
        }
      }
    }),
  );
  return server;
};
