// Draft passport text built from the house graph. The client may insert it, append it or ignore it;
// the portal never puts it into a field by itself (see applySuggestion).
import { findNode, isStructural } from './graph.js';
import { assessModel, CONTINUOUS_GAPS, EPISODIC_GAPS } from './check.js';

export const SUGGESTED_FIELDS = ['structureProject', 'supplyProject', 'minimumSensors', 'nervousSystem',
  'homeostasisControl', 'constitution', 'damageScenarios', 'selfRecovery'];

// [ru, en] labels shared with the helper UI.
export const LABELS = {
  type: {
    site: ['Участок', 'Site'], building: ['Здание', 'Building'], storey: ['Этаж', 'Storey'], space: ['Помещение', 'Space'],
    foundation: ['Фундамент', 'Foundation'], wall: ['Стена', 'Wall'], column: ['Колонна', 'Column'], beam: ['Балка', 'Beam'],
    slab: ['Перекрытие', 'Slab'], roof: ['Крыша', 'Roof'], window: ['Окно', 'Window'], door: ['Дверь', 'Door'], stair: ['Лестница', 'Stair'],
    sensor: ['Датчик', 'Sensor'], mobileSensor: ['Подвижный датчик', 'Mobile sensor'], chip: ['Чип', 'Chip'], centre: ['Центр', 'Centre'],
    network: ['Сеть', 'Network'], reserve: ['Запас', 'Reserve'], material: ['Адаптивный материал', 'Adaptive material'],
    device: ['Устройство', 'Device'], measure: ['Временная мера', 'Temporary measure'], robot: ['Робот', 'Robot']
  },
  kind: {
    strain: ['деформация', 'strain'], crack: ['трещины', 'crack'], load: ['нагрузка', 'load'], tilt: ['наклон', 'tilt'],
    integrity: ['целостность', 'integrity'], temperature: ['температура', 'temperature'], humidity: ['влажность', 'humidity'],
    co2: ['CO₂', 'CO₂'], leak: ['протечка', 'leak'],
    water: ['вода', 'water'], power: ['электричество', 'power'], gas: ['газ', 'gas'], air: ['воздух', 'air'],
    repair: ['ремонтный материал', 'repair material'], data: ['данные', 'data'],
    structural: ['строительный материал', 'structural material'], control: ['управляющий материал', 'control material'],
    'thermal-conductivity': ['теплопроводность', 'thermal conductivity'], transparency: ['прозрачность', 'transparency'],
    reflectance: ['отражение', 'reflectance'], 'crack-healing': ['залечивание трещин', 'crack healing'],
    'leak-sealing': ['заделка протечек', 'leak sealing'],
    heating: ['отопление', 'heating'], cooling: ['охлаждение', 'cooling'], ventilation: ['вентиляция', 'ventilation'],
    dehumidifier: ['осушитель', 'dehumidifier'], valve: ['клапан', 'valve'], prop: ['подпорка', 'prop'], 'closed-zone': ['закрытая зона', 'closed zone']
  },
  link: {
    supports: ['опирается на', 'rests on'], adjacent: ['примыкает к', 'adjoins'], contains: ['содержит', 'contains'],
    observes: ['наблюдает', 'observes'], patrols: ['обходит', 'patrols'], transmits: ['передаёт в', 'transmits to'],
    controls: ['управляет', 'controls'], actsOn: ['действует на', 'acts on'], serves: ['обслуживает', 'serves'],
    feeds: ['питает', 'feeds'], heals: ['залечивает', 'heals']
  },
  priority: { safety: ['безопасность', 'safety'], health: ['здоровье', 'health'], comfort: ['комфорт', 'comfort'], economy: ['экономия', 'economy'] },
  gap: {
    noSensor: ['датчик, который наблюдает элемент', 'a sensor observing the element'],
    notConnected: ['связь датчика с центром', 'a link from the sensor to a centre'],
    noNorm: ['норма Конституции для этого датчика', 'a Constitution limit for this sensor'],
    noActuator: ['исполнитель, которым центр действует на элемент', 'an actuator the centre uses on the element'],
    noHealing: ['непрерывное залечивание', 'continuous healing'],
    noIntegritySensor: ['датчик целостности или обход подвижного датчика', 'an integrity sensor or a mobile sensor patrol'],
    episodicNotConnected: ['связь датчика целостности с центром', 'a link from the integrity sensor to a centre'],
    noTemporaryMeasure: ['временная мера: подпорка, закрытая зона или усиление соседа', 'a temporary measure: prop, closed zone or neighbour stiffening'],
    noRepairNetwork: ['ремонтная сеть с запасом строительного материала', 'a repair network fed by structural material stock'],
    noRepairer: ['робот у центра для ремонта', 'a repair robot controlled by the centre']
  },
  text: {
    missing: ['Не предусмотрено', 'Not provided'], elements: ['Несущие элементы', 'Structural elements'],
    centres: ['Центры', 'Centres'], priorities: ['Приоритеты', 'Priorities'], limit: ['Предел', 'Limit'],
    forbid: ['Запрет', 'Prohibition'], principle: ['Принцип', 'Principle'], from: ['с', 'from'], to: ['до', 'to'],
    stiffen: ['Усиление соседних элементов по ДНК: до', 'Neighbour stiffening allowed by DNA: up to'],
    closedLoop: ['постоянный круг', 'continuous loop'], healing: ['залечивание', 'healing'], fed: ['питание', 'fed by']
  }
};

export const label = (group, key, lang) => LABELS[group]?.[key]?.[lang ? 1 : 0] ?? String(key);

// "W-1 Стена 1", "SN-1 (деформация)".
export function nodeText(node, lang) {
  if (!node) return '';
  const kind = node.kind ? ' (' + label('kind', node.kind, lang) + ')' : '';
  return node.id + (node.name ? ' ' + node.name : kind ? '' : ' ' + label('type', node.type, lang)) + kind;
}

export function applySuggestion(current, text, mode) {
  const value = String(current ?? '');
  if (mode === 'insert') return value.trim() ? value : text;
  return value.trim() ? value.trimEnd() + '\n\n' + text : text;
}

const GAP_FIELD = {
  noSensor: 'minimumSensors', noIntegritySensor: 'minimumSensors',
  notConnected: 'nervousSystem', episodicNotConnected: 'nervousSystem',
  noNorm: 'homeostasisControl', noActuator: 'homeostasisControl',
  noTemporaryMeasure: 'damageScenarios',
  noHealing: 'selfRecovery', noRepairNetwork: 'selfRecovery', noRepairer: 'selfRecovery'
};

export function suggestions(m, lang = 0) {
  const t = key => label('text', key, lang);
  const node = id => findNode(m, id);
  const show = id => nodeText(node(id), lang);
  const byType = type => m.nodes.filter(item => item.type === type);
  const out = Object.fromEntries(SUGGESTED_FIELDS.map(field => [field, []]));
  const linkLine = link => show(link.from) + ' ' + label('link', link.type, lang) + ' ' + show(link.to) + '.';
  const linksOf = (...types) => m.links.filter(link => types.includes(link.type));

  const structural = m.nodes.filter(isStructural);
  if (structural.length) out.structureProject.push(t('elements') + ': ' + structural.map(item => nodeText(item, lang)).join(', ') + '.');
  out.structureProject.push(...linksOf('supports', 'adjacent').map(linkLine));

  for (const network of byType('network')) {
    const served = linksOf('serves').filter(link => link.from === network.id).map(link => link.to);
    const feeders = linksOf('feeds').filter(link => link.to === network.id).map(link => link.from);
    out.supplyProject.push(nodeText(network, lang) + (served.length ? ': ' + label('link', 'serves', lang) + ' ' + served.join(', ') : '') +
      (feeders.length ? '; ' + t('fed') + ': ' + feeders.join(', ') : '') + '.');
  }
  out.supplyProject.push(...byType('reserve').map(item => nodeText(item, lang) + '.'));

  out.minimumSensors.push(...linksOf('observes', 'patrols').map(linkLine));
  out.nervousSystem.push(...linksOf('transmits').map(linkLine));
  const centres = byType('centre');
  if (centres.length) out.nervousSystem.push(t('centres') + ': ' + centres.map(item => nodeText(item, lang)).join(', ') + '.');

  const assessment = assessModel(m);
  for (const item of assessment.filter(entry => entry.continuous.closed)) {
    const watchers = linksOf('observes').filter(link => link.to === item.id).map(link => link.from);
    const actors = linksOf('actsOn').filter(link => link.to === item.id && node(link.from)?.type !== 'measure').map(link => link.from);
    const bosses = linksOf('controls').filter(link => actors.includes(link.to)).map(link => link.from);
    const healers = linksOf('heals').filter(link => link.to === item.id).map(link => link.from);
    out.homeostasisControl.push(show(item.id) + ', ' + t('closedLoop') + ': ' +
      [watchers, [...new Set(bosses)], actors].map(ids => ids.join(', ')).filter(Boolean).join(' → ') +
      (healers.length ? '; ' + t('healing') + ': ' + healers.join(', ') : '') + '.');
  }

  const c = m.constitution;
  out.constitution.push(t('priorities') + ': ' + c.priorities.map(key => label('priority', key, lang)).join(' → ') + '.');
  for (const rule of c.rules) {
    if (rule.kind === 'limit') out.constitution.push(t('limit') + ' ' + label('kind', rule.sensorKind, lang) + ': ' + rule.min + '…' + rule.max + '.');
    if (rule.kind === 'forbid') out.constitution.push(t('forbid') + ': ' + rule.action + ' ' + t('from') + ' ' + rule.from + ' ' + t('to') + ' ' + rule.to + '.');
    if (rule.kind === 'principle') out.constitution.push(t('principle') + ': ' + rule.text);
  }

  out.damageScenarios.push(...linksOf('actsOn').filter(link => node(link.from)?.type === 'measure').map(linkLine));
  if (Number(m.dna?.stiffenMaxPercent) > 0) out.damageScenarios.push(t('stiffen') + ' ' + m.dna.stiffenMaxPercent + ' %.');

  out.selfRecovery.push(...linksOf('heals').map(linkLine));
  out.selfRecovery.push(...linksOf('controls').filter(link => node(link.to)?.type === 'robot').map(linkLine));

  // Gaps: only the first missing condition of each loop (the root cause), grouped by condition.
  const gaps = {};
  const firstGap = (flags, codes) => codes[['a', 'b', 'c', 'd', 'e'].findIndex(key => !flags[key])];
  for (const item of assessment) {
    for (const gap of [firstGap(item.continuous, CONTINUOUS_GAPS), firstGap(item.episodic, EPISODIC_GAPS)]) {
      if (gap) (gaps[gap] ||= []).push(item.id);
    }
  }
  for (const [gap, ids] of Object.entries(gaps)) out[GAP_FIELD[gap]].push(t('missing') + ': ' + label('gap', gap, lang) + ' — ' + ids.join(', ') + '.');

  return Object.fromEntries(Object.entries(out).filter(([, lines]) => lines.length).map(([field, lines]) => [field, lines.join('\n')]));
}
