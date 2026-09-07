import test from 'node:test';
import assert from 'node:assert/strict';
import { frameGeometry } from '../lib/frame.ts';
test('STR uses identical units and ratios cannot identify frame size', () => {
  assert.equal(frameGeometry(540, 360).str, 1.5);
  assert.equal(frameGeometry(600, 400).str, 1.5);
  assert.equal(frameGeometry(54, 36).str, 1.5);
  assert.notEqual(frameGeometry(540, 360).handReach, frameGeometry(600, 400).handReach);
});
test('stack and reach move independent coordinates and have opposite effects on STR', () => {
  const base = frameGeometry(570, 385);
  assert.ok(frameGeometry(610, 385).str > base.str);
  assert.ok(frameGeometry(570, 405).str < base.str);
  assert.equal(frameGeometry(610, 385).handReach, base.handReach);
  assert.equal(frameGeometry(570, 405).handStack, base.handStack);
});
test('cockpit adjustments change hand location without changing frame STR', () => {
  const base = frameGeometry(570, 385, 0, 100);
  const raised = frameGeometry(570, 385, 40, 100);
  assert.equal(raised.str, base.str);
  assert.ok(raised.handStack > base.handStack);
  assert.ok(raised.handReach < base.handReach);
  assert.ok(frameGeometry(570, 385, 0, 130).handReach > base.handReach);
  assert.throws(() => frameGeometry(570, 0));
});
