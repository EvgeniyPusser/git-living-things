// Living House model 1.0: a topological graph of the house, with no sizes or shapes.
// Body words follow IFC (ISO 16739) and W3C BOT; nerves and control follow Brick Schema;
// the living layer (centres, DNA, repair network, healing) comes from the Living Things concept.
// Pure module: no DOM, used by the helper, the passport editor and the tests.

export const FORMAT = 'living-house-model';
export const VERSION = '1.0';

const SENSOR_KINDS = ['strain', 'crack', 'load', 'tilt', 'integrity', 'temperature', 'humidity', 'co2', 'leak'];

export const NODE_TYPES = {
  site: { layer: 'space', prefix: 'SITE' },
  building: { layer: 'space', prefix: 'B' },
  storey: { layer: 'space', prefix: 'ST' },
  space: { layer: 'space', prefix: 'SP' },
  foundation: { layer: 'body', prefix: 'F', structural: true },
  wall: { layer: 'body', prefix: 'W', structural: true },
  column: { layer: 'body', prefix: 'COL', structural: true },
  beam: { layer: 'body', prefix: 'BM', structural: true },
  slab: { layer: 'body', prefix: 'S', structural: true },
  roof: { layer: 'body', prefix: 'R', structural: true },
  window: { layer: 'body', prefix: 'WIN' },
  door: { layer: 'body', prefix: 'DR' },
  stair: { layer: 'body', prefix: 'STR' },
  sensor: { layer: 'nerves', prefix: 'SN', kinds: SENSOR_KINDS },
  mobileSensor: { layer: 'nerves', prefix: 'MS' },
  chip: { layer: 'nerves', prefix: 'CH' },
  centre: { layer: 'brain', prefix: 'C' },
  network: { layer: 'networks', prefix: 'N', kinds: ['water', 'power', 'gas', 'air', 'repair', 'data'] },
  reserve: { layer: 'reserves', prefix: 'RS', kinds: ['structural', 'control'] },
  material: { layer: 'actuators', prefix: 'M', kinds: ['thermal-conductivity', 'transparency', 'reflectance', 'crack-healing', 'leak-sealing'] },
  device: { layer: 'actuators', prefix: 'D', kinds: ['heating', 'cooling', 'ventilation', 'dehumidifier', 'valve'] },
  measure: { layer: 'actuators', prefix: 'P', kinds: ['prop', 'closed-zone'] },
  robot: { layer: 'actuators', prefix: 'RB' }
};

// from/to list node types or whole layers.
export const LINK_TYPES = {
  supports: { from: ['body'], to: ['body'] },
  adjacent: { from: ['body'], to: ['body'], symmetric: true },
  contains: { from: ['space'], to: ['space', 'body'] },
  observes: { from: ['sensor'], to: ['body', 'space'] },
  patrols: { from: ['mobileSensor'], to: ['body'] },
  transmits: { from: ['sensor', 'mobileSensor', 'chip'], to: ['chip', 'centre'] },
  controls: { from: ['centre'], to: ['actuators'] },
  actsOn: { from: ['actuators'], to: ['body', 'space'] },
  serves: { from: ['network'], to: ['body', 'space'] },
  feeds: { from: ['reserve', 'centre'], to: ['network'] },
  heals: { from: ['material'], to: ['body'] }
};

export const SENSOR_CONTINUOUS = SENSOR_KINDS;
export const SENSOR_EPISODIC = ['strain', 'crack', 'load', 'tilt', 'integrity'];

export const isStructural = node => Boolean(NODE_TYPES[node?.type]?.structural);
const fits = (node, list) => Boolean(node) && (list.includes(node.type) || list.includes(NODE_TYPES[node.type]?.layer));
export const linkAllowed = (type, from, to) => Boolean(LINK_TYPES[type]) && Boolean(from) && Boolean(to) && from.id !== to.id &&
  fits(from, LINK_TYPES[type].from) && fits(to, LINK_TYPES[type].to);

export function emptyModel() {
  return {
    format: FORMAT, version: VERSION,
    meta: { name: '', author: '', updated: '' },
    nodes: [], links: [],
    constitution: { priorities: ['safety', 'health', 'comfort', 'economy'], rules: [] },
    dna: { stiffenMaxPercent: 0 }
  };
}

function nextId(m, prefix) {
  const pattern = new RegExp('^' + prefix + '-(\\d+)$');
  const used = m.nodes.map(node => Number(pattern.exec(node.id)?.[1] || 0));
  return prefix + '-' + (Math.max(0, ...used) + 1);
}

export function addNode(m, { type, kind, name = '' }) {
  const spec = NODE_TYPES[type];
  if (!spec) throw new Error('badNode');
  if (spec.kinds && kind !== undefined && !spec.kinds.includes(kind)) throw new Error('badNode');
  const node = { id: nextId(m, spec.prefix), type, name: String(name) };
  if (spec.kinds) node.kind = kind ?? spec.kinds[0];
  m.nodes.push(node);
  return node.id;
}

export const findNode = (m, id) => m.nodes.find(node => node.id === id);

export function addLink(m, { type, from, to }) {
  const a = findNode(m, from), b = findNode(m, to);
  if (!a || !b) return { ok: false, error: 'missingNode' };
  if (!linkAllowed(type, a, b)) return { ok: false, error: 'badLink' };
  const same = link => link.type === type && ((link.from === from && link.to === to) ||
    (LINK_TYPES[type].symmetric && link.from === to && link.to === from));
  if (m.links.some(same)) return { ok: false, error: 'duplicate' };
  m.links.push({ type, from, to });
  return { ok: true };
}

export function removeNode(m, id) {
  m.nodes = m.nodes.filter(node => node.id !== id);
  m.links = m.links.filter(link => link.from !== id && link.to !== id);
}

export function removeLink(m, index) {
  m.links.splice(index, 1);
}

export function setBinding(m, id, binding) {
  const node = findNode(m, id);
  if (!node) return;
  if (binding && (binding.file || binding.ref)) node.binding = { file: String(binding.file || ''), ref: String(binding.ref || '') };
  else delete node.binding;
}

const L = (ru, en, lang) => (lang ? en : ru);

export function starterModel(lang = 0) {
  const m = emptyModel();
  m.meta.name = L('Мой дом', 'My house', lang);
  const add = (type, name) => addNode(m, { type, name });
  const building = add('building', L('Здание', 'Building', lang));
  const foundation = add('foundation', L('Фундамент', 'Foundation', lang));
  const walls = [1, 2, 3, 4].map(n => add('wall', L('Стена ', 'Wall ', lang) + n));
  const slab = add('slab', L('Перекрытие', 'Slab', lang));
  const roof = add('roof', L('Крыша', 'Roof', lang));
  for (const node of m.nodes) if (node.id !== building) addLink(m, { type: 'contains', from: building, to: node.id });
  for (const wall of walls) {
    addLink(m, { type: 'supports', from: wall, to: foundation });
    addLink(m, { type: 'supports', from: slab, to: wall });
  }
  addLink(m, { type: 'supports', from: roof, to: slab });
  return m;
}

export function validateModel(x) {
  if (!x || typeof x !== 'object' || x.format !== FORMAT) return { ok: false, error: 'notModel' };
  if (x.version !== VERSION) return { ok: false, error: 'oldVersion' };
  const broken = { ok: false, error: 'broken' };
  const isObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  if (!isObject(x.meta) || !Array.isArray(x.nodes) || !Array.isArray(x.links) || !isObject(x.constitution) ||
    !Array.isArray(x.constitution.rules) || !Array.isArray(x.constitution.priorities) || !isObject(x.dna)) return broken;
  if (!x.constitution.rules.every(rule => isObject(rule) && ['limit', 'forbid', 'principle'].includes(rule.kind))) return broken;
  const ids = new Map();
  for (const node of x.nodes) {
    const spec = NODE_TYPES[node?.type];
    if (!spec || typeof node.id !== 'string' || ids.has(node.id)) return broken;
    if (spec.kinds && !spec.kinds.includes(node.kind)) return broken;
    ids.set(node.id, node);
  }
  for (const link of x.links) {
    if (!linkAllowed(link?.type, ids.get(link?.from), ids.get(link?.to))) return broken;
  }
  return { ok: true };
}
