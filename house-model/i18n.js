// Interface text [ru, en], language and theme.
const STRINGS = {
  title: ['Живой дом — помощник', 'Living House — helper'],
  intro: ['Необязательный помощник: соберите дом как граф частей и связей и проверьте, замкнуты ли у каждого элемента круги постоянного поддержания и разового ремонта.',
    'Optional helper: build the house as a graph of parts and links and check whether every element has its continuous-upkeep and one-off repair loops closed.'],
  name: ['Название модели', 'Model name'],
  save: ['Сохранить', 'Save'], open: ['Открыть файл', 'Open file'], reset: ['Начать заново', 'Start over'],
  saved: ['Модель сохранена', 'Model saved'], saving: ['Сохраняю…', 'Saving…'], readonly: ['Только просмотр', 'View only'],
  confirmReset: ['Нажмите ещё раз, чтобы начать с заготовки', 'Click again to start from the starter house'],
  steps: [['1 Тело', '2 Нервы', '3 Центры и мозг', '4 Сети и запасы', '5 Реакция и заживление', '6 Привязка к проекту', '7 Оценка'],
    ['1 Body', '2 Nerves', '3 Centres and brain', '4 Networks and reserves', '5 Reaction and healing', '6 Project binding', '7 Assessment']],
  stepHelp: [[
    'Фундамент, стены, перекрытия, крыша, помещения. Связи: что на что опирается, что к чему примыкает. Размеры не нужны.',
    'Датчики на элементах, подвижные датчики и их обход, чипы и линии связи до центра.',
    'Центры, которые принимают сигналы и управляют исполнителями. ДНК — допустимые реакции. Конституция — приоритеты, пределы и запреты.',
    'Сети: вода, электричество, газ, воздух, данные и ремонтный материал. Запасы, которые их питают.',
    'Адаптивные материалы и залечивание, устройства, временные меры, роботы. Чем управляет центр и на что действует.',
    'Если к паспорту приложен проект (IFC, DWG, DXF), укажите, какому элементу проекта соответствует узел. Необязательно.',
    'Для каждого несущего элемента: замкнут ли постоянный круг и круг разового ремонта, и чего не хватает.'
  ], [
    'Foundation, walls, slabs, roof, spaces. Links: what rests on what, what adjoins what. No sizes needed.',
    'Sensors on elements, mobile sensors and their patrols, chips and links to a centre.',
    'Centres that receive signals and control actuators. DNA: allowed reactions. Constitution: priorities, limits and prohibitions.',
    'Networks: water, power, gas, air, data and repair material. Reserves that feed them.',
    'Adaptive materials and healing, devices, temporary measures, robots. What the centre controls and what they act on.',
    'If a project file (IFC, DWG, DXF) is attached to the passport, note which project element each node is. Optional.',
    'For each structural element: whether the continuous loop and the one-off repair loop are closed, and what is missing.'
  ]],
  addNode: ['Добавить узел', 'Add node'], addLink: ['Добавить связь', 'Add link'], add: ['Добавить', 'Add'],
  type: ['Тип', 'Type'], kind: ['Вид', 'Kind'], nodeName: ['Название (необязательно)', 'Name (optional)'],
  linkType: ['Связь', 'Link'], from: ['Откуда', 'From'], to: ['Куда', 'To'], remove: ['Удалить', 'Remove'],
  nodes: ['Узлы', 'Nodes'], links: ['Связи', 'Links'], none: ['Пока ничего', 'Nothing yet'],
  badLink: ['Такая связь между этими узлами не допускается', 'This link is not allowed between these nodes'],
  duplicate: ['Такая связь уже есть', 'This link already exists'], missingNode: ['Выберите оба узла', 'Pick both nodes'],
  dna: ['ДНК', 'DNA'], stiffen: ['Усиление соседних элементов, до %', 'Neighbour stiffening, up to %'],
  constitution: ['Конституция', 'Constitution'], priorities: ['Приоритеты', 'Priorities'], rules: ['Правила', 'Rules'],
  up: ['Выше', 'Up'], limit: ['Предел', 'Limit'], forbid: ['Запрет', 'Prohibition'], principle: ['Принцип', 'Principle'],
  sensorKind: ['Датчик', 'Sensor'], min: ['мин', 'min'], max: ['макс', 'max'], action: ['Действие', 'Action'],
  fromTime: ['с', 'from'], toTime: ['до', 'to'], text: ['Текст', 'Text'],
  file: ['Файл проекта', 'Project file'], ref: ['Элемент в проекте (GUID, марка, лист)', 'Project element (GUID, mark, sheet)'],
  legendgreen: ['оба круга замкнуты', 'both loops closed'], legendyellow: ['частично', 'partly'], legendred: ['дом элемент не чувствует', 'the house does not sense it'],
  green: ['замкнуто', 'closed'], yellow: ['частично', 'partly'], red: ['не чувствует', 'not sensed'],
  continuous: ['Постоянное поддержание', 'Continuous upkeep'], episodic: ['Разовый ремонт', 'One-off repair'],
  loopClosed: ['замкнут', 'closed'], loopOpen: ['разрыв', 'gap'],
  cond: [[
    ['Датчик наблюдает элемент или его помещение', 'Датчик связан с центром', 'В Конституции есть норма для датчика', 'Центр управляет исполнителем, который действует на элемент', 'Есть непрерывное залечивание'],
    ['Датчик целостности или обход подвижного датчика', 'Датчик связан с центром', 'Временная мера: подпорка, закрытая зона или усиление соседа', 'Ремонтная сеть с запасом строительного материала', 'У центра есть робот']
  ], [
    ['A sensor observes the element or its space', 'The sensor reaches a centre', 'The Constitution has a limit for the sensor', 'The centre controls an actuator acting on the element', 'Continuous healing is present'],
    ['An integrity sensor or a mobile sensor patrol', 'The sensor reaches a centre', 'Temporary measure: prop, closed zone or neighbour stiffening', 'Repair network fed by structural material', 'The centre has a robot']
  ]],
  pick: ['Нажмите на элемент дома на схеме', 'Click a house element on the diagram'],
  passportText: ['Что попадёт в паспорт как вариант', 'What the passport will offer as a variant'],
  notEmbeddedHint: ['Файл сохранится на компьютер. В паспорте на портале модель сохраняется прямо в паспорт.', 'The file is saved to your computer. Inside a portal passport the model is saved to the passport.'],
  notModel: ['Это не файл модели живого дома', 'This is not a Living House model file'],
  oldVersion: ['Это файл старой модели, он не поддерживается', 'This is an old-format model file and is not supported'],
  broken: ['Файл модели повреждён', 'The model file is damaged'],
  portalNoAnswer: ['Портал не ответил, модель паспорта не загрузилась. Обновите страницу.', 'The portal did not answer and the passport model did not load. Reload the page.'],
  loading: ['Загружаю модель паспорта…', 'Loading the passport model…'],
  layers: [['Пространства', 'Тело', 'Нервы', 'Мозг', 'Сети', 'Запасы', 'Органы'], ['Spaces', 'Body', 'Nerves', 'Brain', 'Networks', 'Reserves', 'Organs']],
  light: ['Светлая', 'Light'], dark: ['Тёмная', 'Dark'],
  fields: [{
    structureProject: 'Каркас, оболочка и конструктивный расчёт', supplyProject: 'Энергоснабжение, сети и ресурсы',
    minimumSensors: 'Минимальный набор датчиков', nervousSystem: 'Нервная система и журнал',
    homeostasisControl: 'Система поддержания гомеостаза', constitution: 'Конституция объекта',
    damageScenarios: 'Реакция на повреждение и разрушение', selfRecovery: 'Система самовосстановления'
  }, {
    structureProject: 'Frame, envelope and structural calculations', supplyProject: 'Power, utilities and resources',
    minimumSensors: 'Minimum sensor set', nervousSystem: 'Nervous system and log',
    homeostasisControl: 'Homeostasis control', constitution: 'Object Constitution',
    damageScenarios: 'Damage response', selfRecovery: 'Self-recovery system'
  }]
};

const params = new URLSearchParams(location.search);
let lang = params.get('lang') === 'en' ? 1 : params.get('lang') === 'ru' ? 0 : (navigator.language || '').startsWith('ru') ? 0 : 1;
export const getLang = () => lang;
export function setLang(value) { lang = value ? 1 : 0; document.documentElement.lang = lang ? 'en' : 'ru'; }
export const tr = key => STRINGS[key]?.[lang] ?? key;

let theme = null;
try { theme = localStorage.getItem('lhm-theme'); } catch { /* storage unavailable */ }
export const getTheme = () => theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
export function setTheme(value) {
  theme = value;
  document.documentElement.dataset.theme = value;
  try { localStorage.setItem('lhm-theme', value); } catch { /* storage unavailable */ }
}
