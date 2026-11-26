import { starterModel, addNode, addLink } from '../../house-model/graph.js';

// Starter house where wall W-1 has both living loops closed.
export function fullLoopModel(lang = 0) {
  const m = starterModel(lang);
  const node = (type, kind, name = '') => addNode(m, { type, kind, name });
  const link = (type, from, to) => {
    const result = addLink(m, { type, from, to });
    if (!result.ok) throw new Error(type + ' ' + from + '→' + to + ': ' + result.error);
  };
  const sensor = node('sensor', 'strain');
  const chip = node('chip');
  const centre = node('centre');
  const valve = node('device', 'valve');
  const healing = node('material', 'crack-healing');
  const prop = node('measure', 'prop');
  const repair = node('network', 'repair');
  const stock = node('reserve', 'structural');
  const robot = node('robot');
  link('observes', sensor, 'W-1');
  link('transmits', sensor, chip);
  link('transmits', chip, centre);
  m.constitution.rules.push({ id: 'c-1', kind: 'limit', sensorKind: 'strain', min: 0, max: 800 });
  link('controls', centre, valve);
  link('actsOn', valve, 'W-1');
  link('heals', healing, 'W-1');
  link('actsOn', prop, 'W-1');
  link('serves', repair, 'W-1');
  link('feeds', stock, repair);
  link('controls', centre, robot);
  return m;
}
