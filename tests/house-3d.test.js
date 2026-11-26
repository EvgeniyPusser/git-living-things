import test from 'node:test';
import assert from 'node:assert/strict';
import { starterModel, addNode, addLink } from '../house-model/graph.js';
import { layout3d } from '../house-model/house3d.js';
import { fullLoopModel } from './fixtures/house.js';

const byId = (items, id) => items.find(item => item.id === id);
const top = item => item.y + item.h / 2;
const bottom = item => item.y - item.h / 2;

test('starter house stacks foundation, walls, slab and roof', () => {
  const items = layout3d(starterModel(0));
  const f = byId(items, 'F-1'), w = byId(items, 'W-1'), s = byId(items, 'S-1'), r = byId(items, 'R-1');
  assert.ok(f && w && s && r);
  assert.ok(top(f) <= bottom(w) + 1e-9);
  assert.ok(bottom(s) >= top(w) - 1e-9);
  assert.ok(r.y > s.y);
  assert.equal(r.shape, 'roof');
});

test('four walls take four different sides', () => {
  const items = layout3d(starterModel(0));
  const centres = ['W-1', 'W-2', 'W-3', 'W-4'].map(id => byId(items, id)).map(w => w.x.toFixed(2) + ',' + w.z.toFixed(2));
  assert.equal(new Set(centres).size, 4);
});

test('extra walls still get their own places', () => {
  const m = starterModel(0);
  addNode(m, { type: 'wall' });
  addNode(m, { type: 'wall' });
  const walls = layout3d(m).filter(item => item.type === 'wall');
  assert.equal(walls.length, 6);
  assert.equal(new Set(walls.map(w => w.x.toFixed(2) + ',' + w.z.toFixed(2))).size, 6);
});

test('each slab adds a storey', () => {
  const m = starterModel(0);
  addNode(m, { type: 'slab' });
  const slabs = layout3d(m).filter(item => item.type === 'slab').map(s => s.y).sort((a, b) => a - b);
  assert.equal(slabs.length, 2);
  assert.ok(slabs[1] > slabs[0]);
  assert.ok(byId(layout3d(m), 'R-1').y > slabs[1]);
});

test('sensor sits on the element it observes and centre is underground', () => {
  const items = layout3d(fullLoopModel(0));
  const sensor = items.find(item => item.type === 'sensor');
  const wall = byId(items, 'W-1');
  assert.equal(sensor.shape, 'sphere');
  assert.ok(Math.abs(sensor.x - wall.x) <= wall.w / 2 + 0.6 && Math.abs(sensor.z - wall.z) <= wall.d / 2 + 0.6);
  const centre = items.find(item => item.type === 'centre');
  assert.ok(centre.y < 0);
});

test('networks become pipes to what they serve', () => {
  const pipes = layout3d(fullLoopModel(0)).filter(item => item.shape === 'pipe');
  assert.ok(pipes.some(pipe => pipe.from === 'N-1' && pipe.to === 'W-1'));
});

test('structural parts carry their assessment colour', () => {
  const items = layout3d(fullLoopModel(0));
  assert.equal(byId(items, 'W-1').color, 'green');
  assert.equal(byId(items, 'W-2').color, 'red');
});

test('house without walls or roof does not crash', () => {
  const m = starterModel(0);
  m.nodes = m.nodes.filter(node => node.type === 'foundation');
  m.links = [];
  const sensor = addNode(m, { type: 'sensor', kind: 'crack' });
  addLink(m, { type: 'observes', from: sensor, to: 'F-1' });
  assert.ok(layout3d(m).length >= 2);
});
