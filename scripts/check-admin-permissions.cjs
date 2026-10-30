const fs = require('node:fs');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const ts = require('typescript');
const source = fs.readFileSync('src/app/routes/auth/services/user.service.ts', 'utf8');
function method(name) {
  const start = source.indexOf(`  async ${name}(`);
  assert.notEqual(start, -1);
  const open = source.indexOf('{', start);
  let depth = 1;
  let end = open + 1;
  while (depth) {
    if (source[end] === '{') depth++;
    if (source[end] === '}') depth--;
    end++;
    assert.ok(end <= source.length);
  }
  return source.slice(start, end);
}
// Compile and exercise the actual service methods, without HTTP or user changes.
const compiled = ts.transpileModule(`class PermissionChecks {
  ${method('isCurrentUserAdmin')}
  ${method('isCurrentPageDisplayOnly')}
}`, { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const Checks = new Function(`${compiled}; return PermissionChecks;`)();
function checks(user, menu) {
  const c = new Checks();
  c.getCurrentUser = async () => user;
  c.menuService = { find: ({ url, recursive }) => {
    assert.equal(url, '/common/reason-code');
    assert.equal(recursive, true);
    return menu;
  } };
  return c;
}
for (const [label, user] of [
  ['administrator', { admin: true, systemAdmin: false }],
  ['system administrator', { admin: false, systemAdmin: true }],
  ['system administrator without admin field', { systemAdmin: true }],
  ['both administrator flags', { admin: true, systemAdmin: true }],
]) {
  test(`${label} may add reason codes even when menu is read-only`, async () => {
    const c = checks(user, { displayOnly: true });
    assert.equal(await c.isCurrentUserAdmin(), true);
    assert.equal(await c.isCurrentPageDisplayOnly('/common/reason-code'), false);
  });
}
test('ordinary read-only user cannot add reason codes', async () => {
  const c = checks({ admin: false, systemAdmin: false }, { displayOnly: true });
  assert.equal(await c.isCurrentUserAdmin(), false);
  assert.equal(await c.isCurrentPageDisplayOnly('/common/reason-code'), true);
});
test('ordinary user with write permission keeps access', async () => {
  assert.equal(await checks({}, { displayOnly: false })
    .isCurrentPageDisplayOnly('/common/reason-code'), false);
});
test('unknown menu remains read-only', async () => {
  assert.equal(await checks({}, undefined)
    .isCurrentPageDisplayOnly('/common/reason-code'), true);
});
test('missing user is never treated as administrator', async () => {
  assert.equal(await checks(undefined, undefined).isCurrentUserAdmin(), false);
});
test('truthy non-boolean flags do not grant administrator access', async () => {
  const c = checks({ admin: 'false', systemAdmin: 'true' }, { displayOnly: true });
  assert.equal(await c.isCurrentUserAdmin(), false);
  assert.equal(await c.isCurrentPageDisplayOnly('/common/reason-code'), true);
});
