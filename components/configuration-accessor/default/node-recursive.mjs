import { constant, coalesce } from "../../util/index.mjs";
import { toAbsoluteUrl } from "../../url/index.mjs";
import { escapeNodeOption } from "./escape.mjs";

const doesSupportSource = constant(true);

const doesSupportTokens = constant(true);

export const generateNodeRecorder = (recorder) => ({
  name: recorder,
  recursive: true,
  doesSupportSource,
  doesSupportTokens,
  hookCommandSource: (source, _shell, _base) => [source],
  hookCommandTokens: (tokens, _base) => tokens,
  hookEnvironment: (env, base) => ({
    ...env,
    NODE_OPTIONS: `${coalesce(
      env,
      "NODE_OPTIONS",
      "",
    )} --experimental-loader=${escapeNodeOption(
      toAbsoluteUrl(`lib/node/recorder.mjs`, base),
    )}`,
  }),
});
