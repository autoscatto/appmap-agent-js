import { createServer } from "net";
import { patch } from "net-socket-messaging";
import { logWarn, format } from "../../../util/index.mjs";

const global_JSON_parse = JSON.parse;

export default ({ backend: { open } }, { port }) => ({
  openAsync: () =>
    new Promise((resolve, reject) => {
      const server = createServer();
      const sockets = new Set();
      const onSocketError = (error) => {
        logWarn(format("tcp socket error >> %s", error.message));
      };
      server.on("connection", (socket) => {
        sockets.add(socket);
        socket.on("error", onSocketError);
        const { receive, close } = open();
        socket.on("close", () => {
          sockets.delete(socket);
          close();
        });
        patch(socket);
        socket.on("message", (message) => {
          receive(global_JSON_parse(message));
        });
      });
      server.on("error", reject);
      server.on("listening", () => {
        server.removeAllListeners("error");
        resolve({
          server,
          life: new Promise((resolve, reject) => {
            server.on("error", (error) => {
              server.close();
              for (let socket of sockets) {
                socket.destroy();
              }
              reject(error);
            });
            server.on("close", resolve);
          }),
          close: () => {
            server.close();
            for (let socket of sockets) {
              socket.end();
            }
          },
        });
      });
      server.listen(port);
    }),
});
