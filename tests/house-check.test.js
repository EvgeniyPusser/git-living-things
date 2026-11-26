import test from 'node:test';
import assert from 'node:assert/strict';
import { starterModel, addNode, addLink } from '../house-model/graph.js';
import { assessElement, summary } from '../house-model/check.js';
import { fullLoopModel } from './fixtures/house.js';

test('starter is all red', () => {
  assert.deepEqual(summary(starterModel(0)), { green: 0, yellow: 0, red: 7, total: 7 });
});

test('full loop is green', () => {
  const result = assessElement(fullLoopModel(), 'W-1');
  assert.equal(result.color, 'green');
  assert.deepEqual(result.gaps, []);
});

test('unconnected sensor is yellow with notConnected', () => {
  const m = starterModel(0);
  const sensor = addNode(m, { type: 'sensor', kind: 'humidity' });
  addLink(m, { type: 'observes', from: sensor, to: 'W-2' });
  const result = assessElement(m, 'W-2');
  assert.equal(result.color, 'yellow');
  assert.ok(result.gaps.includes('notConnected'));
  assert.ok(!result.gaps.includes('noSensor'));
});

test('transmit cycle terminates', () => {
  const m = starterModel(0);
  const x = addNode(m, { type: 'chip' });
  const y = addNode(m, { type: 'chip' });
  const sensor = addNode(m, { type: 'sensor', kind: 'strain' });
  addLink(m, { type: 'transmits', from: x, to: y });
  addLink(m, { type: 'transmits', from: y, to: x });
  addLink(m, { type: 'transmits', from: sensor, to: x });
  addLink(m, { type: 'observes', from: sensor, to: 'W-1' });
  assert.equal(assessElement(m, 'W-1').continuous.b, false);
});

test('stiffening counts as temporary measure', () => {
  const m = starterModel(0);
  m.dna.stiffenMaxPercent = 20;
  assert.equal(assessElement(m, 'W-1').episodic.c, true);
});

test('sensor on the room counts for continuous sensing only', () => {
  const m = starterModel(0);
  const room = addNode(m, { type: 'space' });
  addLink(m, { type: 'contains', from: room, to: 'W-3' });
  const sensor = addNode(m, { type: 'sensor', kind: 'temperature' });
  addLink(m, { type: 'observes', from: sensor, to: room });
  const result = assessElement(m, 'W-3');
  assert.equal(result.continuous.a, true);
  assert.equal(result.episodic.a, false);
});

test('mobile sensor patrol counts for episodic sensing', () => {
  const m = starterModel(0);
  const mobile = addNode(m, { type: 'mobileSensor' });
  addLink(m, { type: 'patrols', from: mobile, to: 'S-1' });
  assert.equal(assessElement(m, 'S-1').episodic.a, true);
});
