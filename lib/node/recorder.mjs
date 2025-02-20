import { default as process } from "node:process";
import "./error.mjs";
import { configuration } from "./configuration.mjs";
export * from "./loader-esm.mjs";

// Use top-level await to wait for ./configuration.mjs to update env variables.
const { record } = await import("../../dist/bundles/recorder-cli.mjs");

record(process, configuration);
