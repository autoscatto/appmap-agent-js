import { strict as Assert } from 'assert';
import * as Module from 'module';
import Express from 'express';
import { hookHTTP } from '../../../../../../lib/client/node/hook/http.js';

const require = Module.createRequire(import.meta.url);
const Http = require('http');

const makeRecord = () => {
  const events = [];
  return {
    events,
    makeCouple: () => {
      const couple = {
        parent: null,
        recordCall(...args) {
          Assert.equal(this, couple);
          Assert.equal(args.length, 2);
          this.parent = events.length;
          events.push({
            parent: null,
            key: args[0],
            value: args[1],
          });
        },
        recordReturn(...args) {
          Assert.equal(this, couple);
          Assert.equal(args.length, 2);
          events.push({
            parent: this.parent,
            key: args[0],
            value: args[1],
          });
        },
      };
      return couple;
    },
  };
};

(async () => {
  await new Promise((resolve, reject) => {
    const { events, makeCouple } = makeRecord();
    const unhook = hookHTTP({}, makeCouple);
    const server = Http.createServer();
    server.on('close', resolve);
    server.on('request', (request, response) => {
      let body = '';
      request.setEncoding('utf8');
      request.on('data', (data) => {
        body += data;
      });
      request.on('end', () => {
        response.removeHeader('content-type');
        response.removeHeader('date');
        response.end(body, 'utf8');
      });
    });
    server.on('listening', () => {
      const request = Http.request({
        method: 'PUT',
        host: 'localhost',
        port: server.address().port,
        path: '/path?param=123#hash',
      });
      request.on('response', (response) => {
        Assert.equal(response.statusCode, 200);
        response.setEncoding('utf8');
        let body = '';
        response.on('data', (data) => {
          body += data;
        });
        response.on('end', () => {
          Assert.equal(body, 'foo');
          Assert.deepEqual(events, [
            {
              parent: null,
              key: 'http_client_request',
              value: {
                request_method: 'PUT',
                url: `http://localhost:${server.address().port}/path`,
                message: 'param=123#hash',
                headers: {
                  host: `localhost:${server.address().port}`,
                  'content-type': 'text/plain; charset=utf-8',
                },
              },
            },
            {
              parent: null,
              key: 'http_server_request',
              value: {
                request_method: 'PUT',
                path_info: '/path?param=123#hash',
                normalized_path_info: null,
                parameters: null,
                protocol: 'HTTP/1.1',
                headers: {
                  host: `localhost:${server.address().port}`,
                  'content-type': 'text/plain; charset=utf-8',
                  connection: 'close',
                  'content-length': '3',
                },
              },
            },
            {
              parent: 1,
              key: 'http_server_response',
              value: {
                status_code: 200,
                status_message: 'OK',
                mime_type: null,
                headers: {},
              },
            },
            {
              parent: 0,
              key: 'http_client_response',
              value: {
                status_code: 200,
                status_message: 'OK',
                mime_type: null,
                headers: {
                  connection: 'close',
                  'content-length': '3',
                },
              },
            },
          ]);
          unhook();
          server.close();
        });
      });
      request.setHeader('content-type', 'text/plain; charset=utf-8');
      request.setHeader('host', `localhost:${server.address().port}`);
      request.end('foo', 'utf8');
    });
    server.listen(0);
  });
  await new Promise((resolve, reject) => {
    const { events, makeCouple } = makeRecord();
    const unhook = hookHTTP({}, makeCouple);
    const app = Express();
    app.get('/:foo', (req, res) => {
      res.send('bar');
    });
    const server = new Http.Server();
    server.on('close', resolve);
    server.on('request', app);
    server.on('listening', () => {
      const request = new Http.ClientRequest({
        method: 'GET',
        host: 'localhost',
        port: server.address().port,
        path: '/123',
      });
      request.on('response', (response) => {
        Assert.equal(response.statusCode, 200);
        response.setEncoding('utf8');
        let body = '';
        response.on('data', (data) => {
          body += data;
        });
        response.on('end', () => {
          Assert.equal(body, 'bar');
          for (let event of events) {
            if (
              Reflect.getOwnPropertyDescriptor(event, 'elapsed') !== undefined
            ) {
              delete event.elapsed;
            }
            if (
              Reflect.getOwnPropertyDescriptor(event.value, 'headers') !==
              undefined
            ) {
              delete event.value.headers.date;
              delete event.value.headers.etag;
            }
          }
          Assert.deepEqual(events, [
            {
              parent: null,
              key: 'http_client_request',
              value: {
                request_method: 'GET',
                url: 'http://localhost/123',
                message: '',
                headers: {},
              },
            },
            {
              parent: null,
              key: 'http_server_request',
              value: {
                request_method: 'GET',
                path_info: '/123',
                normalized_path_info: '/{foo}',
                parameters: { foo: '123' },
                protocol: 'HTTP/1.1',
                headers: {
                  connection: 'close',
                },
              },
            },
            {
              parent: 1,
              key: 'http_server_response',
              value: {
                status_code: 200,
                status_message: 'OK',
                mime_type: 'text/html; charset=utf-8',
                headers: {
                  'content-type': 'text/html; charset=utf-8',
                  'content-length': '3',
                  'x-powered-by': 'Express',
                },
              },
            },
            {
              parent: 0,
              key: 'http_client_response',
              value: {
                status_code: 200,
                status_message: 'OK',
                mime_type: 'text/html; charset=utf-8',
                headers: {
                  connection: 'close',
                  'content-type': 'text/html; charset=utf-8',
                  'content-length': '3',
                  'x-powered-by': 'Express',
                },
              },
            },
          ]);
          unhook();
          server.close();
        });
      });
      request.removeHeader('content-type');
      request.removeHeader('host');
      request.end('foo', 'utf8');
    });
    server.listen(0);
  });
})();
