import { readFileSync as readFile, writeFileSync as writeFile } from "fs";
import { Socket } from "net";
import NetSocketMessaging from "net-socket-messaging";
import "../../__fixture__.mjs";
import { getUuid } from "../../uuid/random/index.mjs?env=test";
import { getTmpUrl } from "../../path/index.mjs?env=test";
import { toAbsoluteUrl } from "../../url/index.mjs?env=test";
import {
  createConfiguration,
  extendConfiguration,
} from "../../configuration/index.mjs?env=test";
import {
  openReceptorAsync,
  adaptReceptorConfiguration,
  minifyReceptorConfiguration,
  closeReceptorAsync,
} from "./index.mjs?env=test";

const {
  Promise,
  JSON: { stringify: stringifyJSON },
  URL,
} = globalThis;

const { createMessage } = NetSocketMessaging;

const base = toAbsoluteUrl(`${getUuid()}/`, getTmpUrl());

const testAsync = async (port, configuration, messages) => {
  const socket = new Socket();
  socket.connect(port);
  await new Promise((resolve) => {
    socket.on("connect", resolve);
  });
  socket.write(createMessage("session"));
  socket.write(createMessage(stringifyJSON(configuration)));
  for (const message of messages) {
    socket.write(createMessage(stringifyJSON(message)));
  }
  await new Promise((resolve) => {
    socket.on("close", resolve);
    socket.end();
  });
};

const receptor_configuration = extendConfiguration(
  createConfiguration("file:///w:/home"),
  {
    recorder: "process",
    appmap_dir: "directory",
  },
  base,
);

const receptor = await openReceptorAsync(
  minifyReceptorConfiguration(receptor_configuration),
);

const port = adaptReceptorConfiguration(receptor, receptor_configuration)[
  "trace-port"
];

await testAsync(
  port,
  extendConfiguration(
    createConfiguration("file:///w:/home"),
    {
      recorder: "remote",
    },
    null,
  ),
  [],
);

{
  const filename = getUuid();
  writeFile(new URL(filename, base), "content", "utf8");
  await testAsync(
    port,
    extendConfiguration(
      createConfiguration("file:///w:/home"),
      {
        recorder: "process",
      },
      null,
    ),
    [
      {
        type: "start",
        track: "track",
        configuration: {},
        url: null,
      },
      {
        type: "source",
        url: new URL(filename, base).href,
        content: null,
        shallow: false,
        inline: false,
        exclude: [],
      },
      {
        type: "stop",
        track: "track",
        status: 0,
      },
    ],
  );
}

readFile(new URL("directory/process/anonymous.appmap.json", base));

await testAsync(
  port,
  extendConfiguration(
    createConfiguration("file:///w:/home"),
    {
      recorder: "process",
    },
    null,
  ),
  [
    {
      type: "start",
      track: "track",
      configuration: {},
      url: null,
    },
  ],
);

readFile(new URL("directory/process/anonymous-1.appmap.json", base));

await testAsync(
  port,
  extendConfiguration(
    createConfiguration("file:///w:/home"),
    {
      recorder: "process",
      "map-name": "map  name",
    },
    null,
  ),
  [
    {
      type: "start",
      track: "track",
      configuration: {},
      url: null,
    },
  ],
);

readFile(new URL("directory/process/map-name.appmap.json", base));

await closeReceptorAsync(receptor);
