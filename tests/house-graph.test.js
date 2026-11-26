import test from 'node:test';
import assert from 'node:assert/strict';
import { NODE_TYPES, starterModel, addNode, addLink, removeNode, validateModel } from '../house-model/graph.js';

const layerOf = node => NODE_TYPES[node.type].layer;

test('starter has body only', () => {
  const m = starterModel(0);
  assert.ok(m.nodes.every(node => ['space', 'body'].includes(layerOf(node))));
  const types = m.nodes.map(node => node.type);
  assert.ok(types.includes('foundation'));
  assert.ok(types.includes('wall'));
  assert.ok(types.includes('roof'));
});

test('addLink checks vocabulary', () => {
  const m = starterModel(0);
  assert.deepEqual(addLink(m, { type: 'observes', from: 'W-1', to: 'F-1' }), { ok: false, error: 'badLink' });
  const sensor = addNode(m, { type: 'sensor', kind: 'strain' });
  assert.deepEqual(addLink(m, { type: 'observes', from: sensor, to: 'W-1' }), { ok: true });
  assert.deepEqual(addLink(m, { type: 'observes', from: sensor, to: 'W-1' }), { ok: false, error: 'duplicate' });
  assert.deepEqual(addLink(m, { type: 'observes', from: sensor, to: 'NOPE' }), { ok: false, error: 'missingNode' });
});

test('addNode gives unique ids', () => {
  const m = starterModel(0);
  const a = addNode(m, { type: 'wall' });
  const b = addNode(m, { type: 'wall' });
  assert.notEqual(a, b);
  assert.equal(new Set(m.nodes.map(node => node.id)).size, m.nodes.length);
});

test('removeNode drops its links', () => {
  const m = starterModel(0);
  const sensor = addNode(m, { type: 'sensor', kind: 'strain' });
  addLink(m, { type: 'observes', from: sensor, to: 'W-1' });
  removeNode(m, sensor);
  assert.ok(m.nodes.every(node => node.id !== sensor));
  assert.ok(m.links.every(link => link.from !== sensor && link.to !== sensor));
});

test('refuses old version', () => {
  assert.deepEqual(validateModel({ format: 'living-house-model', version: '0.1' }), { ok: false, error: 'oldVersion' });
  assert.deepEqual(validateModel({}), { ok: false, error: 'notModel' });
  const m = starterModel(0);
  m.links.push({ type: 'supports', from: 'W-1', to: 'GONE' });
  assert.deepEqual(validateModel(m), { ok: false, error: 'broken' });
});

test('round trip', () => {
  assert.deepEqual(validateModel(JSON.parse(JSON.stringify(starterModel(1)))), { ok: true });
});

test('refuses models that would crash the helper', () => {
  const noMeta = starterModel(0);
  delete noMeta.meta;
  assert.deepEqual(validateModel(noMeta), { ok: false, error: 'broken' });
  const nullRule = starterModel(0);
  nullRule.constitution.rules.push(null);
  assert.deepEqual(validateModel(nullRule), { ok: false, error: 'broken' });
  const oddRule = starterModel(0);
  oddRule.constitution.rules.push({ id: 'c-1', kind: 'wish' });
  assert.deepEqual(validateModel(oddRule), { ok: false, error: 'broken' });
});
