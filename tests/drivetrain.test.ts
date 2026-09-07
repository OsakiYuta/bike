import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAINRINGS, CASSETTES, WHEELS, PRESETS, calculate } from '../lib/drivetrain.ts';

test('known 50/11 road gearing at 90 rpm covers 9.682 metres per turn and 52.28 km/h', () => {
  const road = calculate(50, 11, WHEELS[0], 90);
  assert.ok(Math.abs(road.development - 9.681817359699453) < .00001);
  assert.equal(road.speed.toFixed(1), '52.3');
  assert.ok(Math.abs(road.wheelRpm - 409.0909090909) < .000001);
});
test('gearing changes wheel speed, and a wider low end does not change the same 11T top gear', () => {
  const narrow = calculate(50, CASSETTES[0].cogs[0], WHEELS[0], 90);
  const wide = calculate(50, CASSETTES[3].cogs[0], WHEELS[0], 90);
  assert.equal(narrow.speed, wide.speed);
  assert.ok(calculate(32, 50, WHEELS[1], 90).speed < calculate(32, 11, WHEELS[1], 90).speed);
  assert.ok(calculate(50, 10, WHEELS[0], 90).speed > narrow.speed);
});
test('zero cadence, scaling, and all supported component combinations stay finite', () => {
  for (const front of CHAINRINGS) for (const cassette of CASSETTES) for (const rear of cassette.cogs) for (const wheel of WHEELS) {
    assert.equal(calculate(front, rear, wheel, 0).speed, 0);
    const normal = calculate(front, rear, wheel, 70);
    const twice = calculate(front, rear, wheel, 140);
    assert.equal(twice.speed, normal.speed * 2);
    assert.ok(Number.isFinite(twice.speed) && twice.speed > 0);
  }
});
test('presets reference available parts and distinguish bead-seat diameter from wheel circumference', () => {
  for (const p of PRESETS) {
    assert.ok(CHAINRINGS.includes(p.front));
    assert.ok(CASSETTES.some(c => c.id === p.cassette));
    assert.ok(WHEELS.some(w => w.id === p.wheel));
  }
  assert.equal(WHEELS[0].bsd, WHEELS[1].bsd);
  assert.ok(calculate(50, 11, WHEELS[1], 90).speed > calculate(50, 11, WHEELS[0], 90).speed);
  assert.ok(calculate(50, 11, WHEELS[3], 90).speed < calculate(50, 11, WHEELS[0], 90).speed);
});
