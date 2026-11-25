export const domains = {
  buildings: {
    label: ['Здания', 'Buildings'],
    description: ['Здания, их конструкции, инженерные системы и компоненты, поддерживающие состояние сооружения.', 'Buildings, structures, services and components that help maintain a facility’s condition.'],
    fields: { loads: ['Нагрузки и расчётная схема', 'Loads and structural model'], climate: ['Параметры внутренней среды', 'Indoor environmental parameters'] },
    tools: [
      ['Сборка здания из этажей', 'Building assembly from floors', 'https://evgeniypusser.github.io/living-building-assembly/'],
      ['Теплотехнический калькулятор', 'Thermal calculator', ['https://evgeniypusser.github.io/living-things-sim/calc/stend.html', 'https://evgeniypusser.github.io/living-things-sim/calc/bench.html']]
    ]
  },
  transport: {
    label: ['Автомобили и наземный транспорт', 'Automobiles and ground transport'],
    description: ['Наземные транспортные средства, бортовая диагностика, адаптивные подсистемы и узлы.', 'Ground vehicles, onboard diagnostics, adaptive subsystems and assemblies.'],
    fields: { cycles: ['Рабочие циклы и режимы движения', 'Duty cycles and driving modes'], energy: ['Силовая установка и питание', 'Powertrain and energy supply'] }
  },
  aviation: {
    label: ['Авиация', 'Aviation'],
    description: ['Летательные аппараты, мониторинг состояния, управление и компоненты авиационных систем.', 'Aircraft, condition monitoring, controls and aerospace components.'],
    fields: { envelope: ['Область режимов полёта', 'Flight envelope'], integration: ['Интеграция с бортовыми системами', 'Aircraft systems integration'] }
  },
  infrastructure: {
    label: ['Дороги и инфраструктура', 'Roads and infrastructure'],
    description: ['Дорожные сети, покрытия, сооружения и средства контроля и восстановления инфраструктуры.', 'Road networks, pavements, structures and infrastructure monitoring and recovery systems.'],
    fields: { traffic: ['Эксплуатационные нагрузки и трафик', 'Service loads and traffic'], exposure: ['Внешние воздействия', 'Environmental exposure'] }
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
  changes: ['Описание изменений', 'Change summary']
};
export const claimFields = {
  mechanism: ['Механизм реализации', 'Implementation mechanism'],
  effect: ['Что сохраняется, регулируется или восстанавливается', 'What is preserved, regulated or restored'],
  feedback: ['Наблюдения и обратная связь, в том числе планируемые', 'Observations and feedback, including planned methods'],
  limits: ['Условия, пределы и известные ограничения', 'Conditions, bounds and known limitations'],
  proof: ['Методы проверки, данные и публикации', 'Validation methods, data and publications'],
  role: ['Роль в более крупной системе', 'Role in a larger system']
};
