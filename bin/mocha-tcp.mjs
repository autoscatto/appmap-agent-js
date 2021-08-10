#!/usr/bin/env node

import {buildProdAsync} from "../src/build.mjs";

const {main:{main}} = await buildProdAsync(["main"], {
  violation: "exit",
  client: "node-tcp",
  "interpretation": "node",
  "instrumentation": "default",
  "hook-module": "node",
  "hook-group": "node",
  "hook-query": "node",
  main: "mocha",
});

export const {transformSource, mochaHooks} = main(process);
