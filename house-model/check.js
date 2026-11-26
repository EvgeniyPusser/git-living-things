// Living-loop assessment of each structural element (rules from the design, section «Оценка живости»).
// Continuous loop: sense → nerves → centre → Constitution norm → actuator → element, plus constant healing.
// Episodic loop: integrity sensing → centre → temporary measure → repair network with stock → repairer.
import { NODE_TYPES, SENSOR_EPISODIC, findNode, isStructural } from './graph.js';

export const CONTINUOUS_GAPS = ['noSensor', 'notConnected', 'noNorm', 'noActuator', 'noHealing'];
export const EPISODIC_GAPS = ['noIntegritySensor', 'episodicNotConnected', 'noTemporaryMeasure', 'noRepairNetwork', 'noRepairer'];
const HEALING = ['crack-healing', 'leak-sealing'];

const linksOf = (m, type) => m.links.filter(link => link.type === type);
const targets = (m, type, from) => linksOf(m, type).filter(link => link.from === from).map(link => link.to);
const sources = (m, type, to) => linksOf(m, type).filter(link => link.to === to).map(link => link.from);
const ofType = (m, ids, type, kinds) => ids.map(id => findNode(m, id))
  .filter(node => node && node.type === type && (!kinds || kinds.includes(node.kind)));

// Centres reachable from a node over transmits links (visited set: cycles terminate).
function centresReached(m, start) {
  const seen = new Set([start]), queue = [start], centres = new Set();
  while (queue.length) {
    for (const next of targets(m, 'transmits', queue.shift())) {
      if (seen.has(next)) continue;
      seen.add(next);
      if (findNode(m, next)?.type === 'centre') centres.add(next);
      else queue.push(next);
    }
  }
  return centres;
}

function closed(flags) {
  return Object.values(flags).every(Boolean);
}

export function assessElement(m, id) {
  const element = findNode(m, id);
  const spaces = sources(m, 'contains', id).filter(space => NODE_TYPES[findNode(m, space)?.type]?.layer === 'space');
  const places = [id, ...spaces];
  const actedBy = place => sources(m, 'actsOn', place);

  // Continuous loop.
  const watchers = ofType(m, places.flatMap(place => sources(m, 'observes', place)), 'sensor');
  const connected = watchers.map(sensor => ({ sensor, centres: centresReached(m, sensor.id) })).filter(item => item.centres.size);
  const normed = connected.filter(({ sensor }) => m.constitution.rules.some(rule => rule.kind === 'limit' && rule.sensorKind === sensor.kind));
  const contCentres = new Set(connected.flatMap(item => [...item.centres]));
  const actuators = new Set(places.flatMap(actedBy));
  const acting = [...contCentres].some(centre => targets(m, 'controls', centre).some(actuator => actuators.has(actuator)));
  const healing = ofType(m, sources(m, 'heals', id), 'material', HEALING).length > 0;
  const continuous = { a: watchers.length > 0, b: connected.length > 0, c: normed.length > 0, d: acting, e: healing };

  // Episodic loop.
  const integrity = [
    ...ofType(m, sources(m, 'observes', id), 'sensor', SENSOR_EPISODIC),
    ...ofType(m, sources(m, 'patrols', id), 'mobileSensor')
  ];
  const epiCentres = new Set(integrity.flatMap(node => [...centresReached(m, node.id)]));
  const neighbours = m.links.some(link => ['supports', 'adjacent'].includes(link.type) && (link.from === id || link.to === id));
  const measure = ofType(m, sources(m, 'actsOn', id), 'measure').length > 0 || (Number(m.dna?.stiffenMaxPercent) > 0 && neighbours);
  const repairNet = ofType(m, sources(m, 'serves', id), 'network', ['repair'])
    .some(network => ofType(m, sources(m, 'feeds', network.id), 'reserve', ['structural']).length > 0);
  const repairer = [...epiCentres].some(centre => ofType(m, targets(m, 'controls', centre), 'robot').length > 0);
  const episodic = { a: integrity.length > 0, b: epiCentres.size > 0, c: measure, d: repairNet, e: repairer };

  const color = closed(continuous) && closed(episodic) ? 'green' : !continuous.a && !episodic.a ? 'red' : 'yellow';
  const gaps = [
    ...Object.values(continuous).map((ok, i) => ok ? null : CONTINUOUS_GAPS[i]),
    ...Object.values(episodic).map((ok, i) => ok ? null : EPISODIC_GAPS[i])
  ].filter(Boolean);
  return {
    id, type: element?.type,
    continuous: { ...continuous, closed: closed(continuous) },
    episodic: { ...episodic, closed: closed(episodic) },
    color, gaps
  };
}

export function assessModel(m) {
  return m.nodes.filter(isStructural).map(node => assessElement(m, node.id));
}

export function summary(m) {
  const counts = { green: 0, yellow: 0, red: 0, total: 0 };
  for (const item of assessModel(m)) {
    counts[item.color]++;
    counts.total++;
  }
  return counts;
}
