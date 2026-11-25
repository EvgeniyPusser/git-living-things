const pages = 'https://evgeniypusser.github.io/';
const code = 'https://github.com/EvgeniyPusser/';
const thermalPaper = code + 'living-things-sim/blob/main/paper/';

export const domainResearch = {
  buildings: [
    {
      title: ['Морфогенез живого здания', 'Morphogenesis of a Living Building'],
      examples: ['house'],
      description: ['Сравните, как из одних правил формируются разные конструкции и как меняется их форма после повреждения.',
        'Compare how the same rules form different structures and how their shape changes after damage.'],
      links: [
        ['researchDemo', pages + 'living-building-morphogenesis-v2/'],
        ['researchFirstVersion', pages + 'living-building-morphogenesis/'],
        ['researchManuscript', '/research/manuscripts/morphogenesis.pdf']
      ]
    },
    {
      title: ['Living Building Assembly', 'Living Building Assembly'],
      examples: ['house', 'facade'],
      description: ['Проследите на 3D-модели сборку здания, работу датчиков и сценарий ремонта.',
        'Follow the 3D model through building assembly, sensor monitoring and a repair scenario.'],
      links: [['researchDemo', pages + 'living-building-assembly/']]
    },
    {
      title: ['Тепловая устойчивость и перенос управления', 'Thermal resilience and control transfer'],
      examples: ['house'],
      description: ['Рассчитайте остывание здания при отказе отопления и посмотрите, когда опыт другого здания помогает.',
        'Model how a building cools during a heating failure and see when another building’s operating experience helps.'],
      links: [
        ['researchCalculator', [pages + 'living-things-sim/calc/stend.html', pages + 'living-things-sim/calc/bench.html']],
        ['researchSourceSelection', thermalPaper + 'short.md'],
        ['researchDataset', 'https://zenodo.org/records/23012010'],
        ['researchInheritance', thermalPaper + 'paper_v2.md'],
        ['researchAbstract', thermalPaper + 'CISBAT2027-abstract.md']
      ]
    },
    {
      title: ['Структурное восстановление', 'Structural recovery'],
      examples: ['house', 'facade', 'buildings'],
      description: ['Сравните стратегии ремонта и проверьте, как запас ресурсов и доступность обходов влияют на сохранение функции.',
        'Compare repair strategies and examine how resource reserves and alternative load paths affect functional recovery.'],
      links: [
        ['researchStand', pages + 'living-things-v3/'],
        ['researchResults', pages + 'living-things-v3/results.html'],
        ['researchV3Commentary', '/research/v3/commentary.pdf'],
        ['researchRegeneration', '/research/regeneration/manuscript.docx'],
        ['researchInstructions', '/research/regeneration/README.md']
      ]
    },
    {
      title: ['Организация этажей госпиталя', 'Hospital floor organisation'],
      examples: [],
      description: ['Сравните, как распределение функций по этажам влияет на расписание и время перемещений в модели.',
        'Compare how allocating activities across floors changes schedules and travel times in the model.'],
      links: [
        ['researchInstructions', '/research/hospital/README.md'],
        ['researchProtocol', '/research/hospital/experiment.md']
      ]
    },
    {
      title: ['Living Space', 'Living Space'],
      examples: ['house'],
      description: ['Сравните виды комнаты из позиций, связанных с действиями жильца, и проверьте, как меняется оценка при иной шкале предпочтений.',
        'Compare room views from positions tied to a resident’s activities and test how the assessment changes with their preferences.'],
      links: [
        ['researchDemo', '/research/interior/index.html'],
        ['researchManuscript', '/research/interior/article/manuscript.html']
      ]
    }
  ],
  transport: [{
    title: ['Living Car', 'Living Car'],
    description: ['Сравните расчётные последствия двух режимов обучения автомобилей по повреждениям, нагрузке и энергии восстановления.',
      'Compare two vehicle learning modes by simulated damage, loading and recovery energy.'],
    links: [
      ['researchDemo', pages + 'living-car/'],
      ['researchResults', '/research/car/population.md'],
      ['researchCode', code + 'living-car']
    ]
  }],
  aviation: [{
    title: ['Living Aircraft', 'Living Aircraft'],
    description: ['Сравните фиксированное крыло и крыло с управляемой круткой по прогибу, напряжениям и сопротивлению.',
      'Compare a fixed wing and a wing with controlled twist by deflection, stress and drag.'],
    links: [
      ['researchResults', '/research/aircraft/RESULTS.md'],
      ['researchInstructions', '/research/aircraft/README.md']
    ]
  }],
  infrastructure: [{
    title: ['Граф городской территории', 'Urban infrastructure graph'],
    examples: ['grid'],
    description: ['Проследите, как отключение питания, ливень и жара затрагивают связанные функции территории. Сценарии заданы в модели.',
      'Trace how a power outage, heavy rain and heat affect connected infrastructure functions in the modelled scenarios.'],
    links: [['researchDemo', 'https://living-things-ecosphere.vercel.app/buildings/urban-graph.html']]
  }],
  robotics: [{
    title: ['Самомоделирование робота', 'Robot self-modelling'],
    description: ['Эксперимент с четырёхногим роботом, который меняет походку после изменения конфигурации тела.',
      'An experiment in which a four-legged robot adapts its gait after a change in its body configuration.'],
    links: [['robotPaper', 'https://pubmed.ncbi.nlm.nih.gov/17110570/']]
  }]
};

export const foundationalResearch = [{
  title: ['Living Things: самоподдерживающиеся и развивающиеся технические объекты',
    'Living Things: Toward a Civilization of Self-Maintaining and Evolving Technological Objects'],
  description: ['Концептуальная рукопись о самоподдержании объектов, роли человека и наследовании технического опыта.',
    'A conceptual manuscript on self-maintenance, the role of people and the transfer of technical experience.'],
  links: [['researchManuscript', '/research/manuscripts/living-things.docx']]
}];
