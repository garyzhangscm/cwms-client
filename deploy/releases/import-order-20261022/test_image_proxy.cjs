'use strict';
// Run the actual Kubernetes image at the existing test URL. Preserve older previews.
const http = require('node:http');
const httpProxy = require(process.env.MES_HTTP_PROXY_MODULE || 'http-proxy');
const target = process.argv[2];
const approved = process.env.MES_TEST_IMAGE_UPSTREAM;
if (!approved || target !== approved || !/^https?:\/\//.test(approved)) throw new Error('Expected explicitly configured test-image upstream');
const proxy = httpProxy.createProxyServer({xfwd: true, proxyTimeout: 120000, timeout: 120000});
proxy.on('error', (_error, _req, res) => {
  if (res && typeof res.writeHead === 'function' && !res.headersSent) {
    res.writeHead(502, {'Content-Type': 'text/plain', 'Cache-Control': 'no-store'});
    res.end('Test image upstream is unavailable.');
  } else if (res && typeof res.destroy === 'function') res.destroy();
});
function upstream(req) {
  return /^\/(?:api\/line-clearance(?:\/|\?|$)|assets\/test-previews(?:\/|\?|$))/.test(req.url) ? 'http://127.0.0.1:4201' : target;
}
const server = http.createServer((req, res) => proxy.web(req, res, {target: upstream(req)}));
server.on('upgrade', (req, socket, head) => proxy.ws(req, socket, head, {target: upstream(req)}));
server.listen(4200, '0.0.0.0');
for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => server.close(() => process.exit(0)));
