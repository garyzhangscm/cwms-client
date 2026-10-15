const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/index.html', 'utf8').match(/<script id="mes-startup-recovery">([\s\S]*?)<\/script>/)[1];
function setup({ ready = false, blocked = false, stored = 0 } = {}) {
  const handlers = {}, nodes = new Map(), requests = [], timers = new Map();
  const data = new Map(stored ? [['mes:asset-recovery-at', String(stored)]] : []);
  let nextTimer = 0;
  function element(tagName) {
    return { tagName, style: {}, children: [], setAttribute() {}, appendChild(node) { this.children.push(node); if (node.id) nodes.set(node.id, node); },
      addEventListener(name, fn) { this[name] = fn; }, remove() { nodes.delete(this.id); } };
  }
  const document = { body: element('BODY'), getElementById: id => nodes.get(id), createElement: element };
  const location = { href: 'http://mes.test/?existing=1#/work-order/work-order', origin: 'http://mes.test', replace: url => requests.push(url) };
  const history = { state: { test: 1 }, replaceState: (_, __, url) => { location.href = url; } };
  const sessionStorage = { getItem: k => { if (blocked) throw Error('blocked'); return data.get(k); }, setItem: (k, v) => { if (blocked) throw Error('blocked'); data.set(k, v); }, removeItem: k => data.delete(k) };
  const window = { addEventListener: (k, fn) => { handlers[k] = fn; }, setTimeout: fn => { timers.set(++nextTimer, fn); return nextTimer; }, clearTimeout: id => timers.delete(id) };
  vm.runInNewContext(source, { window, document, location, history, sessionStorage, URL, Date });
  if (ready) handlers['mes:startup-ready']();
  return { handlers, nodes, requests, timers, data, location };
}
function missing(c, url = 'http://mes.test/chunk-OLD12345.js') { c.handlers.error({ target: { tagName: 'SCRIPT', src: url } }); }
let c = setup(); missing(c); assert.equal(c.requests.length, 1);
let url = new URL(c.requests[0]); assert.equal(url.hash, '#/work-order/work-order'); assert.equal(url.searchParams.get('existing'), '1'); assert(url.searchParams.has('_mes_reload'));
missing(c); assert.equal(c.requests.length, 1);
c = setup({ stored: Date.now() }); missing(c); assert.equal(c.requests.length, 0); assert(c.nodes.has('mes-load-recovery'));
c = setup({ blocked: true }); missing(c); assert.equal(c.requests.length, 0); assert(c.nodes.has('mes-load-recovery'));
c = setup({ ready: true }); missing(c); assert.equal(c.requests.length, 0); assert(c.nodes.has('mes-load-recovery'));
assert.match(c.nodes.get('mes-load-recovery').children[0].textContent, /unsaved work/);
c.nodes.get('mes-load-recovery').children[1].click(); assert.equal(c.requests.length, 1);
c = setup(); missing(c, 'http://elsewhere.test/script.js'); missing(c, 'http://mes.test/image.png');
c.handlers.unhandledrejection({ reason: Error('API timeout') }); assert.equal(c.requests.length, 0); assert.equal(c.nodes.size, 0);
c.handlers.unhandledrejection({ reason: TypeError("'text/html' is not a valid JavaScript MIME type.") }); assert.equal(c.requests.length, 1);
c = setup(); [...c.timers.values()][0](); assert(c.nodes.has('mes-load-recovery')); assert.equal(c.requests.length, 0);
c.handlers['mes:startup-ready'](); assert.equal(c.nodes.size, 0); assert.equal(c.timers.size, 0);
c = setup(); c.handlers['mes:startup-failed'](); assert(c.nodes.has('mes-load-recovery')); assert.equal(c.requests.length, 0);
c = setup(); c.location.href = 'http://mes.test/?existing=1&_mes_reload=42#/passport/login'; c.handlers['mes:startup-ready']();
assert.equal(new URL(c.location.href).searchParams.get('existing'), '1'); assert.equal(new URL(c.location.href).searchParams.has('_mes_reload'), false);
console.log('PASS: initial asset recovery, cooldown, duplicate errors, blocked storage, active-form protection, manual retry, unrelated failures, MIME errors, watchdog, ready cleanup and URL preservation');
