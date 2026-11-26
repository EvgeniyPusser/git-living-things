export const houseProjectGroups = [
  {
    label: ['Проект и устройство', 'Project and construction'],
    fields: {
      projectBrief: [['Задача, участок и границы проекта', 'Brief, site and project boundaries'],
        ['Укажите назначение, место, пользователей, внешние подключения и стадию проекта.', 'Specify use, site, occupants, external connections and project stage.']],
      spatialProject: [['Объёмная модель и генплан', '3D model and site plan'],
        ['Укажите файл и ревизию DWG, DXF или IFC, единицы и систему координат. Обозначьте объём, этажи, зоны и крупные компоненты.', 'Identify the DWG, DXF or IFC file and revision, units and coordinates. Mark the volume, floors, zones and major components.']],
      structureProject: [['Каркас, оболочка и конструктивный расчёт', 'Frame, envelope and structural calculations'],
        ['Опишите материалы, несущие пути, стыки, сменные узлы и расчётные случаи. Перечислите чертежи и расчёты.', 'Describe materials, load paths, joints, replaceable assemblies and load cases. List drawings and calculations.']],
      supplyProject: [['Энергоснабжение, сети и ресурсы', 'Power, utilities and resources'],
        ['Перечислите системы, источники, потребителей, резервы и точки отключения. Укажите схемы и балансы.', 'List services, sources, loads, reserves and shutoff points. Identify diagrams and balances.']]
    }
  },
  {
    label: ['Наблюдение, гомеостаз и Конституция', 'Observation, homeostasis and Constitution'],
    fields: {
      minimumSensors: [['Минимальный набор датчиков', 'Minimum sensor set'],
        ['Для каждого сценария укажите канал, место, величину, единицы и частоту наблюдения. Опишите, как отличаете отказ датчика от изменения объекта.', 'For each scenario give each channel, location, quantity, units and sampling interval. Explain how you distinguish a sensor fault from a change in the object.']],
      nervousSystem: [['Нервная система и журнал', 'Nervous system and event log'],
        ['Проследите сигнал от датчика до контроллера, записи, действия и подтверждения результата. Опишите потерю питания и связи.', 'Trace the signal from sensor to controller, log, action and verification. Describe power and communication loss.']],
      homeostasisMap: [['Карта гомеостаза', 'Homeostasis map'],
        ['Для каждой функции укажите наблюдаемую величину, норму, признак отклонения, допустимую реакцию и критерий возврата.', 'For each function give the observed quantity, normal range, deviation trigger, permitted response and criterion for return.']],
      homeostasisControl: [['Система поддержания гомеостаза', 'Homeostasis control system'],
        ['Укажите контроллеры, исполнительные устройства, допустимые режимы, проверку результата и переход в безопасный режим.', 'Identify controllers, actuators, permissible modes, outcome checks and fallback modes.']],
      constitution: [['Конституция объекта', 'Object Constitution'],
        ['Запишите обязательные функции, ограничения, разрешённые действия и условия остановки или передачи решения человеку.', 'Record essential functions, constraints, allowed actions and conditions for stopping or handing decisions to a person.']],
      ownerInterface: [['Связь с хозяином и обслуживающей командой', 'Owner and maintenance interface'],
        ['Укажите, кому, по какому каналу и с какими данными приходит уведомление. Опишите права подтверждения, ручного вмешательства и изменения правил.', 'Specify recipients, channel and notification data. Describe approval, manual intervention and rule-change permissions.']],
      ownerConstitution: [['Конституция отношений с хозяевами', 'Constitution for relations with owners'],
        ['Укажите права владельцев, жильцов и службы обслуживания, пределы автономии дома, порядок согласования действий и правила доступа к данным, включая смену владельца.', 'Specify the rights of owners, occupants and maintainers, the limits of autonomy, approvals and data access, including transfer of ownership.']],
      environmentInterface: [['Связь с окружающей средой', 'Environmental interfaces'],
        ['Укажите внешние воздействия и обмен ресурсами. Разделите измеряемые условия и проектные допущения.', 'Specify external exposure and exchanges of resources. Distinguish measured conditions and design assumptions.']]
    }
  },
  {
    label: ['Повреждение, восстановление и развитие', 'Damage, recovery and development'],
    fields: {
      damageScenarios: [['Реакция на повреждение и разрушение', 'Response to damage and destruction'],
        ['Разберите локальный отказ, каскадный отказ и потерю функции. Для каждого укажите обнаружение, изоляцию, резерв и передачу управления.', 'Cover local failure, cascading failure and loss of function. For each specify detection, isolation, backup and handover.']],
      selfRecovery: [['Система самовосстановления', 'Self-recovery system'],
        ['Укажите, что восстанавливается, кто или что действует, какие ресурсы нужны и какая проверка завершает восстановление.', 'Specify what recovers, who or what acts, required resources and the final recovery check.']],
      morphogenesis: [['Морфогенез и изменение конфигурации', 'Morphogenesis and reconfiguration'],
        ['Опишите исходную конфигурацию, правила изменения формы, последовательность действий, ограничения и допустимую конечную конфигурацию.', 'Describe the initial configuration, rules for shape changes, operation sequence, constraints and permissible final configuration.']],
      lifecyclePlan: [['Планирование судьбы объекта', 'Lifecycle and future scenarios'],
        ['Опишите ввод, эксплуатацию, обслуживание, модернизацию, смену назначения и разборку. Задайте триггер и ответственного для каждого существенного перехода.', 'Cover commissioning, operation, maintenance, upgrades, repurposing and disassembly. Give the trigger and owner for each major transition.']],
      verificationPack: [['Доказательства, испытания и версии', 'Evidence, verification and revisions'],
        ['Укажите, что задумано, рассчитано, испытано или работает. Привяжите критерии, протоколы, данные и дату к ревизии проекта.', 'Record what is proposed, simulated, tested or operational. Link acceptance criteria, protocols, data and date to the design revision.']]
    }
  }
];

export const houseProjectFields = Object.assign({}, ...houseProjectGroups.map(group => group.fields));

export const domains = {
  buildings: {
    label: ['Здания', 'Buildings'],
    description: ['Здания, их конструкции, инженерные системы и компоненты, поддерживающие состояние сооружения.', 'Buildings, structures, services and components that help maintain a facility’s condition.'],
    fields: { loads: ['Нагрузки и расчётная схема', 'Loads and structural model'], climate: ['Параметры внутренней среды', 'Indoor environmental parameters'],
      ...Object.fromEntries(Object.entries(houseProjectFields).map(([key, [label]]) => [key, label])) }
  },
  transport: {
    label: ['Наземный и водный транспорт', 'Land and marine transport'],
    description: ['Автомобили, суда, бортовая диагностика, адаптивные подсистемы и узлы.', 'Cars, vessels, onboard diagnostics, adaptive subsystems and assemblies.'],
    fields: { cycles: ['Рабочие циклы и режимы движения', 'Duty cycles and operating modes'], energy: ['Силовая установка и питание', 'Powertrain and energy supply'] }
  },
  aviation: {
    label: ['Авиация', 'Aviation'],
    description: ['Летательные аппараты, мониторинг состояния, управление и компоненты авиационных систем.', 'Aircraft, condition monitoring, controls and aerospace components.'],
    fields: { envelope: ['Область режимов полёта', 'Flight envelope'], integration: ['Интеграция с бортовыми системами', 'Aircraft systems integration'] }
  },
  infrastructure: {
    label: ['Дороги и инфраструктура', 'Roads and infrastructure'],
    description: ['Дорожные и электрические сети, покрытия, сооружения и средства контроля и восстановления инфраструктуры.', 'Road and power networks, pavements, structures and infrastructure monitoring and recovery systems.'],
    fields: { traffic: ['Эксплуатационные нагрузки и трафик', 'Service loads and traffic'], exposure: ['Внешние воздействия', 'Environmental exposure'] }
  },
  robotics: {
    label: ['Роботы', 'Robots'],
    description: ['Роботы, их корпуса, приводы и рабочие органы, самодиагностика, адаптация и восстановление функций.',
      'Robots, their bodies, actuators and end effectors, with self-diagnosis, adaptation and functional recovery.'],
    fields: {
      robotWork: ['Задача и рабочая среда робота', 'Robot task and working environment'],
      robotMotion: ['Ходовая часть, кинематика и рабочие органы', 'Locomotion, kinematics and end effectors'],
      robotAutonomy: ['Автономность и вмешательство оператора', 'Autonomy and operator intervention']
    }
  },
  other: {
    label: ['Другие технические системы', 'Other technical systems'],
    description: ['Технические объекты вне основных областей и решения, применимые в нескольких отраслях.', 'Technical objects outside the other domains and solutions that span industries.'],
    fields: { parameters: ['Характерные параметры', 'Characteristic parameters'] }
  }
};

export const levels = {
  whole: ['Целый объект', 'Whole object'],
  system: ['Система', 'System'],
  assembly: ['Узел', 'Assembly'],
  component: ['Компонент', 'Component']
};
export const types = {
  hardware: ['Физический объект', 'Physical object'],
  material: ['Материал', 'Material'],
  software: ['Программное решение', 'Software'],
  hybrid: ['Гибридная система', 'Hybrid system']
};
export const properties = {
  preservation: ['Самосохранение', 'Self-preservation'],
  regulation: ['Поддержание состояния', 'State regulation'],
  diagnosis: ['Самодиагностика', 'Self-diagnosis'],
  adaptation: ['Адаптация', 'Adaptation'],
  recovery: ['Восстановление', 'Recovery'],
  inheritance: ['Передача опыта', 'Transfer of experience']
};
export const evidence = {
  author: ['Утверждение автора', 'Author claim'],
  simulation: ['Симуляция', 'Simulation'],
  experiment: ['Эксперимент', 'Experiment'],
  operation: ['Эксплуатация', 'Operation']
};
export const stages = { concept: ['Концепция', 'Concept'], simulation: evidence.simulation, experiment: ['Экспериментальный образец', 'Experimental prototype'], operation: evidence.operation };
export const relations = {
  part: ['Является частью', 'Is part of'],
  contains: ['Содержит', 'Contains'],
  uses: ['Использует', 'Uses'],
  function: ['Обеспечивает функцию для', 'Provides a function for'],
  derived: ['Происходит от', 'Derives from'],
  inherits: ['Наследует правило или решение от', 'Inherits a rule or decision from'],
  compatible: ['Совместим с', 'Is compatible with']
};
export const architectureFields = {
  frame: {
    label: ['Каркас и несущие элементы', 'Frame and load-bearing elements'],
    help: ['Укажите, какие элементы несут нагрузку, как они соединены и где передаются усилия. Приложите схему, чертёж или модель, если они есть.',
      'Identify the load-bearing elements, their connections and load paths. Attach a diagram, drawing or model if available.']
  },
  body: {
    label: ['Корпус, оболочка и материалы', 'Body, enclosure and materials'],
    help: ['Опишите корпус, защитные слои, материалы и заменяемые части. Для образца материала укажите состав или партию, геометрию и условия изготовления.',
      'Describe the body, protective layers, materials and replaceable parts. For a specimen, specify its composition or batch, geometry and manufacturing conditions.']
  },
  sensors: {
    label: ['Датчики и точки наблюдения', 'Sensors and observation points'],
    help: ['Для каждого канала укажите место, измеряемую величину, единицы и частоту регистрации. Отметьте, какие данные измерены, рассчитаны или пока запланированы.',
      'For each channel, give its location, quantity, units and sampling frequency. Identify measured, simulated and planned observations.']
  },
  networks: {
    label: ['Сети связи, питания и ресурсов', 'Communication, power and resource networks'],
    help: ['Покажите, как идут данные, питание и другие ресурсы. Укажите источники, потребителей, интерфейсы, резервирование и поведение при разрыве связи или питания.',
      'Show how data, power and other resources flow. Identify sources, consumers, interfaces, redundancy and behaviour after a communication or power loss.']
  },
  subsystems: {
    label: ['Рабочие системы и исполнительные устройства', 'Working systems and actuators'],
    help: ['Перечислите основные системы, их функции и зависимости. Для исполнительных устройств укажите, что они физически меняют и какие ресурсы используют.',
      'List major systems, their roles and dependencies. For actuators, state what they physically change and what resources they consume.']
  },
  control: {
    label: ['Управление и обратная связь', 'Control and feedback'],
    help: ['Свяжите наблюдение с действием: какое состояние считается допустимым, что запускает реакцию и по чему контроллер проверяет её результат.',
      'Link observation to action: define the acceptable state, what triggers a response and how the controller checks the outcome.']
  },
  recoveryPlan: {
    label: ['Диагностика, компенсация и восстановление', 'Diagnosis, compensation and recovery'],
    help: ['Укажите, какие отказы распознаются, что делает объект после отказа, какие резервы и внешняя помощь нужны и по какому критерию функция считается восстановленной.',
      'Specify recognised failures, the response, required reserves or external help, and the criterion for declaring the function restored.']
  },
  dataProcedure: {
    label: ['Данные, расчёты и процедуры проверки', 'Data, calculations and verification procedures'],
    help: ['Укажите входные файлы и их версии, процедуру проверки, вариант для сравнения, выходные данные и пределы вывода. Приложите расчёт, протокол или данные к паспорту.',
      'Record input files and versions, the verification procedure, comparison baseline, outputs and limits of the conclusion. Attach the calculation, protocol or data to the passport.']
  }
};
export const passportFields = {
  description: ['Краткое техническое описание', 'Technical summary'],
  author: ['Автор', 'Author'],
  organization: ['Организация', 'Organization'],
  composition: ['Состав и связи компонентов', 'Composition and component connections'],
  characteristics: ['Материалы, геометрия и характеристики', 'Materials, geometry and characteristics'],
  interfaces: ['Входы, выходы и интерфейсы', 'Inputs, outputs and interfaces'],
  conditions: ['Условия применения и ограничения', 'Operating conditions and constraints'],
  sources: ['Родительские разработки и источники', 'Parent developments and sources'],
  rules: ['Используемые или передаваемые правила и решения', 'Rules and decisions used or transferred'],
  transfer: ['Условия переноса', 'Transfer conditions'],
  license: ['Лицензия', 'License'],
  changes: ['Описание изменений', 'Change summary'],
  ...Object.fromEntries(Object.entries(architectureFields).map(([key, field]) => [key, field.label]))
};
export const attachmentCategories = {
  cad: ['Модель AutoCAD / BIM (DWG, DXF, IFC)', 'AutoCAD / BIM model (DWG, DXF, IFC)'],
  drawing: ['Чертёж или схема', 'Drawing or diagram'],
  calculation: ['Инженерный расчёт', 'Engineering calculation'],
  energy: ['Энергоснабжение и энергетический расчёт', 'Power supply and energy calculation'],
  system: ['Описание системы или спецификация', 'System description or specification'],
  data: ['Измерения, журналы или результаты', 'Measurements, logs or results'],
  protocol: ['Протокол или процедура проверки', 'Test protocol or procedure'],
  image: ['Фото или иллюстрация', 'Photo or illustration'],
  other: ['Другой файл', 'Other file']
};
export const attachmentLimits = { fileMiB: 50, passportMiB: 250 };
export const claimFields = {
  mechanism: ['Механизм реализации', 'Implementation mechanism'],
  effect: ['Что сохраняется, регулируется или восстанавливается', 'What is preserved, regulated or restored'],
  feedback: ['Наблюдения и обратная связь, в том числе планируемые', 'Observations and feedback, including planned methods'],
  limits: ['Условия, пределы и известные ограничения', 'Conditions, bounds and known limitations'],
  proof: ['Методы проверки, данные и публикации', 'Validation methods, data and publications'],
  role: ['Роль в более крупной системе', 'Role in a larger system']
};
