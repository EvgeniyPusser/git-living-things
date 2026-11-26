import test from 'node:test';
import assert from 'node:assert/strict';
import { starterModel } from '../house-model/graph.js';
import { SUGGESTED_FIELDS, suggestions, applySuggestion } from '../house-model/suggest.js';
import { fullLoopModel } from './fixtures/house.js';

test('empty model suggests structure and names the missing sensors', () => {
  const result = suggestions(starterModel(0), 0);
  assert.ok(Object.keys(result).includes('structureProject'));
  assert.match(result.structureProject, /W-1/);
  assert.match(result.minimumSensors, /Не предусмотрено/);
  assert.ok(Object.keys(result).every(key => SUGGESTED_FIELDS.includes(key)));
});

test('full loop fixture fills the living sections', () => {
  const result = suggestions(fullLoopModel(1), 1);
  assert.match(result.homeostasisControl, /W-1/);
  assert.match(result.selfRecovery, /crack healing/i);
  assert.match(result.constitution, /safety/i);
  assert.match(result.nervousSystem, /C-1/);
});

test('applySuggestion never overwrites', () => {
  assert.equal(applySuggestion('mine', 'x', 'insert'), 'mine');
  assert.equal(applySuggestion('', 'x', 'insert'), 'x');
  assert.equal(applySuggestion('  ', 'x', 'insert'), 'x');
  assert.equal(applySuggestion('mine\n', 'x', 'append'), 'mine\n\nx');
  assert.equal(applySuggestion('', 'x', 'append'), 'x');
});

test('only the root gap of each loop is reported', () => {
  const result = suggestions(starterModel(0), 0);
  assert.equal(result.nervousSystem, undefined);
  assert.equal(result.selfRecovery, undefined);
});
