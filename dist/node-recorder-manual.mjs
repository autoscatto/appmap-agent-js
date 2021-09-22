import uuid$random from "./../components/uuid/random/index.mjs";
import util$default from "./../components/util/default/index.mjs";
import violation$exit from "./../components/violation/exit/index.mjs";
import expect_inner$default from "./../components/expect-inner/default/index.mjs";
import expect$default from "./../components/expect/default/index.mjs";
import log_inner$write_sync from "./../components/log-inner/write-sync/index.mjs";
import log$debug from "./../components/log/debug/index.mjs";
import log$error from "./../components/log/error/index.mjs";
import log$info from "./../components/log/info/index.mjs";
import log$off from "./../components/log/off/index.mjs";
import log$warning from "./../components/log/warning/index.mjs";
import time$performance_node from "./../components/time/performance-node/index.mjs";
import specifier$default from "./../components/specifier/default/index.mjs";
import naming$default from "./../components/naming/default/index.mjs";
import instrumentation$default from "./../components/instrumentation/default/index.mjs";
import serialization$default from "./../components/serialization/default/index.mjs";
import frontend$default from "./../components/frontend/default/index.mjs";
import interpretation$vm from "./../components/interpretation/vm/index.mjs";
import request$node_http from "./../components/request/node-http/index.mjs";
import storage$file from "./../components/storage/file/index.mjs";
import validate$ajv from "./../components/validate/ajv/index.mjs";
import repository$node from "./../components/repository/node/index.mjs";
import child$default from "./../components/child/default/index.mjs";
import engine$node from "./../components/engine/node/index.mjs";
import configuration$default from "./../components/configuration/default/index.mjs";
import validate_message$off from "./../components/validate-message/off/index.mjs";
import validate_message$on from "./../components/validate-message/on/index.mjs";
import validate_appmap$off from "./../components/validate-appmap/off/index.mjs";
import validate_appmap$on from "./../components/validate-appmap/on/index.mjs";
import trace$appmap from "./../components/trace/appmap/index.mjs";
import backend$default from "./../components/backend/default/index.mjs";
import client$inline from "./../components/client/inline/index.mjs";
import client$node_http1 from "./../components/client/node-http1/index.mjs";
import client$node_http2 from "./../components/client/node-http2/index.mjs";
import client$node_tcp from "./../components/client/node-tcp/index.mjs";
import hook_apply$default from "./../components/hook-apply/default/index.mjs";
import hook_group$node from "./../components/hook-group/node/index.mjs";
import hook_module$node from "./../components/hook-module/node/index.mjs";
import hook_request$node from "./../components/hook-request/node/index.mjs";
import emitter$default from "./../components/emitter/default/index.mjs";
import hook_response$node from "./../components/hook-response/node/index.mjs";
import hook_query$node from "./../components/hook-query/node/index.mjs";
import agent$default from "./../components/agent/default/index.mjs";
import recorder_manual$default from "./../components/recorder-manual/default/index.mjs";

export default (blueprint) => {
  const dependencies = {__proto__:null};
  dependencies["uuid"] = uuid$random(dependencies);
  dependencies["util"] = util$default(dependencies);
  dependencies["violation"] = violation$exit(dependencies);
  dependencies["expect-inner"] = expect_inner$default(dependencies);
  dependencies["expect"] = expect$default(dependencies);
  dependencies["log-inner"] = log_inner$write_sync(dependencies);
  if (!("log" in blueprint)) { throw new Error("missing instance for component log"); }
  dependencies["log"] = (blueprint["log"] === "warning" ? log$warning(dependencies) : (blueprint["log"] === "off" ? log$off(dependencies) : (blueprint["log"] === "info" ? log$info(dependencies) : (blueprint["log"] === "error" ? log$error(dependencies) : (blueprint["log"] === "debug" ? log$debug(dependencies) : ((() => { throw new Error("invalid instance for component log"); }) ()))))));
  dependencies["time"] = time$performance_node(dependencies);
  dependencies["specifier"] = specifier$default(dependencies);
  dependencies["naming"] = naming$default(dependencies);
  dependencies["instrumentation"] = instrumentation$default(dependencies);
  dependencies["serialization"] = serialization$default(dependencies);
  dependencies["frontend"] = frontend$default(dependencies);
  dependencies["interpretation"] = interpretation$vm(dependencies);
  dependencies["request"] = request$node_http(dependencies);
  dependencies["storage"] = storage$file(dependencies);
  dependencies["validate"] = validate$ajv(dependencies);
  dependencies["repository"] = repository$node(dependencies);
  dependencies["child"] = child$default(dependencies);
  dependencies["engine"] = engine$node(dependencies);
  dependencies["configuration"] = configuration$default(dependencies);
  if (!("validate-message" in blueprint)) { throw new Error("missing instance for component validate-message"); }
  dependencies["validate-message"] = (blueprint["validate-message"] === "on" ? validate_message$on(dependencies) : (blueprint["validate-message"] === "off" ? validate_message$off(dependencies) : ((() => { throw new Error("invalid instance for component validate-message"); }) ())));
  if (!("validate-appmap" in blueprint)) { throw new Error("missing instance for component validate-appmap"); }
  dependencies["validate-appmap"] = (blueprint["validate-appmap"] === "on" ? validate_appmap$on(dependencies) : (blueprint["validate-appmap"] === "off" ? validate_appmap$off(dependencies) : ((() => { throw new Error("invalid instance for component validate-appmap"); }) ())));
  dependencies["trace"] = trace$appmap(dependencies);
  dependencies["backend"] = backend$default(dependencies);
  if (!("client" in blueprint)) { throw new Error("missing instance for component client"); }
  dependencies["client"] = (blueprint["client"] === "node-tcp" ? client$node_tcp(dependencies) : (blueprint["client"] === "node-http2" ? client$node_http2(dependencies) : (blueprint["client"] === "node-http1" ? client$node_http1(dependencies) : (blueprint["client"] === "inline" ? client$inline(dependencies) : ((() => { throw new Error("invalid instance for component client"); }) ())))));
  dependencies["hook-apply"] = hook_apply$default(dependencies);
  dependencies["hook-group"] = hook_group$node(dependencies);
  dependencies["hook-module"] = hook_module$node(dependencies);
  dependencies["hook-request"] = hook_request$node(dependencies);
  dependencies["emitter"] = emitter$default(dependencies);
  dependencies["hook-response"] = hook_response$node(dependencies);
  dependencies["hook-query"] = hook_query$node(dependencies);
  dependencies["agent"] = agent$default(dependencies);
  dependencies["recorder-manual"] = recorder_manual$default(dependencies);
  return dependencies["recorder-manual"];
};