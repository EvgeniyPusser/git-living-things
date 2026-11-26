const pages = 'https://evgeniypusser.github.io/';
const code = 'https://github.com/EvgeniyPusser/';
const thermalPaper = code + 'living-things-sim/blob/main/paper/';
export const urbanPrototype = './buildings/urban-graph.html';

export const territoryInterfaces = {
  house: [
    [['Улица и входы', 'Street and entrances'], ['Пешеходный вход, подъезд обслуживания и запасной маршрут при закрытии улицы.', 'Pedestrian entrance, service access and a backup route if the street closes.']],
    [['Энергия и связь', 'Power and connectivity'], ['Внешний ввод и канал связи. Дом передаёт состояние резерва и доступность датчиков.', 'External power and connectivity. The house reports backup status and sensor availability.']],
    [['Вода и водоотвод', 'Water and drainage'], ['Ввод воды, стоки и отвод дождя. При перегрузке дренажа проверяется доступ к входу.', 'Water inlet, wastewater and runoff. Check entrance access when drainage is overloaded.']]
  ],
  factory: [
    [['Фабрика и соседняя застройка', 'Factory and neighbouring buildings'], ['Зафиксировать границу участка, соседние здания, входы и место пересечения пешеходного и грузового потоков.', 'Mark the site boundary, neighbouring buildings, entrances and where pedestrian and freight routes cross.']],
    [['Логистика и доступ', 'Logistics and access'], ['Развести грузовые маршруты, входы персонала и доступ аварийных служб. Задать альтернативу при закрытии подъезда.', 'Separate freight, staff and emergency access. Define an alternate route if the approach is closed.']],
    [['Инженерные сети', 'Utility networks'], ['Описать внешний ввод питания, воду, стоки и связь. Указать, какие ячейки останавливаются и какие функции поддерживает резерв.', 'Document incoming power, water, effluent and communications. Identify cells that stop and functions maintained by backup.']]
  ],
  neighbourhood: [
    [['Улица и дорога', 'Street and road'], ['Соединяют застройку с услугами и ремонтными службами. В сценарии ливня нижний участок дороги условно затоплен.', 'Connect buildings to services and maintenance. The heavy-rain scenario assumes that the lower road section floods.']],
    [['Освещение', 'Lighting'], ['Зависит от электросети и поддерживает использование маршрута после темноты. Доступность маршрута оценивается отдельно от проходимости.', 'Depends on power and supports after-dark use. Route accessibility is assessed separately from physical passability.']],
    [['Дренаж и насосы', 'Drainage and pumps'], ['Насос зависит от питания. Самотёчный дренаж и возможность доступа для обслуживания учитываются отдельно.', 'The pump depends on power. Gravity drainage and maintenance access are tracked separately.']],
    [['Тротуары и урбанистика', 'Footways and urban planning'], ['Расположение входов, переходов и обходов определяет, какие здания остаются доступны при закрытии участка улицы.', 'Entrance, crossing and alternative-route locations determine which buildings remain reachable when a street section closes.']]
  ]
};

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
    links: [['researchDemo', urbanPrototype]]
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

export const testRegistry = {
  morphogenesis: {
    label: ['Дом · морфогенез', 'Building · morphogenesis'],
    example: 'house', status: 'testComputed',
    sources: [['testOpenBench', pages + 'living-building-morphogenesis-v2/']],
    tests: [
      ['MOR-01', ['Формирование на разном грунте', 'Formation on different soils'],
        ['Зоны, поля грунта и нагрузки, запасы материала.', 'Zones, soil and load fields, material stocks.'],
        ['Варианты каркаса, доступная площадь, датчики и опоры.', 'Alternative frames, usable area, sensors and supports.']],
      ['MOR-02', ['Неожиданная локальная нагрузка', 'Unexpected local load'],
        ['Узел нагрузки, доступные датчики, два режима управления.', 'Load location, available sensors, two control modes.'],
        ['Прогноз и измерение, момент реакции, соблюдение предела в модели.', 'Prediction and observation, response time and compliance with the model limit.']],
      ['MOR-03', ['Повреждение и повторное формирование', 'Damage and reactivated formation'],
        ['Топология, утраченные элементы, доступные центры и остаток ресурсов.', 'Topology, lost components, reachable centres and remaining resources.'],
        ['Доступность зон до и после, расход материала, изменённые пути.', 'Zone access before and after, material use and changed paths.']]
    ]
  },
  thermal: {
    label: ['Дом · тепловой режим', 'Building · thermal control'],
    example: 'house', status: 'testComputed',
    sources: [['testOpenBench', [pages + 'living-things-sim/calc/stend.html', pages + 'living-things-sim/calc/bench.html']],
      ['researchResults', thermalPaper + 'short.md']],
    tests: [
      ['THM-01', ['Остывание и восстановление теплового режима', 'Cooling and thermal recovery'],
        ['Свойства здания, погода, уставки и режим отопления.', 'Building parameters, weather, setpoints and heating mode.'],
        ['Ход температуры и время вне допустимого диапазона.', 'Temperature trajectory and time outside the allowed range.']],
      ['THM-02', ['Перенос настроек между домами', 'Transfer of settings between buildings'],
        ['Модели дома-донора и получателя, погода и одинаковый бюджет настройки.', 'Source and target building models, weather and equal tuning budgets.'],
        ['Сравнение переноса с собственной настройкой по затратам и комфорту.', 'Cost and comfort comparison of transfer with local tuning.']]
    ]
  },
  structure: {
    label: ['Конструкции · восстановление', 'Structures · recovery'],
    example: 'other', status: 'testComputed',
    sources: [['testOpenBench', pages + 'living-things-v3/'], ['researchResults', pages + 'living-things-v3/results.html'],
      ['researchInstructions', '/research/regeneration/README.md']],
    tests: [
      ['STR-01', ['Потеря элемента и пути передачи нагрузки', 'Loss of a member and its load path'],
        ['Стержневая модель, нагрузка, повреждённый элемент и доступные обходы.', 'Truss model, loading, damaged member and available alternatives.'],
        ['Равновесие, перемещения, перегрузки и сохранённые функции.', 'Equilibrium, displacement, overloads and retained functions.']],
      ['STR-02', ['Ремонт при ограниченном запасе', 'Repair under a limited resource budget'],
        ['Ресурсы, ограничения доступа и конкурирующие стратегии ремонта.', 'Resources, access restrictions and competing repair strategies.'],
        ['Восстановившиеся ветви сценария, расход ресурсов и зависимость от приоритета.', 'Recovered scenario branches, resource use and sensitivity to priorities.']]
    ]
  },
  car: {
    label: ['Автомобиль', 'Car'],
    example: 'transport', status: 'testComputed',
    sources: [['testOpenBench', pages + 'living-car/'], ['researchResults', '/research/car/population.md']],
    tests: [
      ['CAR-01', ['Повреждение, контактная сила и энергия восстановления', 'Damage, contact force and recovery energy'],
        ['Конфигурация расчётного узла и одинаковые сценарии воздействия.', 'Assembly model and matched loading scenarios.'],
        ['Остаточное повреждение, пиковая сила и энергия по отдельности.', 'Residual damage, peak force and energy reported separately.']],
      ['CAR-02', ['Изолированное и коллективное обучение', 'Isolated and collective learning'],
        ['Две группы с одинаковыми исходными узлами и условиями обучения.', 'Two groups with matched baseline assemblies and training conditions.'],
        ['Эффект обмена рекомендациями на повреждение, силу и расход энергии.', 'Effect of sharing recommendations on damage, force and energy use.']]
    ]
  },
  aircraft: {
    label: ['Самолёт · адаптивное крыло', 'Aircraft · adaptive wing'],
    example: 'aviation', status: 'testComputed',
    sources: [['researchResults', '/research/aircraft/RESULTS.md'], ['researchInstructions', '/research/aircraft/README.md']],
    tests: [
      ['AIR-01', ['Фиксированное крыло и управляемая крутка', 'Fixed wing and controlled twist'],
        ['Геометрия, режим полёта, требуемая подъёмная сила и модель привода.', 'Geometry, flight condition, required lift and actuator model.'],
        ['Прогиб, напряжения и сопротивление при одинаковой подъёмной силе.', 'Deflection, stress and drag at the same lift.']],
      ['AIR-02', ['Внезапное изменение нагрузки', 'Sudden load change'],
        ['Расчётная модель крыла и временной профиль нагрузки.', 'Wing model and load history.'],
        ['Динамический отклик и показания расчётных датчиков.', 'Dynamic response and modelled sensor readings.']]
    ]
  },
  neighbourhood: {
    label: ['Территория · улицы и сети', 'Territory · streets and networks'],
    example: 'grid', status: 'testSketch',
    sources: [['testOpenUrban', urbanPrototype]],
    tests: [
      ['URB-01', ['Отключение питания улицы', 'Street power outage'],
        ['Источники питания, освещение, насосы, здания и доступные резервы.', 'Power sources, lighting, pumps, buildings and available backup.'],
        ['Какие функции освещения, доступа и водоснабжения затронуты.', 'Which lighting, access and water functions are affected.']],
      ['URB-02', ['Ливень и доступ по маршрутам', 'Heavy rain and route access'],
        ['Улица, дренаж, пешеходные обходы и доступ аварийных служб.', 'Street, drainage, pedestrian alternatives and emergency access.'],
        ['Где теряется доступ и какие обходы остаются возможными по сценарию.', 'Where access is lost and which alternatives remain possible in the scenario.']],
      ['URB-03', ['Жара и условия на улице', 'Heat and outdoor conditions'],
        ['Маршруты, затенение, состояние почвы и источники воды.', 'Routes, shade, soil state and water sources.'],
        ['Какие маршруты и зоны зависят от тени и увлажнения.', 'Which routes and areas depend on shade and moisture.']]
    ]
  },
  factory: {
    label: ['Фабрика · связь с территорией', 'Factory · territory interfaces'],
    example: 'factory', status: 'testPlanned',
    sources: [],
    tests: [
      ['FAC-01', ['Потеря внешнего питания или подъезда', 'Loss of external power or road access'],
        ['Резерв питания, критические ячейки, логистика, входы и маршруты персонала.', 'Backup power, critical cells, logistics, entrances and staff routes.'],
        ['Условия безопасной остановки, доступ к фабрике и порядок восстановления.', 'Safe shutdown conditions, site access and restart sequence.']]
    ]
  }
};
