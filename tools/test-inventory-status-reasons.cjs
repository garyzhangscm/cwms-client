const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');

// Execute the component's actual mapping methods without Angular or an API.
const source = fs.readFileSync(path.join(__dirname,
  '../src/app/routes/inventory/inventory-status-maintenance/inventory-status-maintenance.component.ts'), 'utf8');
function method(name) {
  const start = source.indexOf(`  ${name}() {`);
  assert.notEqual(start, -1);
  const open = source.indexOf('{', start);
  let depth = 1;
  let end = open + 1;
  for (; depth; end++) {
    if (source[end] === '{') depth++;
    if (source[end] === '}') depth--;
    assert.ok(end < source.length);
  }
  return new Function(source.slice(open + 1, end - 1));
}
const read = method('setupReasonCodeRequirement');
const save = method('setupReasonCodeOnInventoryStatus');

for (const flow of ['Receiving', 'Producing', 'Adjusting']) {
  for (const [required, optional, expected] of [
    [false, true, 'Optional'], [true, false, 'Required'],
    [false, false, 'NA'], [undefined, undefined, 'NA'],
    [true, true, 'Required'],
  ]) {
    test(`${flow}: ${required}/${optional} loads as ${expected} and survives save`, () => {
      const status = { name: 'Damaged', warehouseId: 7 };
      status[`reasonRequiredWhen${flow}`] = required;
      status[`reasonOptionalWhen${flow}`] = optional;
      const component = { currentInventoryStatus: status };
      read.call(component);
      assert.equal(component[`reasonWhen${flow}`], expected);
      save.call(component);
      assert.equal(status[`reasonRequiredWhen${flow}`], expected === 'Required');
      assert.equal(status[`reasonOptionalWhen${flow}`], expected === 'Optional');
      assert.equal(status.name, 'Damaged');
      assert.equal(status.warehouseId, 7);
    });
  }
}
test('mixed requirements stay independent when editing and saving', () => {
  const component = { currentInventoryStatus: {
    reasonOptionalWhenReceiving: true,
    reasonRequiredWhenProducing: true,
    reasonOptionalWhenAdjusting: true,
  } };
  read.call(component);
  assert.equal(component.reasonWhenReceiving, 'Optional');
  assert.equal(component.reasonWhenProducing, 'Required');
  assert.equal(component.reasonWhenAdjusting, 'Optional');
  save.call(component);
  read.call(component);
  assert.equal(component.reasonWhenReceiving, 'Optional');
  assert.equal(component.reasonWhenProducing, 'Required');
  assert.equal(component.reasonWhenAdjusting, 'Optional');
});
