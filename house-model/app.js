// Living House helper: steps, graph, assessment. State lives here; logic lives in graph/check/suggest.
import { NODE_TYPES, LINK_TYPES, SENSOR_CONTINUOUS, starterModel, addNode, addLink, removeNode, removeLink,
  setBinding, validateModel, findNode, isStructural } from './graph.js';
import { assessElement, assessModel, summary } from './check.js';
import { suggestions, label, nodeText } from './suggest.js';
import { tr, getLang, setLang, getTheme, setTheme } from './i18n.js';
import * as bridge from './bridge.js';
import { render as draw } from './view.js';
import { createView3d } from './view3d.js';

const STEPS = [
  { types: ['foundation', 'wall', 'column', 'beam', 'slab', 'roof', 'window', 'door', 'stair', 'site', 'building', 'storey', 'space'], links: ['supports', 'adjacent', 'contains'] },
  { types: ['sensor', 'mobileSensor', 'chip'], links: ['observes', 'patrols', 'transmits'] },
  { types: ['centre'], links: ['transmits', 'controls'], brain: true },
  { types: ['network', 'reserve'], links: ['serves', 'feeds'] },
  { types: ['material', 'device', 'measure', 'robot'], links: ['controls', 'actsOn', 'heals'] },
  { binding: true },
  { assessment: true }
];
const ACTIONS = ['open-window', 'heating', 'cooling', 'ventilation', 'dehumidifier', 'valve'];
const state = { model: starterModel(getLang()), step: 0, selected: null, positions: {}, message: '', armed: false, mode: 'graph' };
let view3d = null;
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const lang = () => getLang();
const fits = (node, list) => list.includes(node.type) || list.includes(NODE_TYPES[node.type].layer);
const option = (value, text, selected) => '<option value="' + esc(value) + '"' + (selected ? ' selected' : '') + '>' + esc(text) + '</option>';
// Locked while the passport's model is loading, so nothing typed meanwhile is lost or saved over it.
let editable = !bridge.readonly && !bridge.embedded;

function message(text) { state.message = text; $('msg').textContent = text; }

function nodeForm(step) {
  const type = state.formType && step.types.includes(state.formType) ? state.formType : step.types[0];
  const kinds = NODE_TYPES[type].kinds;
  return '<form class="row" data-form="node"><label>' + tr('type') + '<select name="type" data-act="form-type">' +
    step.types.map(t => option(t, label('type', t, lang()), t === type)).join('') + '</select></label>' +
    (kinds ? '<label>' + tr('kind') + '<select name="kind">' + kinds.map(k => option(k, label('kind', k, lang()))).join('') + '</select></label>' : '') +
    '<label>' + tr('nodeName') + '<input name="name" maxlength="80"></label><button>' + tr('add') + '</button></form>';
}

function linkForm(step) {
  const type = state.linkType && step.links.includes(state.linkType) ? state.linkType : step.links[0];
  const nodes = list => state.model.nodes.filter(node => fits(node, list)).map(node => option(node.id, nodeText(node, lang()))).join('');
  return '<form class="row" data-form="link"><label>' + tr('linkType') + '<select name="type" data-act="link-type">' +
    step.links.map(t => option(t, label('link', t, lang()), t === type)).join('') + '</select></label>' +
    '<label>' + tr('from') + '<select name="from">' + nodes(LINK_TYPES[type].from) + '</select></label>' +
    '<label>' + tr('to') + '<select name="to">' + nodes(LINK_TYPES[type].to) + '</select></label><button>' + tr('add') + '</button></form>';
}

function lists(step) {
  const nodes = state.model.nodes.filter(node => step.types.includes(node.type));
  const links = state.model.links.map((link, index) => ({ link, index })).filter(({ link }) => step.links.includes(link.type));
  const remove = (act, value) => editable ? ' <button class="small" data-act="' + act + '" data-value="' + esc(value) + '">' + tr('remove') + '</button>' : '';
  return '<h3>' + tr('nodes') + '</h3>' + (nodes.length ? '<ul>' + nodes.map(node => '<li><a href="#" data-act="select" data-value="' + esc(node.id) + '">' +
    esc(nodeText(node, lang())) + '</a>' + remove('remove-node', node.id) + '</li>').join('') + '</ul>' : '<p class="mut">' + tr('none') + '</p>') +
    '<h3>' + tr('links') + '</h3>' + (links.length ? '<ul>' + links.map(({ link, index }) => '<li>' + esc(link.from + ' ' + label('link', link.type, lang()) + ' ' + link.to) +
    remove('remove-link', index) + '</li>').join('') + '</ul>' : '<p class="mut">' + tr('none') + '</p>');
}

function brainPanel() {
  const c = state.model.constitution;
  const rule = r => r.kind === 'limit' ? tr('limit') + ': ' + label('kind', r.sensorKind, lang()) + ' ' + r.min + '…' + r.max
    : r.kind === 'forbid' ? tr('forbid') + ': ' + r.action + ' ' + tr('fromTime') + ' ' + r.from + ' ' + tr('toTime') + ' ' + r.to : tr('principle') + ': ' + r.text;
  const dis = editable ? '' : ' disabled';
  return '<h3>' + tr('dna') + '</h3><label>' + tr('stiffen') + '<input type="number" min="0" max="100" step="5" data-act="dna" value="' +
    esc(state.model.dna.stiffenMaxPercent) + '"' + dis + '></label>' +
    '<h3>' + tr('constitution') + ': ' + tr('priorities') + '</h3><ol>' + c.priorities.map((p, i) => '<li>' + esc(label('priority', p, lang())) +
    (i && editable ? ' <button class="small" data-act="priority-up" data-value="' + i + '">' + tr('up') + '</button>' : '') + '</li>').join('') + '</ol>' +
    '<h3>' + tr('rules') + '</h3>' + (c.rules.length ? '<ul>' + c.rules.map((r, i) => '<li>' + esc(rule(r)) +
    (editable ? ' <button class="small" data-act="remove-rule" data-value="' + i + '">' + tr('remove') + '</button>' : '') + '</li>').join('') + '</ul>' : '<p class="mut">' + tr('none') + '</p>') +
    (editable ? '<form class="row" data-form="limit"><label>' + tr('sensorKind') + '<select name="sensorKind">' + SENSOR_CONTINUOUS.map(k => option(k, label('kind', k, lang()))).join('') +
    '</select></label><label>' + tr('min') + '<input name="min" type="number" step="any" required></label><label>' + tr('max') +
    '<input name="max" type="number" step="any" required></label><button>' + tr('limit') + '</button></form>' +
    '<form class="row" data-form="forbid"><label>' + tr('action') + '<select name="action">' + ACTIONS.map(a => option(a, a)).join('') + '</select></label><label>' +
    tr('fromTime') + '<input name="from" type="time" required></label><label>' + tr('toTime') + '<input name="to" type="time" required></label><button>' + tr('forbid') + '</button></form>' +
    '<form class="row" data-form="principle"><label class="grow">' + tr('text') + '<input name="text" maxlength="300" required></label><button>' + tr('principle') + '</button></form>' : '');
}

function bindingPanel() {
  const nodes = state.model.nodes.filter(node => ['body', 'space'].includes(NODE_TYPES[node.type].layer));
  const dis = editable ? '' : ' disabled';
  return '<div class="scroll"><table><thead><tr><th></th><th>' + tr('file') + '</th><th>' + tr('ref') + '</th></tr></thead><tbody>' +
    nodes.map(node => '<tr><td>' + esc(nodeText(node, lang())) + '</td><td><input data-act="bind-file" data-value="' + esc(node.id) + '" value="' +
      esc(node.binding?.file) + '"' + dis + '></td><td><input data-act="bind-ref" data-value="' + esc(node.id) + '" value="' + esc(node.binding?.ref) + '"' + dis +
      '></td></tr>').join('') + '</tbody></table></div>';
}

function assessmentPanel() {
  const items = assessModel(state.model);
  const fields = tr('fields');
  const texts = suggestions(state.model, lang());
  return '<ul class="assess">' + items.map(item => '<li><span class="pill ' + item.color + '">' + tr(item.color) + '</span> <a href="#" data-act="select" data-value="' +
    esc(item.id) + '">' + esc(nodeText(findNode(state.model, item.id), lang())) + '</a>' +
    (item.gaps.length ? '<div class="mut">' + item.gaps.map(gap => esc(label('gap', gap, lang()))).join('; ') + '</div>' : '') + '</li>').join('') + '</ul>' +
    '<h3>' + tr('passportText') + '</h3>' + Object.entries(texts).map(([field, text]) => '<details><summary>' + esc(fields[field]) + '</summary><pre>' + esc(text) + '</pre></details>').join('');
}

function card() {
  const node = findNode(state.model, state.selected);
  if (!node) return '<p class="mut">' + tr('pick') + '</p>';
  const head = '<h2>' + esc(nodeText(node, lang())) + '</h2>';
  if (!isStructural(node)) {
    const links = state.model.links.filter(link => link.from === node.id || link.to === node.id);
    return head + '<ul>' + links.map(link => '<li>' + esc(link.from + ' ' + label('link', link.type, lang()) + ' ' + link.to) + '</li>').join('') + '</ul>';
  }
  const result = assessElement(state.model, node.id);
  const cond = tr('cond');
  const loop = (title, flags, names) => '<div class="loop"><h3>' + title + ' <span class="pill ' + (flags.closed ? 'green' : 'yellow') + '">' +
    tr(flags.closed ? 'loopClosed' : 'loopOpen') + '</span></h3><ul class="checks">' + ['a', 'b', 'c', 'd', 'e'].map((key, i) =>
    '<li class="' + (flags[key] ? 'yes' : 'no') + '">' + (flags[key] ? '✓ ' : '✗ ') + esc(names[i]) + '</li>').join('') + '</ul></div>';
  return head + '<span class="pill ' + result.color + '">' + tr(result.color) + '</span>' +
    loop(tr('continuous'), result.continuous, cond[0]) + loop(tr('episodic'), result.episodic, cond[1]);
}

function render() {
  const step = STEPS[state.step];
  const counts = summary(state.model);
  $('title').textContent = tr('title');
  $('intro').textContent = tr('intro');
  $('name').value = state.model.meta.name;
  $('name').disabled = !editable;
  $('score').innerHTML = ['green', 'yellow', 'red'].map(key => '<div><b class="' + key + '">' + counts[key] + '</b><span>' + tr(key) + '</span></div>').join('');
  for (const key of ['green', 'yellow', 'red']) $('lg-' + key).textContent = tr('legend' + key);
  $('tabs').innerHTML = tr('steps').map((name, i) => '<button role="tab" aria-selected="' + (i === state.step) + '" data-step="' + i + '">' + esc(name) + '</button>').join('');
  $('help').textContent = tr('stepHelp')[state.step];
  $('panel').innerHTML = step.assessment ? assessmentPanel() : step.binding ? bindingPanel() :
    (editable ? '<h3>' + tr('addNode') + '</h3>' + nodeForm(step) + '<h3>' + tr('addLink') + '</h3>' + linkForm(step) : '') +
    (step.brain ? brainPanel() : '') + lists(step);
  $('card').innerHTML = card();
  $('save').hidden = !editable;
  $('save').textContent = tr('save');
  $('open').hidden = bridge.embedded;
  $('open-label').textContent = tr('open');
  $('reset').hidden = !editable;
  $('reset').textContent = state.armed ? tr('confirmReset') : tr('reset');
  $('lang').textContent = lang() ? 'Русский' : 'English';
  $('theme').textContent = getTheme() === 'dark' ? tr('light') : tr('dark');
  $('readonly').hidden = !bridge.readonly;
  $('readonly').textContent = tr('readonly');
  $('hint').textContent = bridge.embedded ? '' : tr('notEmbeddedHint');
  $('msg').textContent = state.message;
  redraw();
}

function redraw() {
  const solid = state.mode === '3d';
  $('modes').innerHTML = ['graph', '3d'].map(mode => '<button data-mode="' + mode + '" aria-pressed="' + (state.mode === mode) + '">' +
    tr(mode === '3d' ? 'mode3d' : 'modeGraph') + '</button>').join('');
  $('svg').toggleAttribute('hidden', solid); // SVG elements have no .hidden property
  $('three').hidden = !solid;
  $('note3d').hidden = !solid;
  $('note3d').textContent = tr('note3d');
  const onSelect = id => { state.selected = id; render(); };
  if (!solid) return draw($('svg'), state.model, assessModel(state.model), { selected: state.selected, positions: state.positions, onSelect });
  if (view3d) return view3d.then(view => view.update(state.model, state.selected));
  view3d = createView3d($('three'), { onSelect });
  view3d.then(view => view.update(state.model, state.selected), () => { view3d = null; state.mode = 'graph'; message(tr('no3d')); redraw(); });
}

function change(fn) {
  fn();
  state.message = '';
  render();
}

document.addEventListener('submit', event => {
  const form = event.target.closest('form[data-form]');
  if (!form || !editable) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const kind = form.dataset.form;
  if (kind === 'node') change(() => { state.selected = addNode(state.model, { type: data.type, kind: data.kind, name: data.name.trim() }); });
  if (kind === 'link') {
    const result = addLink(state.model, { type: data.type, from: data.from, to: data.to });
    if (!result.ok) return message(tr(result.error));
    change(() => {});
  }
  const rules = state.model.constitution.rules;
  const id = 'c-' + (Math.max(0, ...rules.map(r => Number(String(r.id).slice(2)) || 0)) + 1);
  if (kind === 'limit') change(() => rules.push({ id, kind: 'limit', sensorKind: data.sensorKind, min: Number(data.min), max: Number(data.max) }));
  if (kind === 'forbid') change(() => rules.push({ id, kind: 'forbid', action: data.action, from: data.from, to: data.to }));
  if (kind === 'principle') change(() => rules.push({ id, kind: 'principle', text: data.text.trim() }));
});

document.addEventListener('click', event => {
  const mode = event.target.closest('[data-mode]');
  if (mode) { state.mode = mode.dataset.mode; return redraw(); }
  const tab = event.target.closest('[data-step]');
  if (tab) return change(() => { state.step = Number(tab.dataset.step); });
  const act = event.target.closest('[data-act]');
  if (!act || act.tagName === 'SELECT' || act.tagName === 'INPUT') return;
  event.preventDefault();
  const value = act.dataset.value;
  if (act.dataset.act === 'select') return change(() => { state.selected = value; });
  if (!editable) return;
  if (act.dataset.act === 'remove-node') change(() => { removeNode(state.model, value); delete state.positions[value]; });
  if (act.dataset.act === 'remove-link') change(() => removeLink(state.model, Number(value)));
  if (act.dataset.act === 'remove-rule') change(() => state.model.constitution.rules.splice(Number(value), 1));
  if (act.dataset.act === 'priority-up') change(() => {
    const p = state.model.constitution.priorities, i = Number(value);
    [p[i - 1], p[i]] = [p[i], p[i - 1]];
  });
});

document.addEventListener('change', event => {
  const act = event.target.dataset.act;
  if (act === 'form-type') { state.formType = event.target.value; render(); }
  if (act === 'link-type') { state.linkType = event.target.value; render(); }
  if (!editable) return;
  if (act === 'dna') change(() => { state.model.dna.stiffenMaxPercent = Math.max(0, Math.min(100, Number(event.target.value) || 0)); });
  if (act === 'bind-file' || act === 'bind-ref') {
    const node = findNode(state.model, event.target.dataset.value);
    const binding = { file: node.binding?.file || '', ref: node.binding?.ref || '', [act === 'bind-file' ? 'file' : 'ref']: event.target.value.trim() };
    change(() => setBinding(state.model, node.id, binding));
  }
});

$('name').addEventListener('change', event => { state.model.meta.name = event.target.value.trim(); });
$('lang').onclick = () => { setLang(lang() ? 0 : 1); render(); };
$('theme').onclick = () => { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); render(); };
$('reset').onclick = () => {
  if (!state.armed) { state.armed = true; return render(); }
  state.armed = false;
  change(() => { state.model = starterModel(lang()); state.positions = {}; state.selected = null; });
};
$('save').onclick = async () => {
  state.model.meta.updated = new Date().toISOString();
  message(tr('saving'));
  try {
    await bridge.save(state.model);
    message(tr('saved'));
  } catch (error) {
    message(error.message === 'portalNoAnswer' ? tr('portalNoAnswer') : error.message);
  }
};
$('file').onchange = async event => {
  const file = event.target.files[0];
  event.target.value = '';
  if (!file) return;
  try {
    const model = await bridge.openFile(file);
    const check = validateModel(model);
    if (!check.ok) return message(tr(check.error));
    change(() => { state.model = model; state.positions = {}; state.selected = null; });
  } catch {
    message(tr('notModel'));
  }
};

new ResizeObserver(redraw).observe($('svg'));
setLang(lang());
setTheme(getTheme());
render();
if (bridge.embedded) message(tr('loading'));
bridge.load().then(model => {
  editable = !bridge.readonly;
  if (!model) return change(() => {});
  const check = validateModel(model);
  if (!check.ok) { render(); return message(tr(check.error)); }
  change(() => { state.model = model; state.positions = {}; state.selected = null; });
}, error => {
  // No answer: stay locked so the starter house cannot be saved over the passport's model.
  if (error.message === 'portalNoAnswer') return message(tr('portalNoAnswer'));
  editable = !bridge.readonly;
  render();
  message(error.message);
});
