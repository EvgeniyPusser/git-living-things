const conceptSource = ['Учебный проект Living Things', 'Living Things design example'];
export const houseProjectExample = {
  projectBrief: ['H-01 · двухэтажный дом на одну семью. В проект входят здание, фасад F-01…F-12, местные сети и интерфейсы на границе участка. Стадия — концепция.',
    'H-01 · a two-storey single-family dwelling. The scope includes the building, facade panels F-01 to F-12, onsite services and site-boundary interfaces. Stage: concept.'],
  spatialProject: ['H-01-R01.ifc · планируемый файл. Единицы — мм, начало координат — пересечение осей A/1 на отметке чистого пола. В модели показать два этажа, каркас, фасад, техническую зону и трассы сетей.',
    'H-01-R01.ifc · planned file. Units: mm. Origin: intersection of axes A/1 at finished floor level. Show both storeys, frame, facade, plant zone and service routes.'],
  structureProject: ['Несущий путь: перекрытие → колонны и связи → фундамент. F-04 — сменная ненесущая панель на кронштейнах. Приложения: план и разрез A-01, узел F-04, расчёт каркаса и ветровой нагрузки на крепления.',
    'Load path: floor → columns and bracing → foundation. F-04 is a replaceable non-loadbearing panel on brackets. Attach plan and section A-01, detail F-04, frame and fastener wind-load calculations.'],
  supplyProject: ['Ввод → щит E-01 → вентиляция, шлюз, датчики. Резерв питает шлюз и локальный журнал. Отдельно приложить схему воды и отсечных устройств, баланс нагрузок и расчёт времени резерва.',
    'Service entry → board E-01 → ventilation, gateway and sensors. Backup powers the gateway and local log. Attach the water and isolation diagram, load schedule and backup runtime calculation.'],
  minimumSensors: ['Сценарий F-04: M-04 фиксирует намокание за стыком (сухо/влажно), R-01 фиксирует дождь (да/нет), шлюз регистрирует разрыв связи с обоими датчиками. Интервал в демонстрации — 60 с. Для других функций нужен свой набор.',
    'F-04 scenario: M-04 detects moisture behind the joint (dry/wet), R-01 detects rain (yes/no), and the gateway detects loss of contact with either sensor. Demo interval: 60 s. Other functions need their own channels.'],
  nervousSystem: ['M-04 и R-01 → местный контроллер → проверка качества сигнала → журнал с ID панели и временем → уведомление. При потере связи состояние панели помечается «неизвестно», журнал остаётся локально.',
    'M-04 and R-01 → local controller → signal quality check → log with panel ID and timestamp → notification. Loss of communication marks the panel state unknown and leaves the log onsite.'],
  homeostasisMap: ['Герметичность F-04: сухой стык → намокание → осмотр и замена уплотнения → повторный тест без протечки. Температура T-01: в заданном диапазоне → ниже нижней границы → запрос отопления → возврат в диапазон. Пропавший сигнал переводит функцию в состояние «неизвестно».',
    'F-04 seal: dry joint → moisture → inspect and replace the seal → pass the repeat test. T-01 temperature: in range → below lower bound → request heat → return to range. Signal loss marks the function state unknown.'],
  homeostasisControl: ['Термостат сравнивает T-01 с уставкой помещения, запрашивает отопление и контролирует возврат температуры в диапазон. При отказе T-01 локальный контроллер фиксирует потерю наблюдения и уведомляет владельца. Режим на случай отказа определяется проектом отопления.',
    'The thermostat compares T-01 to the room setpoint, requests heat and verifies that temperature returns to range. If T-01 fails, the local controller logs the loss and notifies the owner. The heating design defines the fallback mode.'],
  constitution: ['Каркас и пути эвакуации сохраняются. Автоматика может сообщить об отклонении и записать событие. Работы с панелью подтверждает обслуживающий специалист. При признаках повреждения каркаса применяется отдельный аварийный план.',
    'Keep the loadbearing frame and escape routes available. Automation may notify and log deviations. A maintenance specialist authorises panel work. Suspected frame damage triggers a separate emergency plan.'],
  ownerInterface: ['В местной панели владелец получает ID F-04, время, сигнал датчика и статус проверки. Владелец подтверждает получение, обслуживающий специалист закрывает событие после проверки. Изменение Конституции фиксируется новой ревизией.',
    'The local dashboard gives the owner the F-04 ID, timestamp, sensor reading and verification status. The owner acknowledges it and the specialist closes the event after testing. Constitution changes are versioned.'],
  ownerConstitution: ['Жильцы видят тревоги, связанные с их безопасностью. Дом сам ведёт наблюдение, журнал и регулирование в согласованных пределах. Владелец утверждает расходы, изменение конфигурации и новые правила. Работы с F-04 и возврат в обычный режим подтверждает специалист. При споре сохраняются требования безопасности и действующая ревизия. Доступ службы ограничивается заявкой. При смене владельца передают техническую историю и пересматривают права доступа.',
    'Occupants see alerts relevant to their safety. The house monitors, logs and regulates within agreed bounds. The owner approves costs, configuration changes and new rules. A specialist confirms F-04 work and return to service. During disputes, safety requirements and the current revision remain in effect. Service access is limited to the work order. Ownership transfer includes technical history and a review of access rights.'],
  environmentInterface: ['Входы: дождь, наружная влажность, состояние внешнего питания. Выходы: отвод дождевой воды, теплообмен, потребление энергии. Сигнал дождя помогает объяснить намокание панели.',
    'Inputs: rain, outdoor humidity and external power availability. Outputs: water drainage, heat exchange and energy consumption. Rain readings help interpret moisture behind the panel.'],
  damageScenarios: ['Локальное намокание — проверить F-04. Пропали несколько соседних сигналов — проверить общий шлюз и питание. Обрушение или подозрение на потерю несущей способности — ограничить доступ и передать решение ответственному специалисту.',
    'Local moisture: inspect F-04. Loss of several adjacent signals: check their gateway and supply. Collapse or suspected loss of capacity: restrict access and hand over to the responsible specialist.'],
  selfRecovery: ['Дом сам обнаруживает отклонение и сохраняет историю. Обслуживающая команда меняет уплотнение или кассету F-04. После проверки на герметичность контроллер фиксирует возврат в норму. Ресурс — сменный узел и доступ к нему.',
    'The house detects the deviation and keeps its history. The maintenance team replaces the seal or F-04 cassette. After the leak test, the controller records the return to normal. Resources include a spare assembly and access.'],
  morphogenesis: ['Переход R01 → R02: заменить непрозрачную кассету F-04 совместимым модулем с прежней сеткой креплений. Обновить ID, подключить датчик и повторить проверки. Несущий каркас и границы обслуживаемых зон сохраняются.',
    'R01 → R02: replace the opaque F-04 cassette with a compatible module on the same bracket grid. Update its ID, reconnect the sensor and repeat verification. The frame and service boundaries stay intact.'],
  lifecyclePlan: ['Ввод: проверить датчики и зафиксировать исходную ревизию. Эксплуатация: осмотры по событиям и графику. Модернизация или смена назначения: решение владельца и инженера, перерасчёт изменившихся требований, новая ревизия. Разборка: ведомость повторно используемых модулей.',
    'Commissioning: check sensors and record the baseline revision. Operation: scheduled and event-driven inspection. Upgrade or repurposing: owner and engineer approval, reassess changed requirements and issue a new revision. Disassembly: inventory reusable modules.'],
  verificationPack: ['R01: макет стыка F-04, журнал M-04/R-01 и протокол орошения до и после замены. Успех — событие обнаружено и повторный тест сухой. Испытание запланировано. Модель, расчёты и протокол загружаются после сохранения черновика.',
    'R01: F-04 joint mock-up, M-04/R-01 log and spray test before and after replacement. Success: detect the event and pass the repeat test without ingress. The test is planned. Attach the model, calculations and protocol after saving the draft.']
};

export const concreteStudy = {
  immersionDays: 100,
  widths: [
    { label: ['Образцы с добавкой', 'Treated specimens'], mm: 0.46 },
    { label: ['Контроль', 'Control'], mm: 0.18 }
  ],
  abstract: 'https://www.sciencedirect.com/science/article/abs/pii/S0958946511000618'
};

function concept({ domain, title, image, imageAlt, imageCaption, type = 'hybrid', level = 'whole', summary, design, documents, procedure, outcome }) {
  return { domain, title, image, imageAlt, imageCaption, type, level, summary, design, documents, procedure, outcome,
    stage: 'concept', property: 'recovery', evidenceLabel: ['Проектные данные', 'Design assumptions'], source: conceptSource, links: [] };
}

export const examples = {
  buildings: {
    title: ['Образец самовосстанавливающегося бетона', 'A self-healing concrete specimen'],
    image: 'concrete.png',
    imageAlt: ['Бетонный образец с видимой трещиной', 'A concrete specimen with a visible crack'],
    type: 'material', level: 'component', stage: 'experiment', evidence: 'experiment', property: 'recovery',
    source: ['Wiktor и Jonkers, TU Delft, 2011', 'Wiktor and Jonkers, TU Delft, 2011'],
    summary: ['Лабораторный пример для материала, который может использоваться в стене или фасадной панели.',
      'A laboratory example for a material that could be used in a wall or facade panel.'],
    documents: ['Паспорт образца, фото поверхности со шкалой, чертёж панели при наличии, протокол и журнал измерений.',
      'Specimen record, scaled photos of the surface, panel drawing if available, test protocol and measurement log.'],
    columns: ['sample_id', 'mix_id', 'elapsed_days', 'initial_crack_width_mm', 'current_crack_width_mm', 'test_condition'],
    procedure: ['Сопоставьте образцы с добавкой и контрольные образцы по условиям выдержки и ширине трещины. Отдельно фиксируйте визуальное закрытие и водонепроницаемость, если её измеряли.',
      'Compare treated and control specimens by exposure conditions and crack width. Record visual closure and watertightness separately if both were measured.'],
    rows: concreteStudy.widths.map(({ label, mm }) => [label, ['До ' + String(mm).replace('.', ',') + ' мм', 'Up to ' + mm + ' mm']]),
    columnsLabel: [['Группа', 'Group'], ['Ширина закрывшихся трещин после 100 суток', 'Width of healed cracks after 100 days']],
    outcome: ['Опубликованные значения относятся к этому лабораторному испытанию при выдержке в воде. Оценка несущей способности требует отдельной проверки.',
      'These published values apply to this laboratory test in water. Structural capacity requires a separate test.'],
    related: [['Проект будущего дома', 'Future building concept'], ['Фасадная панель', 'Facade panel'], ['Образец материала', 'Material specimen']],
    links: [[['Статья и условия испытания', 'Paper and test conditions'], 'https://research.tudelft.nl/en/publications/quantification-of-crack-healing-in-novel-bacteria-based-self-heal/']]
  },
  transport: {
    title: ['Автомобиль Living Car', 'Living Car vehicle'],
    image: 'car-future.jpeg',
    imageAlt: ['Футуристический электромобиль в разрезе с датчиками деформации и адаптивным силовым каркасом', 'Futuristic electric car in cutaway with strain sensors and an adaptive load-bearing frame'],
    imageCaption: ['Концепт. Датчики обнаруживают деформацию, а адаптивный каркас переносит нагрузку на целые элементы. Ниже приведены результаты отдельной симуляции Living Car.',
      'Concept. Sensors detect deformation and the adaptive frame redirects loads through intact members. Results of a separate Living Car simulation appear below.'],
    type: 'hybrid', level: 'assembly', stage: 'simulation', evidence: 'simulation', property: 'adaptation',
    source: ['Living Car, эксперимент 4ab84340858432ca9ad3', 'Living Car, experiment 4ab84340858432ca9ad3'],
    summary: ['В симуляции сопоставлены изолированное обучение и обмен проверенными рекомендациями между автомобилями.',
      'The simulation compares isolated learning with a regime that exchanges validated recommendations between vehicles.'],
    documents: ['Модель узла и его настроек, журнал испытаний, одинаковые для двух групп начальные условия и метрики повреждения, силы и энергозатрат.',
      'Assembly model and settings, test log, matched starting conditions and metrics for damage, force and energy.'],
    columns: ['run_id', 'scenario_id', 'learning_mode', 'damage_proxy', 'peak_force_n', 'recovery_energy_j'],
    procedure: ['Сопоставьте группы на одинаковых сценариях. Сравните повреждение, пиковую силу и энергию по отдельности.',
      'Match groups across the same scenarios. Compare damage, peak force and energy separately.'],
    columnsLabel: [['Показатель', 'Metric'], ['Изолированное обучение', 'Isolated learning'], ['Коллективный режим', 'Collective regime']],
    rows: [
      [['Показатель остаточного повреждения', 'Residual damage proxy'], '0.09962', '0.09137'],
      [['Пиковая контактная сила, Н', 'Peak contact force, N'], '20,337', '20,591'],
      [['Энергия адаптации и ремонта, Дж', 'Adaptation and repair energy, J'], '225.2', '202.3']
    ],
    outcome: ['В коллективном режиме повреждение и затраты энергии снизились, а пиковая сила выросла. Эти показатели получены в симуляции.',
      'The collective regime reduced damage and energy use, while increasing peak force. These values come from simulation.'],
    links: [[['Открыть Living Car', 'Open Living Car'], 'https://evgeniypusser.github.io/living-car/'],
      [['Сводка расчётных результатов', 'Simulation report'], '/research/car/population.md']]
  },
  aviation: {
    title: ['Самолёт Living Aircraft · адаптивное крыло', 'Living Aircraft · adaptive wing'],
    image: 'wing-cruise.png', sourceImage: true,
    imageAlt: ['Расчётная геометрия гибкого крыла Living Aircraft', 'Computed geometry of the flexible Living Aircraft wing'],
    type: 'hybrid', level: 'system', stage: 'simulation', evidence: 'simulation', property: 'adaptation',
    source: ['Living Aircraft, этап 1, установившийся полёт 1g', 'Living Aircraft, Stage 1, steady 1g cruise'],
    summary: ['Модель гибкого крыла сравнивает фиксированную геометрию с изменяемой круткой при одинаковой требуемой подъёмной силе.',
      'A flexible-wing model compares fixed geometry with adjustable twist at the same required lift.'],
    documents: ['Геометрия крыла, расчётный режим, граничные условия, настройки привода и результаты расчёта по двум вариантам.',
      'Wing geometry, operating case, boundary conditions, actuator settings and results for the two variants.'],
    columns: ['run_id', 'flight_case', 'twist_mode', 'tip_deflection_m', 'peak_stress_pa', 'induced_drag_n'],
    procedure: ['Зафиксируйте полётный режим и требуемую подъёмную силу. Сравните прогиб, напряжения и сопротивление до и после изменения крутки.',
      'Hold flight conditions and required lift constant. Compare deflection, stress and drag before and after the change in twist.'],
    columnsLabel: [['Показатель', 'Metric'], ['Фиксированное крыло', 'Fixed wing'], ['Адаптивное крыло', 'Adapted wing']],
    rows: [
      [['Прогиб конца крыла, м', 'Tip deflection, m'], '1.176', '0.7484'],
      [['Пиковое напряжение, МПа', 'Peak stress, MPa'], '126.5', '103.3'],
      [['Индуктивное сопротивление, кН', 'Induced drag, kN'], '48.66', '68.45']
    ],
    outcome: ['В расчёте адаптация уменьшила прогиб и напряжение и увеличила сопротивление. Это результат модели синтетического крыла.',
      'In the simulation, adaptation reduced deflection and stress and increased drag. The results apply to a synthetic wing model.'],
    links: [[['Отчёт Living Aircraft', 'Living Aircraft report'], '/research/aircraft/RESULTS.md']]
  },
  infrastructure: {
    title: ['Ремонт участка виадука на A20', 'Repair of a section of the A20 viaduct'],
    image: 'viaduct.png',
    imageAlt: ['Иллюстрация ремонтированного участка бетонного виадука', 'Illustration of a repaired section of a concrete viaduct'],
    type: 'hardware', level: 'component', stage: 'operation', evidenceLabel: ['Объект описан поставщиком', 'Project documented by supplier'],
    property: 'recovery',
    source: ['Basilisk, виадук Schollevaartsetocht, 2020', 'Basilisk, Schollevaartsetocht viaduct, 2020'],
    summary: ['На объекте возле Роттердама применили самовосстанавливающийся ремонтный раствор Basilisk MR3. Паспорт можно оформить для ремонтированного участка.',
      'Basilisk MR3 self-healing repair mortar was used near Rotterdam. The repaired section can have its own passport.'],
    documents: ['Схема и идентификатор участка, фото до и после, материал и дата ремонта, условия эксплуатации и журнал повторных осмотров.',
      'Repair location and ID, before-and-after photos, materials and date, operating conditions and follow-up inspection log.'],
    columns: ['section_id', 'repair_date', 'inspection_date', 'crack_width_mm', 'leakage_observation', 'photo_id'],
    procedure: ['Сопоставьте снимки и замеры одних и тех же участков до ремонта и при повторных осмотрах. Отдельно фиксируйте замыкание трещины и протечки.',
      'Compare photos and measurements from the same locations before repair and at follow-up inspections. Record crack closure and leakage separately.'],
    outcome: ['В описании объекта указано применение раствора на 20 м². Для оценки результата во времени понадобятся данные повторных осмотров.',
      'The project description records 20 m² of repairs. Follow-up inspection data would be needed to evaluate the outcome over time.'],
    related: [['Виадук', 'Viaduct'], ['Ремонтированный участок', 'Repaired section'], ['Ремонтный раствор', 'Repair mortar']],
    links: [[['Описание объекта A20', 'A20 project description'], 'https://basiliskconcrete.com/portfolio-items/betonherstel-viaduct-a20-met-reparatiemortel-mr3/'],
      [['Самовосстанавливающийся бетон в подземном переходе', 'Self-healing concrete in a railway underpass'], 'https://www.prorail.nl/nieuws/bacterie-maakt-beton-van-tunnel-rijen-zelfhelend']]
  },
  robotics: {
    title: ['Робот, который меняет походку после повреждения', 'A robot that adapts its gait after damage'],
    image: 'robot.png',
    imageAlt: ['Иллюстрация четырёхногого лабораторного робота', 'Illustration of a four-legged laboratory robot'],
    type: 'hybrid', level: 'whole', stage: 'experiment', evidence: 'experiment', property: 'recovery',
    source: ['Bongard, Zykov и Lipson, Science, 2006', 'Bongard, Zykov and Lipson, Science, 2006'],
    summary: ['Лабораторный робот с четырьмя ногами обновлял модель своего тела по отклику датчиков на команды приводам. После удаления части ноги он находил другую походку.',
      'A four-legged laboratory robot updated its body model from the sensor response to actuator commands. After part of one leg was removed, it found an alternative gait.'],
    documents: ['Чертёж шасси и кинематика, карта приводов и каналов наблюдения, схема питания и обмена данными, описание контроллера и журналы движения.',
      'Chassis and kinematics drawings, actuator and sensor maps, power and data diagrams, controller specification and motion logs.'],
    columns: ['trial_id', 'body_configuration', 'controller_version', 'gait_id', 'displacement_m', 'duration_s'],
    procedure: ['Зафиксируйте состояние корпуса и конфигурацию ног, запишите исходную походку, затем сопоставьте движение после контролируемого изменения конфигурации до и после адаптации.',
      'Record the body and leg configuration and baseline gait, then compare movement after a controlled configuration change before and after adaptation.'],
    outcome: ['Авторы показали восстановление способности передвигаться с помощью новой походки. В паспорте это записывается как восстановление функции движения.',
      'The researchers demonstrated recovery of locomotion through a new gait. Record this as recovery of the movement function.'],
    related: [['Робот', 'Robot'], ['Датчики и приводы', 'Sensors and actuators'], ['Модель собственного тела', 'Body self-model']],
    links: [[['Статья и описание эксперимента', 'Paper and experimental description'], 'https://pubmed.ncbi.nlm.nih.gov/17110570/']]
  },
  other: {
    title: ['Правило выбора способа восстановления', 'A rule for choosing a recovery action'],
    image: 'v3-truss.png', sourceImage: true,
    imageAlt: ['Схема стержневого стенда Living Things V3', 'Diagram of the Living Things V3 truss testbed'],
    type: 'software', level: 'component', stage: 'simulation', evidence: 'simulation', property: 'recovery',
    source: ['Living Things V3, «Спасение и будущие варианты»', 'Living Things V3, recovery scenarios'],
    summary: ['Программное правило выбирает действие после отказа по доступному запасу и путям восстановления. Здесь оно проверяется на модели стержневой конструкции.',
      'A software rule selects a response to failure from the available reserves and recovery paths. Here it is tested on a truss model.'],
    documents: ['Версия правила, состояние объекта, доступные ресурсы, список действий, ограничение по нагрузке и критерий работоспособности.',
      'Rule version, object state, available resources, allowed actions, load limit and a success criterion.'],
    columns: ['scenario_id', 'rule_version', 'resource_policy', 'step', 'functioning_cases', 'total_cases'],
    procedure: ['Запустите обе политики при одинаковых внешних воздействиях и сравните число ветвей, сохранивших функцию к шагу 12.',
      'Run both policies with paired external events and compare the number of branches that function at step 12.'],
    columnsLabel: [['Сценарий', 'Scenario'], ['Запас сохранён', 'Reserve retained'], ['Запас потрачен', 'Reserve spent']],
    rows: [
      [['Базовый сценарий', 'Baseline'], '372 / 500', '0 / 500'],
      [['Все три фактора, приоритет X', 'All three factors, X first'], '305 / 500', '384 / 500']
    ],
    outcome: ['Эффект сохранения запаса меняет знак при других условиях, поэтому в паспорте правила важно сохранить параметры сценария и приоритет выбора.',
      'The benefit of retaining reserves reverses under other conditions, so the rule passport should retain the scenario settings and action priority.'],
    links: [[['Открыть стенд V3', 'Open the V3 simulator'], 'https://evgeniypusser.github.io/living-things-v3/'],
      [['Протокол и результаты', 'Protocol and results'], 'https://evgeniypusser.github.io/living-things-v3/results.html']]
  },
  house: concept({
    domain: 'buildings', title: ['Будущий живой дом', 'Future living building'],
    image: 'house-future.jpeg', imageAlt: ['Разрез футуристического дома со сменным фасадом и датчиками у стыков', 'Cutaway of a futuristic home with replaceable facade panels and sensors at their joints'],
    imageCaption: ['Концепт. Датчик отмечает протечку у стыка. Повреждённая панель снимается снаружи, пока каркас и инженерные сети продолжают работать.',
      'Concept. A sensor flags leakage at a joint. The damaged panel can be removed from outside while the frame and building services stay in use.'],
    summary: ['Проект двухэтажного дома. Повреждённую фасадную панель предполагается менять по отдельности, а протечку обнаруживать по датчикам влажности.', 'A two-storey building concept. A damaged facade panel can be replaced individually, and moisture sensors are intended to detect leaks.'],
    design: {
      frame: ['Колонны, перекрытия и связи передают нагрузки на фундамент. Фасад опирается на отдельные крепления.', 'Columns, floors and bracing transfer loads to the foundation. Separate brackets support the facade.'],
      body: ['Сменные панели F-01…F-12 с дренируемым зазором.', 'Replaceable panels F-01 to F-12 with a drained cavity.'],
      sensors: ['Датчик влажности за нижним стыком каждой панели, сигнал хранится с ID панели.', 'A moisture sensor behind each lower panel joint. Records carry the panel ID.'],
      networks: ['Щит здания питает шлюз и датчики. Шлюз ведёт локальный журнал непрерывности связи.', 'The building panel powers the gateway and sensors. The gateway keeps a local connectivity log.'],
      recoveryPlan: ['Найти панель по журналу, проверить стык, заменить уплотнение или панель и повторить испытание на протечку.', 'Locate the panel in the log, inspect the joint, replace the seal or panel, and repeat the leak test.']
    },
    documents: ['A-01 (DWG): планы, разрез и сетка колонн. F-04 (DXF): крепление панели. E-01: однолинейная схема, баланс нагрузок и питание шлюза.', 'A-01 (DWG): plans, section and column grid. F-04 (DXF): panel bracket. E-01: single-line diagram, load schedule and gateway power.'],
    procedure: ['В испытании отдельного фрагмента подать воду на стык F-04, записать отклик датчика, заменить уплотнение и повторить подачу воды.', 'In a mock-up, apply water to joint F-04, log the sensor response, replace the seal, and repeat the test.'],
    outcome: ['Критерий будущего испытания: обнаружена протечка до ремонта, а после замены вода не попадает за стык.', 'Planned acceptance criterion: detect leakage before repair and observe no water behind the repaired joint.']
  }),
  facade: concept({
    domain: 'buildings', title: ['Сменная фасадная панель', 'Replaceable facade panel'],
    image: 'welcome/living-wall-detail.png', imageAlt: ['Иллюстрация конструкции фасадной панели', 'Illustration of the facade panel assembly'],
    type: 'hardware', level: 'assembly',
    summary: ['Панель F-04 как самостоятельный объект внутри паспорта дома. Узел крепления доступен для осмотра и замены.', 'Panel F-04 is an object within the building passport. Its mounting assembly is accessible for inspection and replacement.'],
    design: {
      frame: ['Панель висит на регулируемых кронштейнах, закреплённых к подсистеме фасада.', 'Adjustable brackets connect the panel to the facade support system.'],
      body: ['Облицовка, вентилируемый зазор, мембрана и сменное уплотнение стыка.', 'Cladding, ventilated cavity, membrane and replaceable joint seal.'],
      sensors: ['Влажность за нижним стыком, фото стыка с масштабной линейкой.', 'Moisture behind the lower joint, with a scale in inspection photos.'],
      recoveryPlan: ['Заменить уплотнение и сравнить сигнал датчика до и после дождевого испытания.', 'Replace the seal and compare sensor data before and after the rain test.']
    },
    documents: ['F-04 (DXF): поперечный разрез. F-04-C: расчёт крепления на ветровую нагрузку. F-04-M: ведомость материалов.', 'F-04 (DXF): cross-section. F-04-C: wind load calculation for the fasteners. F-04-M: materials schedule.'],
    procedure: ['Привязать протокол орошения к панели F-04 и ревизии чертежа. Записать место первого намокания и время с начала испытания.', 'Link the spray test report to panel F-04 and its drawing revision. Record the first wet location and elapsed time.'],
    outcome: ['Критерий будущего испытания: сухая внутренняя сторона стыка в повторном тесте.', 'Planned acceptance criterion: the inside of the joint remains dry on retest.']
  }),
  factory: concept({
    domain: 'robotics', title: ['Роботизированная фабрика', 'Robot-operated factory'],
    image: 'factory.jpeg', imageAlt: ['Две роботизированные ячейки на сборочной линии', 'Two robot cells on an assembly line'],
    summary: ['Сборочная линия с двумя ячейками. При остановке основного робота незавершённая деталь учитывается отдельно, а следующая партия уходит в резервную ячейку.', 'An assembly line with two cells. On loss of the primary robot, the unfinished part is tracked separately and the next batch goes to the backup cell.'],
    design: {
      frame: ['Две ограждённые ячейки R1 и R2, рольганг с буфером между ними.', 'Two guarded cells R1 and R2, with a roller conveyor and buffer between them.'],
      sensors: ['Датчики присутствия лотков, состояние приводов, камера контроля сборки.', 'Tray presence sensors, drive status and an assembly inspection camera.'],
      networks: ['Промышленная сеть для диспетчеризации. Контуры аварийного останова автономны от диспетчера.', 'Industrial network for dispatch. Emergency-stop circuits are independent of the dispatcher.'],
      control: ['Диспетчер сохраняет ID детали, операцию и результат контроля при каждой передаче.', 'The dispatcher records part ID, operation and inspection result at each handoff.'],
      recoveryPlan: ['Изолировать R1, отложить незавершённую деталь на проверку и после разрешения контроллера направить следующую в R2.', 'Isolate R1, hold the unfinished part for review, then dispatch the next part to R2 after the controller gives clearance.']
    },
    documents: ['LAY-01 (DWG): план линии. PWR-02: схема питания и расчёт пусковых нагрузок. IO-01: карта сигналов. QA-01: протокол контроля деталей.', 'LAY-01 (DWG): line layout. PWR-02: power diagram and start-up load schedule. IO-01: signal map. QA-01: part inspection protocol.'],
    procedure: ['На виртуальном стенде смоделировать отказ R1 на операции сборки. Сверить ID всех лотков и журнал работы R2.', 'Simulate R1 failing mid-assembly in a virtual testbed. Reconcile tray IDs and the R2 event log.'],
    outcome: ['Цель испытания: первые десять деталей через R2 проходят контроль, статус каждого лотка восстановим по журналу.', 'Trial target: the first ten parts processed by R2 pass inspection and all tray states can be reconstructed from the log.']
  }),
  ship: concept({
    domain: 'transport', title: ['Корабль с резервным энергоснабжением', 'Vessel with backup power'],
    image: 'ship-future.jpeg', imageAlt: ['Футуристический тримаран в разрезе с изолированным отсеком и резервным питанием', 'Futuristic trimaran in cutaway with an isolated compartment and backup power'],
    imageCaption: ['Концепт. Переборка локализует затопление, а резервная линия питает критические системы через сухие отсеки.',
      'Concept. A bulkhead contains flooding while a backup circuit feeds critical systems through dry compartments.'],
    summary: ['Проект прибрежного рабочего судна с двумя секциями питания. При отказе одной секции сохраняются связь, навигация и контроль машинного отделения.', 'A coastal service vessel design with two power sections. Loss of one section leaves communications, navigation and machinery monitoring available.'],
    design: {
      frame: ['Корпус с водонепроницаемыми переборками, разделяющими машинные отсеки.', 'Hull with watertight bulkheads separating machinery compartments.'],
      sensors: ['Ток и напряжение секций A/B, уровень воды в льялах, состояние основных потребителей.', 'Current and voltage on sections A/B, bilge levels and critical load status.'],
      networks: ['Секции A/B главного щита и отдельное резервное питание по перечню критических нагрузок.', 'Main switchboard sections A/B and separate backup power for the listed critical loads.'],
      recoveryPlan: ['Изолировать неисправную секцию, отложить второстепенные нагрузки и подтвердить питание критических систем по журналу.', 'Isolate the faulted section, defer nonessential loads and confirm critical system power in the event log.']
    },
    documents: ['GA-01 (DWG): общий вид и отсеки. E-02: схема щита. E-03: баланс мощности по режимам. AL-01: карта аварийных сигналов.', 'GA-01 (DWG): general arrangement and compartments. E-02: switchboard schematic. E-03: load balance by mode. AL-01: alarm list.'],
    procedure: ['В модели отключить секцию A на стоянке, проверить резерв и записать доступность каждого критического потребителя.', 'In the model, disable section A while alongside, check backup supply, and log availability of each critical load.'],
    outcome: ['Цель испытания: питание критических систем сохраняется, переключение видно в журнале.', 'Trial target: critical systems retain power, and the transfer is recorded in the log.']
  }),
  grid: concept({
    domain: 'infrastructure', title: ['Распределительная электросеть', 'Power distribution network'],
    image: 'grid-future.jpeg', imageAlt: ['Модульный энергоузел с накопителями и резервной ветвью распределительной сети', 'Modular power station with energy storage and a backup distribution feeder'],
    imageCaption: ['Концепт. Повреждённая ветвь изолирована. Исправная ветвь сохраняет питание критических потребителей.',
      'Concept. The damaged branch is isolated. An intact feeder keeps critical loads powered.'],
    level: 'system',
    summary: ['Учебная модель двух фидеров 10 кВ с резервной связью и узлом критической нагрузки. В модели сравнивается отключение участка с восстановлением через соседний фидер.', 'A design example with two 10 kV feeders, a backup tie and a critical load node. It compares leaving a section out of service with restoring supply from the adjacent feeder.'],
    design: {
      frame: ['Узлы S1/S2, фидеры F1/F2, секционирующие аппараты и нормально разомкнутая связь T1.', 'Nodes S1/S2, feeders F1/F2, sectionalising devices and normally open tie T1.'],
      sensors: ['Ток, напряжение и положение аппаратов с метками времени.', 'Time-stamped current, voltage and switch position.'],
      control: ['Сценарии переключений сравниваются вне действующей сети по модели потокораспределения.', 'Switching scenarios are compared off-network in a power-flow model.'],
      recoveryPlan: ['В модели исключить повреждённый участок и проверить резервный маршрут до узла критической нагрузки.', 'In the model, isolate the failed segment and evaluate the alternate path to the critical load.']
    },
    documents: ['SLD-01 (DWG): однолинейная схема. LF-01: расчёт потоков и напряжений. PR-01: описание защит. EV-01: журнал событий модели.', 'SLD-01 (DWG): single-line diagram. LF-01: power flow and voltage calculations. PR-01: protection description. EV-01: simulated event log.'],
    procedure: ['Сопоставить два сценария отказа участка F1 и записать восстановленную нагрузку, напряжение на узлах и загрузку F2.', 'Compare two F1 outage scenarios and log restored load, node voltages and utilisation of F2.'],
    outcome: ['Цель испытания: резервный маршрут восстанавливает критическую нагрузку в расчёте в пределах ограничений модели.', 'Trial target: the alternate route restores critical load within the model limits.']
  })
};

export const exampleDomain = key => examples[key].domain || key;

export function exampleImagePath({ image }) {
  return image.includes('/') ? 'assets/' + image : 'assets/examples/' + image;
}

export const guideCases = {
  buildings: {
    label: ['Бетонный образец', 'Concrete specimen'],
    scope: ['Заведите паспорт на образец или партию материала. Укажите ID образца, номер партии, геометрию и группу сравнения.',
      'Create a record for the specimen or batch. Include the specimen ID, batch number, geometry and comparison group.'],
    claim: ['Запишите эффект «закрытие трещин». Укажите ширину в миллиметрах, точки замера и условия выдержки. В паспорте панели можно отдельно описать роль этого материала.',
      'Record crack closure as the effect. Specify width in millimetres, measurement locations and exposure conditions. Document the material’s role separately in the panel record if available.'],
    design: ['В материалах и геометрии укажите состав и размеры образца по паспорту партии. В наблюдениях свяжите каждый замер с образцом и конкретной трещиной.',
      'Under materials and geometry, use the batch record for composition and dimensions. Link every measurement to a specimen and crack.']
  },
  house: {
    label: ['Дом', 'Building'],
    scope: ['Заведите паспорт на здание целиком. Панель F-04, сеть датчиков и щит можно описать отдельными паспортами и связать со зданием.',
      'Create a record for the whole building. Panel F-04, the sensor network and the switchboard can have separate linked records.'],
    claim: ['Заявите обнаружение протечки и восстановление герметичности стыка после замены уплотнения. Укажите, что датчик измеряет влажность за панелью и что проверка ещё запланирована.',
      'Document leak detection and restoration of the joint seal after gasket replacement. Specify that the sensor monitors moisture behind the panel and the test is planned.'],
    references: [[['DOE · исследование влажностного режима стен', 'DOE · wall moisture performance study'], 'https://www.energy.gov/cmei/buildings/articles/moisture-performance-high-r-wall-systems-0']],
    missing: ['Нужны исходные DWG/BIM, схема питания датчиков и результаты испытания стыка на макете.',
      'Obtain the DWG/BIM files, sensor power diagram and joint test results from a mock-up.']
  },
  facade: {
    label: ['Фасадная панель', 'Facade panel'],
    scope: ['Заведите паспорт на панель F-04 с точным местом установки и обозначением узла. Свяжите панель с паспортом здания.',
      'Create a record for panel F-04 with its exact location and assembly reference. Link the panel to the building record.'],
    claim: ['Опишите возврат герметичности стыка после замены уплотнения. Отдельно укажите, как проверяется ветровая нагрузка на крепления.',
      'Describe restoration of joint watertightness after seal replacement. Record the fastener wind-load check separately.'],
    references: [[['ASTM E3223/E3223M · как документировать макет наружной стены', 'ASTM E3223/E3223M · specifying a wall mock-up'], 'https://store.astm.org/e3223_e3223m-20.html']],
    missing: ['Нужны разрез узла, расчёт креплений и протокол орошения с двумя сериями наблюдений — до и после замены.',
      'Obtain the joint section drawing, fastener calculation and spray test records before and after replacement.']
  },
  transport: {
    label: ['Автомобиль', 'Car'],
    scope: ['Для примера Living Car заведите паспорт адаптивного узла. Если описываете автомобиль целиком, заведите отдельный паспорт и привяжите к нему узел.',
      'For the Living Car example, create a passport for the adaptive assembly. Describe the whole vehicle in a separate passport and link the assembly to it.'],
    claim: ['Опишите выбор действия по оценке повреждения и доступному запасу энергии. Зафиксируйте отдельные показатели остаточного повреждения, пиковой силы и затрат энергии.',
      'Describe how the action is chosen using the damage estimate and available energy. Record residual damage, peak force and energy use as separate measures.'],
    design: ['Укажите, какой узел моделируется, где приложена нагрузка и какие переменные передаются между автомобилями. Привяжите настройки контроллера к версии расчётной модели.',
      'Identify the assembly, loading point and variables shared between vehicles. Link controller settings to the simulation model version.'],
    missing: ['Для независимого пересчёта нужны журналы отдельных прогонов и их конфигурации. Для проверки на физическом узле нужен отдельный протокол стендовых испытаний.',
      'Independent reproduction requires individual run logs and configurations. Physical validation requires a separate bench test protocol.']
  },
  factory: {
    label: ['Роботизированная фабрика', 'Robot-operated factory'],
    scope: ['Заведите паспорт на сборочную линию с ячейками R1 и R2. Присвойте ID ячейкам, буферу, контроллеру линии и точке контроля деталей.',
      'Create a record for the assembly line with cells R1 and R2. Identify the cells, buffer, line controller and inspection station.'],
    claim: ['Опишите, как линия передаёт следующую деталь в R2 после остановки R1. Укажите, как по журналу найти уже находившуюся в работе деталь.',
      'Describe how the line hands the next part to R2 after R1 stops. Explain how the log identifies the part that was already being processed.'],
    references: [
      [['NIST · испытательный стенд производственной робототехники', 'NIST · Manufacturing Robotics Testbed'], 'https://www.nist.gov/laboratories/tools-instruments/manufacturing-robotics-testbed'],
      [['Исследование резервирования роботизированных сборочных ячеек', 'Study of redundancy in robotic assembly cells'], 'https://link.springer.com/article/10.1007/s00170-024-13223-5']
    ],
    missing: ['Нужны план линии, расчёт питания и журнал виртуального прогона с событиями R1/R2, идентификаторами лотков и результатами контроля.',
      'Obtain the line layout, power calculation and virtual run log with R1/R2 events, tray IDs and inspection results.']
  },
  ship: {
    label: ['Корабль', 'Vessel'],
    scope: ['Заведите паспорт на судно или на его систему энергоснабжения. Привяжите секции A/B и критические потребители к отсекам на чертеже.',
      'Create a record for the vessel or its electrical system. Map sections A/B and critical loads to compartments on the drawing.'],
    claim: ['Укажите, какие системы остаются доступны при отказе секции A: связь, навигация и контроль машинного отделения. Запишите допустимое время перерыва для каждого потребителя.',
      'Identify the systems retained after loss of section A: communications, navigation and machinery monitoring. Record the permissible interruption for each load.'],
    references: [[['ABB · резервирование и реконфигурация судовой электросети', 'ABB · fault-tolerant, reconfigurable shipboard power'], 'https://new.abb.com/news/detail/24670/autonomy-requires-fault-tolerant-reconfigurable-and-connected-electrical-grid-for-propulsion']],
    missing: ['Нужны общий чертёж, схема щита, баланс мощностей и журнал сценария отказа секции.',
      'Obtain the general arrangement drawing, switchboard diagram, power balance and section failure scenario log.']
  },
  aviation: {
    label: ['Самолёт и адаптивное крыло', 'Aircraft and adaptive wing'],
    scope: ['Заведите паспорт на крыло и обозначьте границу модели: геометрия, привод крутки и интерфейс с бортовым управлением.',
      'Create a record for the wing and define the model boundary: geometry, twist actuator and flight control interface.'],
    claim: ['Заявите адаптацию геометрии крыла. При равной подъёмной силе отдельно опишите прогиб, напряжения и сопротивление для двух вариантов.',
      'Document adaptation of wing geometry. At the same lift, report deflection, stress and drag separately for both configurations.'],
    design: ['Свяжите геометрию, граничные условия и модель привода с одним расчётным режимом. Наблюдения в таблице обозначьте как расчётные.',
      'Tie the geometry, boundary conditions and actuator model to one operating case. Label the table values as simulated.'],
    references: [[['NASA · ACTE, справочный пример лётных испытаний изменяемого крыла', 'NASA · ACTE, a reference flight test of a morphing wing'], 'https://www.nasa.gov/reference/acte/']],
    missing: ['Для повторного расчёта нужны файлы геометрии, нагрузки и настройки решателя. Для перехода от модели к эксперименту нужны стендовые измерения и протокол.',
      'Reproduction requires geometry files, loads and solver settings. Validation beyond the model requires bench measurements and a test protocol.']
  },
  grid: {
    label: ['Энергоузел и электросеть', 'Power station and distribution network'],
    scope: ['Заведите паспорт участка сети от узлов S1/S2 до критических потребителей. Укажите границы модели, фидеры F1/F2 и связь T1.',
      'Create a record for the network section from S1/S2 to the critical loads. Identify the model boundary, F1/F2 feeders and tie T1.'],
    claim: ['Опишите восстановление питания через резервный маршрут в модели. Запишите допустимые диапазоны напряжений и предел загрузки резервного фидера.',
      'Describe restoration of power via the alternate route in the model. Record the voltage ranges and backup feeder loading limit.'],
    references: [[['PNNL · оценка надёжности восстанавливающейся сети с микросетью', 'PNNL · reliability evaluation of a self-healing distribution system with a microgrid'], 'https://www.pnnl.gov/publications/integrating-transactive-energy-reliability-evaluation-self-healing-distribution-system']],
    missing: ['Нужны однолинейная схема, параметры нагрузок, результаты потокораспределения и журнал расчётного отказа.',
      'Obtain the single-line diagram, load parameters, power-flow results and simulated outage log.']
  },
  infrastructure: {
    label: ['Виадук и ремонтный участок', 'Viaduct and repair section'],
    scope: ['Заведите паспорт участка ремонта и привяжите его к виадуку по схеме. Укажите площадь, дату работ и материал.',
      'Create a record for the repair section and locate it on the viaduct drawing. Record area, repair date and material.'],
    claim: ['Сначала зафиксируйте факт применения ремонтного материала. Оценку закрытия трещин и уменьшения протечек оформите отдельно по данным повторных осмотров.',
      'Start by documenting where the repair material was applied. Assess crack closure and reduced leakage separately using follow-up inspections.'],
    design: ['В схеме участка отметьте границу ремонта и постоянные точки наблюдения. В карточке материала укажите марку применённого состава и связь с этим участком.',
      'Mark the repair boundary and fixed observation points on the drawing. Record the product used and its link to the section.'],
    missing: ['Нужны акты повторных осмотров и сопоставимые снимки и замеры одних и тех же участков.',
      'Obtain follow-up inspection records and matching photos and measurements of the same locations.']
  },
  robotics: {
    label: ['Робот', 'Robot'],
    scope: ['Заведите паспорт на отдельного робота. Опишите конфигурацию корпуса, приводов и датчиков, версию контроллера и условия испытания.',
      'Create a record for an individual robot. Document the body, actuator and sensor configuration, controller version and test conditions.'],
    claim: ['Опишите восстановление движения после изменения конфигурации ноги и подбор другой походки. Укажите, как сравнивается пройденное расстояние за одинаковое время.',
      'Describe locomotion recovery after a leg configuration change and the selection of a new gait. Explain how distance travelled is compared over equal time windows.'],
    design: ['Сопоставьте каналы датчиков и приводы с суставами на схеме. Укажите, как контроллер обновляет модель тела и передаёт команды для новой походки.',
      'Map sensor and actuator channels to the joints. Record how the controller updates the body model and commands the new gait.'],
    references: [[['Science · оригинальная статья о самомоделировании и восстановлении движения', 'Science · original study of self-modelling and locomotion recovery'], 'https://doi.org/10.1126/science.1133687']],
    missing: ['Для воспроизведения нужны журналы движения, исходная и изменённая конфигурации, версия контроллера и протокол испытания.',
      'Reproduction requires motion logs, baseline and changed configurations, controller version and test protocol.']
  },
  other: {
    label: ['Правило восстановления', 'Recovery rule'],
    scope: ['Заведите паспорт на версию программного правила. Стержневую модель укажите как стенд, на котором оно проверяется.',
      'Create a record for a version of the software rule. Identify the truss model as its testbed.'],
    claim: ['Запишите входное состояние, доступный запас, варианты действия и критерий сохранения функции. Отдельно укажите, в каком сценарии преимущество меняется.',
      'Record the initial state, available reserve, possible actions and functional criterion. Identify the scenario in which the advantage reverses.'],
    design: ['Опишите схему входных данных, порядок выбора действия и состояние, которое возвращает правило. Укажите ограничения симулятора и номер шага сравнения.',
      'Document the input schema, action-selection order and the state returned by the rule. Record the simulator limits and comparison step.'],
    missing: ['Для воспроизводимого запуска нужны версия кода, конфигурации сценариев и исходные журналы по ветвям.',
      'A reproducible run requires the code version, scenario configurations and original per-branch logs.']
  }
};
