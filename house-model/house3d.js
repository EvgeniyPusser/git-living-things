// Schematic 3D layout of any house graph: shows where each node of the graph sits in a house.
// Proportions are fixed and illustrative (not the client's dimensions). Pure: no DOM, no Three.js.
// Units: metres-like; y up, 0 = ground; the plan is centred on x = 0, z = 0.
import { NODE_TYPES } from './graph.js';
import { assessModel } from './check.js';

const W = 10, D = 8, STOREY = 3, SLAB = 0.3, WALL = 0.3, ROOF = 2.2;

export function layout3d(m) {
  const items = [];
  const place = new Map();
  const of = type => m.nodes.filter(node => node.type === type);
  const colour = Object.fromEntries(assessModel(m).map(item => [item.id, item.color]));
  const add = item => { items.push(item); place.set(item.id, item); return item; };
  const box = (node, x, y, z, w, h, d, extra = {}) =>
    add({ id: node.id, type: node.type, kind: node.kind, shape: 'box', x, y, z, w, h, d, color: colour[node.id], ...extra });

  const storeys = Math.max(1, of('slab').length);
  const height = storeys * STOREY;
  const wallTop = height - SLAB; // the top slab rests on the walls

  // Foundations share the plan in strips along x.
  const foundations = of('foundation');
  foundations.forEach((node, i) => {
    const w = W / foundations.length;
    box(node, -W / 2 + w * (i + 0.5), -0.3, 0, w - 0.05, 0.6, D);
  });

  // Walls go round the perimeter: front, right, back, left, then subdivide sides.
  const walls = of('wall');
  const sides = [[], [], [], []];
  walls.forEach((node, i) => sides[i % 4].push(node));
  sides.forEach((list, side) => list.forEach((node, i) => {
    const along = side % 2 === 0 ? W : D;
    const piece = along / list.length;
    const t = -along / 2 + piece * (i + 0.5);
    const sign = side < 2 ? 1 : -1;
    if (side % 2 === 0) box(node, t * sign, wallTop / 2, sign * D / 2, piece - 0.05, wallTop, WALL);
    else box(node, sign * W / 2, wallTop / 2, t * sign, WALL, wallTop, piece - 0.05);
  }));

  of('column').forEach((node, i, all) => box(node, -W / 2 + W * (i + 1) / (all.length + 1), wallTop / 2, 0, 0.4, wallTop, 0.4));
  of('beam').forEach((node, i, all) => box(node, 0, wallTop - 0.2, -D / 2 + D * (i + 1) / (all.length + 1), W - 0.4, 0.4, 0.3));
  of('slab').forEach((node, i) => box(node, 0, STOREY * (i + 1) - SLAB / 2, 0, W - 0.2, SLAB, D - 0.2));
  of('roof').forEach((node, i, all) => {
    const w = (W + 0.6) / all.length;
    box(node, -(W + 0.6) / 2 + w * (i + 0.5), height + ROOF / 2, 0, w - 0.05, ROOF, D + 0.6, { shape: 'roof' });
  });
  of('stair').forEach((node, i) => box(node, W / 2 - 1.2 - i * 1.4, height / 2, -D / 2 + 1.2, 1, height, 1.6));

  // Openings sit on walls in order.
  const openings = [...of('window'), ...of('door')];
  openings.forEach((node, i) => {
    const wall = walls.length ? place.get(walls[i % walls.length].id) : null;
    const isDoor = node.type === 'door';
    const h = isDoor ? 2.1 : 1.2, y = isDoor ? 1.05 : 1.6 + STOREY * Math.floor(i / Math.max(1, walls.length) % storeys);
    if (!wall) return box(node, -W / 2 + 1 + i * 1.4, y, D / 2, 1, h, 0.1);
    const across = wall.w > wall.d;
    box(node, wall.x, y, wall.z, across ? Math.min(1.2, wall.w * 0.6) : 0.4, h, across ? 0.4 : Math.min(1.2, wall.d * 0.6));
  });

  // Point on the outer side of a placed part, used to hang nerves and organs on it.
  const crowd = new Map();
  function anchor(id, lift = 0) {
    const part = place.get(id);
    if (!part) return null;
    const n = crowd.get(id) || 0;
    crowd.set(id, n + 1);
    const spread = (n % 4) * 0.6 - 0.9, rise = Math.floor(n / 4) * 0.6;
    if (part.type === 'wall') {
      const across = part.w > part.d;
      const out = across ? Math.sign(part.z) || 1 : Math.sign(part.x) || 1;
      return across ? { x: part.x + spread, y: Math.min(part.y + 0.5 + rise + lift, part.y + part.h / 2 - 0.3), z: part.z + out * (WALL / 2 + 0.25) }
        : { x: part.x + out * (WALL / 2 + 0.25), y: Math.min(part.y + 0.5 + rise + lift, part.y + part.h / 2 - 0.3), z: part.z + spread };
    }
    if (part.type === 'foundation') return { x: part.x + spread, y: part.y + rise + lift, z: D / 2 + 0.35 };
    return { x: part.x + spread, y: part.y + part.h / 2 + 0.25 + rise + lift, z: part.z + (part.type === 'roof' ? D / 4 : 0) };
  }
  let loose = 0;
  const looseSpot = () => ({ x: -W / 2 + (loose++) * 1, y: -2.6, z: D / 2 + 2 });
  const linked = (type, from) => m.links.filter(link => link.type === type && link.from === from).map(link => link.to);
  const linkedTo = (type, to) => m.links.filter(link => link.type === type && link.to === to).map(link => link.from);
  const small = (node, at, shape, size = 0.35) => add({ id: node.id, type: node.type, kind: node.kind, shape, x: at.x, y: at.y, z: at.z, w: size, h: size, d: size });

  // Underground brain and stocks.
  of('centre').forEach((node, i, all) => add({ id: node.id, type: 'centre', shape: 'box', x: (i - (all.length - 1) / 2) * 2.2, y: -1.6, z: 0, w: 1.4, h: 1, d: 1.4 }));
  of('reserve').forEach((node, i) => add({ id: node.id, type: 'reserve', kind: node.kind, shape: 'tank', x: -W / 2 + 1.2 + i * 1.6, y: -1.8, z: -D / 2 + 1.4, w: 1, h: 1.2, d: 1 }));
  of('network').forEach((node, i) => {
    const source = [...linkedTo('feeds', node.id)].map(id => place.get(id)).find(Boolean);
    const at = source ? { x: source.x + 0.9, y: source.y + 0.3 * (i + 1) - 0.6, z: source.z + 0.9 } : { x: W / 2 + 1.2, y: -1 - i * 0.5, z: -D / 2 + 1 + i * 0.8 };
    add({ id: node.id, type: 'network', kind: node.kind, shape: 'box', ...at, w: 0.5, h: 0.5, d: 0.5 });
  });

  // Nerves on the parts they watch.
  for (const node of of('sensor')) {
    const target = linked('observes', node.id).find(id => place.has(id));
    small(node, (target && anchor(target)) || looseSpot(), 'sphere', 0.32);
  }
  for (const node of of('mobileSensor')) {
    const target = linked('patrols', node.id).find(id => place.has(id));
    small(node, (target && anchor(target, 0.3)) || looseSpot(), 'sphere', 0.42);
  }
  for (const node of of('chip')) {
    const from = linkedTo('transmits', node.id).map(id => place.get(id)).find(Boolean);
    small(node, from ? { x: from.x * 0.7, y: Math.max(0.2, from.y * 0.5), z: from.z * 0.7 } : looseSpot(), 'box', 0.3);
  }

  // Organs at the parts they act on or heal; robots wait by their centre.
  for (const type of ['material', 'device', 'measure', 'robot']) {
    for (const node of of(type)) {
      const target = [...linked('actsOn', node.id), ...linked('heals', node.id)].find(id => place.has(id));
      const boss = linkedTo('controls', node.id).map(id => place.get(id)).find(Boolean);
      const at = (target && anchor(target)) || (boss && { x: boss.x + 1.2, y: boss.y, z: boss.z + 1 }) || looseSpot();
      small(node, at, type === 'measure' && node.kind === 'prop' ? 'post' : type === 'robot' ? 'sphere' : 'box', type === 'robot' ? 0.5 : 0.35);
    }
  }

  // Pipes and nerve lines between placed points.
  const centreOf = id => { const p = place.get(id); return p && { x: p.x, y: p.y, z: p.z }; };
  for (const link of m.links) {
    let shape = null;
    if (link.type === 'serves' || link.type === 'feeds') shape = 'pipe';
    if (['transmits', 'controls', 'observes', 'patrols', 'actsOn', 'heals'].includes(link.type)) shape = 'line';
    if (!shape) continue;
    const a = centreOf(link.from), b = centreOf(link.to);
    if (!a || !b) continue;
    items.push({ id: link.type + ':' + link.from + '>' + link.to, type: link.type, shape, from: link.from, to: link.to, points: [a, b],
      kind: NODE_TYPES[m.nodes.find(node => node.id === link.from)?.type]?.layer });
  }
  return items;
}
