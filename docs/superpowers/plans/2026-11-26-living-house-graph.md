# Living House graph helper — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the geometric Living House program with an optional topological-graph helper inside the portal that rates each structural element's continuous and episodic "living" loops and offers passport text the client may insert or ignore.

**Architecture:** Static ES modules in `git-living-things/house-model/`. Pure logic (`graph.js`, `check.js`, `suggest.js`) has no DOM and is tested with `node --test`. UI (`index.html`, `app.js`, `view.js`, `i18n.js`, `bridge.js`) runs in an iframe on the passport page, same origin as the portal, and saves through the existing postMessage protocol. The passport editor imports `suggest.js` directly to show "Variant from the house model" blocks.

**Tech Stack:** Vanilla JS ES modules, SVG, Node 24 `node:test`. No build, no dependencies.

**Spec:** `docs/superpowers/specs/2026-11-26-living-house-graph-design.md`

## Global Constraints

- No build step, no npm dependencies; works from GitHub Pages and from `npm start` (dev server whitelists static files).
- `format` stays exactly `"living-house-model"`; `version` is `"1.0"`. Files with another version are refused with a clear message.
- Model file name `*.living-house.json`, max 5 MB (portal `houseModelLimit`), category `system`. Only the passport owner saves.
- All UI text in Russian and English, `[ru, en]` pairs as in `locale.js`; light and dark theme.
- No geometry, sizes or coordinates carry meaning. Node positions from dragging are view-only.
- Assessment only advises; any graph can be saved.
- The portal never puts text into a passport field by itself; the client's own text is never overwritten.
- The user commits himself in PyCharm. Do not run `git commit`/`git push`; each task ends with a commit message for the user.

## Review Focus

1. Opening an old `version: "0.1"` geometric file → clear "old format" message, nothing crashes, nothing saved over it. (Task 1 test `refuses old version`.)
2. Deleting a node leaves no dangling links. (Task 1 test `removeNode drops its links`.)
3. Cycles in `transmits` links (chip ↔ chip) must not hang path search. (Task 2 test `transmit cycle terminates`.)
4. "Insert" into a non-empty field must not replace text; "Append" adds after a blank line. (Task 3 test `applySuggestion never overwrites`; Task 6 manual check.)
5. A non-owner opening the helper sees read-only mode; Save is hidden and the portal still refuses. (Task 5 manual check.)

---

### Task 1: Graph model and vocabulary

**Files:**
- Create: `house-model/graph.js`
- Create: `tests/house-graph.test.js`
- Modify: `package.json` (add `"test": "node --test tests/"`)

**Interfaces:**
- Produces:
  - `FORMAT = 'living-house-model'`, `VERSION = '1.0'`
  - `NODE_TYPES`: object `type → { layer, kinds?: string[], structural?: true }` with exactly:
    - layer `space`: `site`, `building`, `storey`, `space`
    - layer `body`: `foundation`, `wall`, `column`, `beam`, `slab`, `roof` (all `structural: true`); `window`, `door`, `stair`
    - layer `nerves`: `sensor` kinds `strain`,`crack`,`load`,`tilt`,`integrity`,`temperature`,`humidity`,`co2`,`leak`; `mobileSensor`; `chip`
    - layer `brain`: `centre`
    - layer `networks`: `network` kinds `water`,`power`,`gas`,`air`,`repair`,`data`
    - layer `reserves`: `reserve` kinds `structural`,`control`
    - layer `actuators`: `material` kinds `thermal-conductivity`,`transparency`,`reflectance`,`crack-healing`,`leak-sealing`; `device` kinds `heating`,`cooling`,`ventilation`,`dehumidifier`,`valve`; `measure` kinds `prop`,`closed-zone`; `robot`
  - `LINK_TYPES`: `type → { from: layers|types[], to: layers|types[] }` for `supports` (body→body), `adjacent` (body↔body), `contains` (space→space|body), `observes` (sensor→body|space), `patrols` (mobileSensor→body), `transmits` (sensor|mobileSensor|chip→chip|centre), `controls` (centre→actuators), `actsOn` (actuators→body|space), `serves` (network→body|space), `feeds` (reserve|centre→network), `heals` (material→body)
  - `SENSOR_CONTINUOUS = all sensor kinds`, `SENSOR_EPISODIC = ['strain','crack','load','tilt','integrity']`
  - `emptyModel(): Model` — `{ format, version, meta:{name:'',author:'',updated:''}, nodes:[], links:[], constitution:{priorities:['safety','health','comfort','economy'], rules:[]}, dna:{stiffenMaxPercent:0} }`
  - `starterModel(lang: 0|1): Model` — foundation F-1, walls W-1..W-4, slab S-1, roof R-1, building B-1; links W-* supports→F-1 … i.e. `{type:'supports', from:'W-1', to:'F-1'}` (from rests on to), S-1→W-1..4, R-1→S-1; `contains` B-1→all.
  - `addNode(m, {type, kind?, name?}) → id` (ids: prefix by type, e.g. `F-2`, `SN-1`, `C-1`, unique)
  - `addLink(m, {type, from, to}) → {ok:true}|{ok:false, error:'badLink'|'missingNode'|'duplicate'}`
  - `removeNode(m, id)`, `removeLink(m, index)`
  - `setBinding(m, id, {file, ref}|null)`
  - `validateModel(x) → {ok:true}|{ok:false, error:'notModel'|'oldVersion'|'broken'}`
  - Constitution rule shapes: `{id, kind:'limit', sensorKind, min, max}`, `{id, kind:'forbid', action, from:'HH:MM', to:'HH:MM'}`, `{id, kind:'principle', text}`

- [ ] **Step 1: Write failing tests** in `tests/house-graph.test.js` (`node:test`, `node:assert/strict`):
  - `starter has body only`: every node of `starterModel(0)` has layer `space` or `body`; contains a `foundation`, ≥1 `wall`, a `roof`.
  - `addLink checks vocabulary`: `addLink(m,{type:'observes',from:'W-1',to:'F-1'})` → `{ok:false,error:'badLink'}`; sensor→wall `observes` → `{ok:true}`; same again → `duplicate`.
  - `removeNode drops its links`: add sensor, link observes W-1, remove sensor → no link mentions its id.
  - `refuses old version`: `validateModel({format:'living-house-model',version:'0.1'})` → `{ok:false,error:'oldVersion'}`; `validateModel({})` → `notModel`; link to missing node → `broken`.
  - `round trip`: `validateModel(JSON.parse(JSON.stringify(starterModel(1))))` → ok.
- [ ] **Step 2:** `npm test` → FAIL (module not found).
- [ ] **Step 3:** Implement `house-model/graph.js` with the exports above. Pure, no DOM.
- [ ] **Step 4:** `npm test` → all pass.
- [ ] **Step 5: Commit message for the user:**
```
Add the Living House graph model and vocabulary

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### Task 2: Living-loop assessment

**Files:**
- Create: `house-model/check.js`
- Create: `tests/house-check.test.js`
- Create: `tests/fixtures/house.js` (`export function fullLoopModel(): Model`)

**Interfaces:**
- Consumes: Task 1 `NODE_TYPES`, `SENSOR_EPISODIC`, model shape.
- Produces:
  - `assessElement(m, id) → { continuous: {a,b,c,d,e: boolean, closed}, episodic: {a,b,c,d,e: boolean, closed}, color: 'green'|'yellow'|'red', gaps: string[] }`
  - `assessModel(m) → Array<{id, ...assessElement}>` for every node with `structural: true`
  - `summary(m) → { green, yellow, red, total }`
  - Gap codes (strings, translated later): `noSensor`, `notConnected`, `noNorm`, `noActuator`, `noHealing`, `noIntegritySensor`, `episodicNotConnected`, `noTemporaryMeasure`, `noRepairNetwork`, `noReserve`, `noRepairer`

Rules (from the spec, exact). "Spaces of E" = nodes with a `contains` link to E. "Reaches centre" = directed path over `transmits` from the sensor to any `centre`; collect the reached centres.
- continuous a: a `sensor` `observes` E or a space of E. b: one of those reaches a centre C. c: `constitution.rules` has a `limit` with `sensorKind` equal to that sensor's kind. d: some reached C `controls` an actuator that `actsOn` E or a space of E. e: a `material` with kind `crack-healing` or `leak-sealing` `heals` E.
- episodic a: a `sensor` with kind in `SENSOR_EPISODIC` `observes` E, or a `mobileSensor` `patrols` E. b: one of those reaches a centre C. c: a `measure` `actsOn` E, or `dna.stiffenMaxPercent > 0` and E has a `supports`/`adjacent` neighbour. d: a `network` of kind `repair` `serves` E and a `reserve` of kind `structural` `feeds` that network. e: a reached C `controls` a `robot`.
- color: green if both closed; red if continuous.a and episodic.a are both false; else yellow.
- gaps: one code per false condition, in order continuous a–e then episodic a–e.

- [ ] **Step 1: Write failing tests** in `tests/house-check.test.js`:
  - `starter is all red`: `summary(starterModel(0))` → `{green:0, yellow:0, red:7, total:7}` (F-1, W-1..4, S-1, R-1).
  - `full loop is green`: fixture `fullLoopModel()` exported from `tests/fixtures/house.js` (create it in this task) adds to starter: sensor `strain` observes W-1, transmits → chip → centre C-1; limit rule `strain`; device `valve` controlled by C-1 actsOn W-1; material `crack-healing` heals W-1; measure `prop` actsOn W-1; network `repair` serves W-1, reserve `structural` feeds it; robot controlled by C-1 → `assessElement(m,'W-1').color === 'green'`, `gaps.length === 0`.
  - `unconnected sensor is yellow with notConnected`: sensor observes W-2 with no transmits → color `yellow`, gaps include `notConnected`.
  - `transmit cycle terminates`: chip X transmits → chip Y, Y → X, sensor → X, no centre → returns (test finishes) with `continuous.b === false`.
  - `stiffening counts as temporary measure`: `dna.stiffenMaxPercent = 20`, W-1 supports F-1 → `episodic.c === true` for W-1.
- [ ] **Step 2:** `npm test` → new tests FAIL.
- [ ] **Step 3:** Implement `house-model/check.js` (BFS with a visited set for "reaches centre").
- [ ] **Step 4:** `npm test` → all pass.
- [ ] **Step 5: Commit message:**
```
Rate continuous and episodic living loops per structural element

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### Task 3: Passport text suggestions

**Files:**
- Create: `house-model/suggest.js`
- Create: `tests/house-suggest.test.js`

**Interfaces:**
- Consumes: Task 1 model, Task 2 `assessModel`.
- Produces:
  - `SUGGESTED_FIELDS = ['structureProject','supplyProject','minimumSensors','nervousSystem','homeostasisControl','constitution','damageScenarios','selfRecovery']` (keys from `taxonomy.js` `houseProjectGroups`)
  - `suggestions(m, lang: 0|1) → { [field]: string }` — only fields with something to say; plain lines, one per fact, node names/ids as written in the model.
  - `applySuggestion(current: string, text: string, mode: 'insert'|'append') → string` — `insert` returns `text` only if `current.trim() === ''`, otherwise `current` unchanged; `append` returns `current.trimEnd() + '\n\n' + text` (or `text` if current empty).

Content per field (spec table): structureProject — structural nodes and `supports`; supplyProject — networks, what they serve, what feeds them, reserves; minimumSensors — sensors by kind and target, mobile sensors and patrols; nervousSystem — chips, transmit paths to centres; homeostasisControl — closed continuous loops as `sensor → centre → norm → actuator → element`; constitution — priorities in order, then rules; damageScenarios — measures, `dna.stiffenMaxPercent`; selfRecovery — healing materials, repair networks, reserves, robots. Gaps from assessment appear in the matching field as a final line `Не предусмотрено: …` / `Not provided: …` (sensor gaps → minimumSensors; notConnected → nervousSystem; noNorm/noActuator → homeostasisControl; noTemporaryMeasure → damageScenarios; healing/repair gaps → selfRecovery).

- [ ] **Step 1: Write failing tests**:
  - `empty model suggests structure only`: `Object.keys(suggestions(starterModel(0),0))` includes `structureProject`, and `minimumSensors` text contains `Не предусмотрено`.
  - `full loop fixture` (`fullLoopModel()` from `tests/fixtures/house.js`, Task 2): `suggestions(m,1).homeostasisControl` contains `W-1`; `selfRecovery` contains `crack-healing` label text in English.
  - `applySuggestion never overwrites`: `applySuggestion('mine','x','insert') === 'mine'`; `applySuggestion('','x','insert') === 'x'`; `applySuggestion('mine\n','x','append') === 'mine\n\nx'`.
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3:** Implement `house-model/suggest.js`. Labels for kinds/types live in a `LABELS` map inside `suggest.js` as `[ru, en]` and are exported for reuse by the UI (`export const LABELS`).
- [ ] **Step 4:** `npm test` → pass.
- [ ] **Step 5: Commit message:**
```
Suggest passport text from the Living House graph

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### Task 4: Helper UI (wizard, graph view, assessment map)

**Files:**
- Create: `house-model/index.html`, `house-model/style.css`, `house-model/i18n.js`, `house-model/view.js`, `house-model/app.js`, `house-model/bridge.js`
- Modify: `scripts/dev-server.mjs` `staticFiles` — add `/house-model/` → `house-model/index.html` and each new file with its MIME type (`.js` text/javascript, `.css` text/css).

**Interfaces:**
- Consumes: Tasks 1–3 exports; `LABELS` from `suggest.js`.
- Produces:
  - `bridge.js`: `export const embedded` (true when `?portal=1` and `window.parent !== window`); `export function load() → Promise<Model|null>`; `export function save(model, filename) → Promise<void>`; messages exactly per `living-house-model/PORTAL.md` (`source:'living-house-model'`, types `ready`/`save`/`open-request`; replies `model`/`saved`/`error`; 20 s timeout), but target origin is `location.origin`. Query `readonly=1` hides Save. Outside the portal: Save downloads `<name>.living-house.json`, Open reads a local file.
  - `view.js`: `render(svg, model, assessment, {selected, positions}) → void`. Layered layout: body nodes in rows by type (foundation bottom, walls/columns/beams, slab, roof top), spaces as a band on the left, nerves/brain/networks/reserves/actuators as columns on the right; links as lines with type label on hover; structural nodes filled green/yellow/red; drag updates `positions` only.
  - `i18n.js`: `tr(key)`, `setLang(0|1)`, `lang`, `setTheme('light'|'dark')`; theme stored in `localStorage` key `lhm-theme` inside try/catch (copied behaviour from old `living-house-model/js/i18n.js`).
  - `app.js` wizard steps exactly: 1 Body, 2 Nerves, 3 Centres and brain (centres, DNA `stiffenMaxPercent`, Constitution priorities/rules), 4 Networks and reserves, 5 Reaction and healing, 6 Project binding (node → `{file, ref}`; file chosen from a text field), 7 Assessment (summary counts, per-element gaps in words, list of `suggestions()`). Steps are tabs, any order, assessment summary always visible in the header. Each step panel: "add node" (type/kind/name), "add link" (type, from, to — dropdowns filtered by `LINK_TYPES`), list with delete. On start: `bridge.load()` result, else `starterModel(lang)`. Invalid file → message from `validateModel` error code (`oldVersion` → "Это файл старой модели, он не поддерживается" / "This is an old-format model file and is not supported").

- [ ] **Step 1:** Implement the files. Keep `app.js` under ~300 lines by putting step panels in a `steps` table of `{key, types, links}`.
- [ ] **Step 2:** `node --check` each new `.js` → no output. `npm test` → still passes.
- [ ] **Step 3: Manual check:** `npm start`, open `http://127.0.0.1:4173/house-model/` — starter shows 7 red body nodes; add a strain sensor on W-1, chip, centre C-1, transmits links → W-1 gaps no longer contain `noSensor`/`notConnected`; switch RU/EN and theme; Save downloads a `.living-house.json`; Open that file restores the graph; Open a `version 0.1` file shows the old-format message.
- [ ] **Step 4: Commit message:**
```
Add the Living House graph helper UI

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### Task 5: Embed the helper in the passport

**Files:**
- Modify: `app.js:509-556` (house model section) and `app.js:893-898` (open action)
- Modify: `locale.js:202-206` (`houseModel`, `houseModelHelp`, `houseModelReadonly`)

**Interfaces:**
- Consumes: Task 4 `bridge.js` protocol.
- Produces: no new exports.

- [ ] **Step 1:** `houseApp` → `location.origin`; iframe `src` → `'house-model/?' + new URLSearchParams({ portal: '1', lang: language ? 'en' : 'ru', ...(houseContext.editable ? {} : { readonly: '1' }) })`; keep `sandbox` attributes; `postMessage` target and `event.origin` check use `location.origin`. Update the comment above `houseApp` (protocol now in `house-model/bridge.js`).
- [ ] **Step 2:** In `saveHouseModel`, also refuse `model.version !== '1.0'` with `fileInvalid`.
- [ ] **Step 3:** Texts: `houseModelHelp` → «Необязательный помощник: соберите дом как граф частей и связей — тело, датчики, нервы, центры, сети, запасы, заживление — и посмотрите, замкнуты ли у каждого элемента круги постоянного поддержания и разового ремонта. Кнопка «Сохранить» в помощнике сохраняет модель файлом к этому паспорту.» / English equivalent; `houseModelReadonly` same without the Save sentence.
- [ ] **Step 4:** `node --check app.js locale.js`; `npm test`.
- [ ] **Step 5: Manual check:** `npm start`, register locally, create a passport with domain `buildings`, save draft, open passport → «Модель живого дома» → helper loads in the frame; build a loop; Save → a `*.living-house.json` appears in the passport files; reload → helper opens with the saved graph. Log in as another user → helper opens read-only, no Save.
- [ ] **Step 6: Commit message:**
```
Serve the Living House helper from the portal and embed it in passports

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### Task 6: "Variant from the house model" in the passport editor

**Files:**
- Modify: `app.js` — `houseProjectEditor` (≈line 586), `openEditor` (≈line 680), form click handler (≈line 880)
- Modify: `locale.js` (new keys `houseVariant`, `houseInsert`, `houseAppend`, `houseHide`)
- Modify: `styles.css` (`.house-variant` block: muted box under the field)

**Interfaces:**
- Consumes: Task 3 `suggestions`, `applySuggestion`, `SUGGESTED_FIELDS`; existing `latestHouseModel(id)`; Task 1 `validateModel`.

- [ ] **Step 1:** In `openEditor`, when `id` exists and the passport files contain a `*.living-house.json`, load it with `latestHouseModel(id)`; if `validateModel` is ok, compute `suggestions(model, language)` and keep it in `editorState.houseVariants`. Any failure → no variants, editor works as before.
- [ ] **Step 2:** `houseProjectEditor(details, variants = {})`: under each field whose key is in `variants`, render a `<details class="house-variant">` with summary `tr('houseVariant')`, the text in a `<pre>`, and three buttons `data-action="house-insert"|"house-append"|"house-hide"` with `data-field="<key>"`.
- [ ] **Step 3:** Click handler: insert/append set the textarea value via `applySuggestion` (never replacing non-empty text on insert; if insert is refused because the field has text, change the button label to `tr('houseAppend')` hint via notice); hide removes the block. Nothing happens without a click.
- [ ] **Step 4:** `node --check app.js`; `npm test`.
- [ ] **Step 5: Manual check:** with the passport from Task 5 open Edit → variants visible under the eight fields; Insert into empty field fills it; Insert into a field with your text does nothing to it; Append adds after a blank line; Hide removes the block; Save draft keeps exactly what is in the fields. A passport without a model shows no variants.
- [ ] **Step 6: Commit message:**
```
Offer passport text variants from the Living House model in the editor

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

### Task 7: Docs and cleanup

**Files:**
- Modify: `README.md` (short section «Помощник Живой дом»: where it lives, `npm test`, that it's optional, that tests/catastrophes come later)
- Create: `house-model/FORMAT.md` (model 1.0: nodes, links, constitution, dna, binding — tables from Task 1 interfaces)

- [ ] **Step 1:** Write both files.
- [ ] **Step 2:** `npm test` passes; open `README.md` preview in PyCharm.
- [ ] **Step 3: Commit message:**
```
Document the Living House helper and its file format

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
```

Pushing to GitHub (which publishes portal.living-things.org) happens only when the user asks.
