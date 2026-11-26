// Layered drawing of the house graph. Positions are view-only: they never enter the saved model.
import { NODE_TYPES } from './graph.js';
import { label } from './suggest.js';
import { getLang, tr } from './i18n.js';

const BODY_ROW = { roof: 1, slab: 2, beam: 2, wall: 3, column: 3, window: 3, door: 3, stair: 3, foundation: 4 };
const LIVING_COLUMN = { nerves: 0, brain: 1, networks: 2, reserves: 2, actuators: 3 };
const COLOR = { green: 'var(--ok)', yellow: 'var(--part)', red: 'var(--bad)' };
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function layout(model, W, H) {
  const living = model.nodes.filter(node => NODE_TYPES[node.type].layer in LIVING_COLUMN);
  const bodyW = living.length ? W * (W < 560 ? 0.5 : 0.55) : W;
  const pos = {};
  const rows = [[], [], [], [], []];
  for (const node of model.nodes) {
    const layer = NODE_TYPES[node.type].layer;
    if (layer === 'space') rows[0].push(node);
    else if (layer === 'body') rows[BODY_ROW[node.type]].push(node);
  }
  rows.forEach((row, r) => {
    const gap = (bodyW - 16) / Math.max(1, row.length);
    const w = Math.max(36, Math.min(r === 0 ? 100 : 130, gap - 8));
    row.forEach((node, i) => { pos[node.id] = { x: 8 + gap * i + gap / 2, y: 34 + r * (H - 64) / 4, w, h: r === 0 ? 24 : 32 }; });
  });
  const columns = [[], [], [], []];
  for (const node of living) columns[LIVING_COLUMN[NODE_TYPES[node.type].layer]].push(node);
  const colW = (W - bodyW - 8) / 4;
  columns.forEach((column, c) => {
    const step = (H - 50) / Math.max(1, column.length);
    column.forEach((node, i) => {
      pos[node.id] = { x: bodyW + colW * (c + 0.5), y: 36 + step * i + step / 2, w: colW - 8, h: Math.min(26, step - 4), living: true };
    });
  });
  return { pos, bodyW, colW, living: living.length > 0 };
}

const fit = (text, width) => {
  const room = Math.max(2, Math.floor(width / 7));
  return text.length > room ? text.slice(0, room - 1) + '…' : text;
};

export function render(svg, model, assessment, view) {
  const W = svg.clientWidth, H = svg.clientHeight;
  if (!W || !H) return;
  const lang = getLang();
  const { pos, bodyW, colW, living } = layout(model, W, H);
  for (const [id, p] of Object.entries(view.positions)) if (pos[id]) Object.assign(pos[id], { x: p.x * W, y: p.y * H });
  const colorOf = Object.fromEntries(assessment.map(item => [item.id, item.color]));
  let out = '';
  for (const link of model.links) {
    const a = pos[link.from], b = pos[link.to];
    if (!a || !b) continue;
    const quiet = link.type === 'contains';
    const livingLink = a.living || b.living;
    out += '<line x1="' + a.x + '" y1="' + a.y + '" x2="' + b.x + '" y2="' + b.y + '" stroke="' + (livingLink ? 'var(--teal)' : 'var(--mut)') +
      '" stroke-opacity="' + (quiet ? 0.18 : livingLink ? 0.5 : 0.7) + '" stroke-width="' + (livingLink ? 1.2 : 2) + '"' +
      (quiet ? ' stroke-dasharray="3 4"' : '') + '><title>' + esc(link.from + ' ' + label('link', link.type, lang) + ' ' + link.to) + '</title></line>';
  }
  for (const node of model.nodes) {
    const p = pos[node.id];
    if (!p) continue;
    const color = colorOf[node.id];
    const selected = node.id === view.selected;
    const name = node.name || (node.kind ? label('kind', node.kind, lang) : label('type', node.type, lang));
    const text = fit(p.w < 80 ? node.id : node.id + ' ' + name, p.w - 6);
    const fill = color ? COLOR[color] : p.living ? 'var(--panel)' : 'var(--line)';
    out += '<g class="node" data-id="' + esc(node.id) + '" tabindex="0" role="button" aria-label="' + esc(node.id + ' ' + name) + '">' +
      '<rect x="' + (p.x - p.w / 2) + '" y="' + (p.y - p.h / 2) + '" width="' + p.w + '" height="' + p.h + '" rx="' + (p.living ? p.h / 2 : 6) +
      '" fill="' + fill + '" stroke="' + (selected ? 'var(--ink)' : p.living ? 'var(--teal)' : 'none') + '" stroke-width="' + (selected ? 3 : 1.5) + '"/>' +
      '<text x="' + p.x + '" y="' + (p.y + 4) + '" text-anchor="middle"' + (color ? ' class="in"' : '') + '>' + esc(text) + '</text>' +
      '<title>' + esc(node.id + ' · ' + label('type', node.type, lang) + (node.kind ? ' · ' + label('kind', node.kind, lang) : '') + (node.name ? ' · ' + node.name : '')) + '</title></g>';
  }
  if (W >= 560) {
    const heads = tr('layers');
    out += '<text class="head" x="10" y="14">' + esc(heads[1]) + '</text>';
    if (living) [2, 3, 4, 6].forEach((head, c) => {
      out += '<text class="head" x="' + (bodyW + colW * (c + 0.5)) + '" y="14" text-anchor="middle">' + esc(heads[head]) + '</text>';
    });
  }
  svg.innerHTML = out;

  for (const g of svg.querySelectorAll('.node')) {
    const id = g.dataset.id;
    g.onkeydown = event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); view.onSelect(id); } };
    g.onpointerdown = event => {
      const box = svg.getBoundingClientRect(), start = { x: event.clientX, y: event.clientY };
      let moved = false;
      g.setPointerCapture(event.pointerId);
      g.onpointermove = move => {
        if (!moved && Math.hypot(move.clientX - start.x, move.clientY - start.y) < 4) return;
        moved = true;
        g.setAttribute('transform', 'translate(' + (move.clientX - start.x) + ' ' + (move.clientY - start.y) + ')');
        view.positions[id] = { x: (pos[id].x + move.clientX - start.x) / W, y: (pos[id].y + move.clientY - start.y) / H };
      };
      // Redraw once the drag ends: re-rendering mid-drag would destroy the captured element.
      g.onpointerup = () => { g.onpointermove = null; if (moved) render(svg, model, assessment, view); else view.onSelect(id); };
    };
  }
}
