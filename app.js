import { strings } from './locale.js';
import { domains, levels, types, properties, evidence, stages, relations, passportFields, claimFields, architectureFields,
  attachmentCategories, attachmentLimits, houseProjectFields, houseProjectGroups } from './taxonomy.js';
import { domainResearch, foundationalResearch, territoryInterfaces, testRegistry, urbanPrototype } from './research.js';
import { concreteStudy, examples, exampleDomain, exampleImagePath, guideCases, houseProjectExample } from './examples.js';

const main = document.querySelector('#main');
const header = document.querySelector('#header');
const footer = document.querySelector('#footer');
const taxonomy = { level: levels, type: types, stage: stages, property: properties, evidence };
const filterKeys = ['q', 'level', 'type', 'stage', 'property', 'evidence', 'person'];
const engineeringKeys = ['composition', 'characteristics', 'interfaces', 'conditions'];
const originKeys = ['sources', 'rules', 'transfer', 'license'];
// The public site runs on its own domain; the GitHub Pages address redirects there.
const useCloud = location.origin === 'https://portal.living-things.org' ||
  (location.origin === 'https://evgeniypusser.github.io' && /^\/git-living-things(?:\/|$)/.test(location.pathname));
let cloudBackend;
const cloud = () => cloudBackend ??= import('./supabase-backend.js');
function preference(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch {
    // The portal also works when the browser blocks local storage.
  }
}
let language = preference('lt-language') === 'en' ? 1 : 0;
let dark = preference('lt-theme') === 'dark';
let user = null;
let generation = 0;
let flash = '';
let editorState = null;
const comparison = new Set();

const tr = key => strings[key]?.[language] || key;
const name = (group, key) => group[key]?.[language] || '';
const text = value => String(value ?? '').replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const attr = text;
const date = value => value ? new Intl.DateTimeFormat(language ? 'en-GB' : 'ru', { dateStyle: 'medium' }).format(new Date(value)) : tr('none');
const title = key => '<h2>' + tr(key) + '</h2>';
const passportURL = id => '#/passport/' + encodeURIComponent(id);
const button = (label, href, secondary = false) =>
  '<a class="button' + (secondary ? ' secondary' : '') + '" href="' + attr(href) + '">' + tr(label) + '</a>';
const submit = (label, secondary = false, extra = '') =>
  '<button class="' + (secondary ? 'secondary' : 'primary') + '" type="submit" ' + extra + '>' + tr(label) + '</button>';
const customButton = (label, action) =>
  '<button class="secondary" type="button" data-action="' + action + '">' + tr(label) + '</button>';
const input = (key, label, value = '', extra = '') =>
  '<label>' + text(label) + '<input name="' + key + '" value="' + attr(value) + '" ' + extra + '></label>';
const area = (key, label, value = '', extra = '') =>
  '<label>' + text(label) + '<textarea name="' + key + '" maxlength="4000" ' + extra + '>' + text(value) + '</textarea></label>';
const options = (group, selected) => Object.entries(group).map(([key, label]) =>
  '<option value="' + attr(key) + '"' + (key === selected ? ' selected' : '') + '>' + text(label[language]) + '</option>').join('');
const select = (key, label, group, selected, placeholder = 'select') =>
  '<label>' + text(label) + '<select name="' + key + '" aria-label="' + attr(label) + '"><option value="">' + tr(placeholder) +
  '</option>' + options(group, selected) + '</select></label>';
const passportArea = (passport, key) => area(key, name(passportFields, key), passport[key]);
const notice = (message, error = false) =>
  '<p class="notice' + (error ? ' error' : '') + '" role="' + (error ? 'alert' : 'status') + '">' + text(tr(message)) + '</p>';
const formStatus = '<div class="form-status" aria-live="polite"></div>';
const panel = (heading, body, id = '') =>
  '<section class="panel tight"' + (id ? ' id="' + id + '"' : '') + '>' + title(heading) + body + '</section>';
const table = (head, rows, kind) => '<div class="table-scroll" tabindex="0" role="region" aria-label="' +
  tr(kind === 'catalog-table' ? 'objectCatalog' : 'scrollTable') + '"><table role="table" class="' + kind +
  '"><thead role="rowgroup"><tr role="row">' + head.map(value => '<th scope="col" role="columnheader">' + value + '</th>').join('') +
  '</tr></thead><tbody role="rowgroup">' + rows.join('') + '</tbody></table></div>';
const crumbs = (...parts) => '<div class="crumbs"><a href="#/">' + tr('home') + '</a>' +
  parts.map(part => '<span aria-hidden="true">/</span>' + part).join('') + '</div>';
const catalogLink = '<a href="#/catalog">';
const createURL = domain => '#/new' + (domain ? '?' + new URLSearchParams({ domain }) : '');
const exampleDraftURL = key => '#/new?' + new URLSearchParams({ domain: exampleDomain(key), example: key });
const testRegistryURL = group => '#/tests' + (group ? '?' + new URLSearchParams({ group }) : '');
const accountURL = next => '#/login?' + new URLSearchParams({ next });
const recordLabel = item => text(tr(item.status) + ' · ' + tr(item.visibility));
// Deletion takes two clicks: the first arms the button, the second sends DELETE to the endpoint.
const removeButton = (endpoint, after, label = 'deleteItem') => '<button class="secondary danger" type="button" data-action="remove" ' +
  'data-endpoint="' + attr(endpoint) + '" data-after="' + attr(after) + '">' + tr(label) + '</button>';
const safeLink = (url, label) => '<a href="' + attr(url) + '" rel="noreferrer">' + text(label) + '</a>';

async function api(path, method = 'GET', values, signal) {
  if (useCloud) return (await cloud()).cloudApi(path, method, values, signal);
  const response = await fetch('./api/' + path, {
    method, signal, headers: values === undefined ? {} : { 'Content-Type': 'application/json' },
    body: values === undefined ? undefined : JSON.stringify(values)
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'failed');
  return result;
}
function errorMessage(error) {
  return Object.hasOwn(strings, error.message) ? error.message : 'failed';
}
function layout(content) {
  return '<div class="wrap stack">' + content + '</div>';
}
function globalSearch(value = '') {
  return '<form class="search-bar" data-form="global-search" role="search"><label class="visually-hidden" for="global-query">' +
    tr('searchLabel') + '</label><input id="global-query" name="q" type="search" value="' + attr(value) +
    '" maxlength="200" placeholder="' + tr('searchHint') + '">' + submit('search') + '</form>';
}
function frame(route) {
  const current = value => route === value ? ' aria-current="page"' : '';
  header.innerHTML = '<a class="skip" href="#main" data-action="skip">' + tr('skip') + '</a><header class="top"><div class="wrap">' +
    '<a class="brand" href="#/"><span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>Living Things</a>' +
    '<nav class="primary-nav" aria-label="' + tr('portal') + '"><a href="#/"' + current('') + '>' + tr('home') +
    '</a><a href="#/guide"' + current('guide') + '>' + tr('guide') + '</a><a href="#/catalog"' + current('catalog') + '>' + tr('catalog') +
    '</a><a href="#/tests"' + current('tests') + '>' + tr('testRegistry') + '</a><a href="#/about"' + current('about') + '>' +
    tr('aboutTitle') + '</a></nav>' +
    '<nav class="nav-end" aria-label="' + tr('accountSettings') + '">' +
    (user ? '<a class="account-name" href="#/account"' + current('account') + '>' + text(user.name) + '</a><button type="button" data-action="logout">' + tr('signOut') + '</button>'
      : '<a href="#/login"' + current('login') + '>' + tr('signIn') + '</a>') +
    '<button type="button" lang="' + (language ? 'ru' : 'en') + '" data-action="language">' +
    (language ? 'Русский' : 'English') + '</button><button type="button" data-action="theme">' +
    tr(dark ? 'lightTheme' : 'darkTheme') + '</button></nav></div></header>';
  footer.innerHTML = '<footer class="foot"><div class="wrap"><span>Living Things · ' + tr('portal') + '</span><a href="#/about">' + tr('aboutTitle') + '</a><a href="#/guide">' + tr('guide') +
    '</a><a href="#/rules">' + tr('rulesTitle') + '</a></div></footer>';
}
const homeExamples = ['house', 'transport', 'factory', 'ship', 'aviation', 'grid',
  'facade', 'buildings', 'infrastructure', 'robotics', 'other'];
function exampleCards(keys) {
  return '<div class="example-gallery">' + keys.map((key, index) => {
    const example = examples[key];
    const domain = exampleDomain(key);
    return '<article class="panel example-card"><a class="example-card-image" href="#/example/' + attr(key) +
      '" aria-label="' + attr(example.title[language]) + '"><img' + (index >= 6 ? ' loading="lazy"' : '') +
      ' src="./' + attr(exampleImagePath(example)) + '" alt="' +
      attr(example.imageAlt[language]) + '"></a><div class="example-card-body">' +
      '<a class="example-domain" href="' + catalogURL('', { domain }) + '">' + text(domains[domain].label[language]) +
      '</a><h3><a href="#/example/' + attr(key) + '">' + text(example.title[language]) + '</a></h3><p>' +
      text(example.summary[language]) + '</p></div></article>';
  }).join('') + '</div>';
}
function exampleGallery(keys, className = '') {
  return '<section class="tight' + (className ? ' ' + className : '') + '" aria-labelledby="examples-heading"><h2 id="examples-heading">' +
    tr('exampleGallery') + '</h2>' + exampleCards(keys) + '</section>';
}
// First thing invited researchers see: how to put their own work into the registry.
function contributeSteps() {
  const steps = [['contributeAccount', 'contributeAccountText'], ['contributeDraft', 'contributeDraftText'],
    ['contributePublish', 'contributePublishText']];
  return '<section class="panel contribute" aria-labelledby="contribute-heading"><div class="tight"><h2 id="contribute-heading">' +
    tr('contributeTitle') + '</h2><p class="muted">' + tr('contributeLead') + '</p></div><ol class="contribute-steps">' +
    steps.map(([heading, paragraph]) => '<li><h3>' + tr(heading) + '</h3><p class="muted">' + tr(paragraph) + '</p></li>').join('') +
    '</ol><div class="actions">' + (user ? button('create', createURL()) : button('registerSubmit', '#/register')) +
    button('openGuide', '#/guide', true) + '<a href="#/rules">' + tr('rulesTitle') + '</a></div></section>';
}
function home() {
  const videoLanguage = language ? 'en' : 'ru';
  const introVideo = '<figure class="intro-video"><figcaption>' + tr('introVideo') + '</figcaption>' +
    '<div class="intro-video-player"><video controls playsinline preload="none" width="1280" height="720" poster="./assets/intro/poster.jpg" aria-label="' +
    attr(tr('introVideo')) + '" src="./assets/intro/living-things-' + videoLanguage + '.mp4">' +
    '<track kind="captions" srclang="' + videoLanguage + '" label="' + (language ? 'English' : 'Русский') +
    '" src="./assets/intro/living-things-' + videoLanguage + '.vtt"></video>' +
    '<button class="intro-video-play" type="button" data-action="play-intro">' + tr('playIntro') + '</button></div>' +
    '<p class="intro-video-fallback" hidden>' + safeLink('./assets/intro/living-things-' + videoLanguage + '.mp4', tr('openIntroFile')) + '</p></figure>';
  return layout('<section class="hero home-hero"><div class="tight"><p class="eyebrow">' + tr('portal') + '</p><h1>Living Things</h1><p>' +
    tr('tagline') + '</p></div>' + introVideo +
    '</section>' + contributeSteps() + exampleGallery(homeExamples, 'home-examples') + globalSearch() + '<section class="panel intro"><h2>' + tr('intro') + '</h2>' +
    [['meaning', 'meaningBrief'], ['scope', 'scopeText'], ['passportPurpose', 'passportText'], ['findTitle', 'findText']].map(([heading, paragraph]) =>
      '<div class="tight"><h3>' + tr(heading) + '</h3><p class="muted">' + tr(paragraph) + '</p></div>').join('') +
    '<div class="actions">' + button('openGuide', '#/guide', true) + '</div></section>');
}
async function localResearch() {
  try {
    return new Set(await api('research', 'GET', undefined, AbortSignal.timeout(4500)));
  } catch {
    return new Set();
  }
}
function researchLinks(groups, available, heading = 'researchMore', sources = []) {
  if (!groups?.length && !sources.length) return '';
  const sourceURLs = new Set(sources.map(([, url]) => url));
  const listLinks = links => '<ul class="research-links">' + links.map(([label, url]) =>
    '<li>' + safeLink(url, label) + '</li>').join('') + '</ul>';
  const items = (groups || []).map(group => {
    const related = group.links.map(([label, url]) => [tr(label), Array.isArray(url) ? url[language] : url])
      .filter(([, url]) => !sourceURLs.has(url));
    if (!related.length) return '';
    const links = related
      .filter(([, url]) => !url.startsWith('/research/') || available.has(url));
    return '<li class="tight"><h3>' + text(group.title[language]) + '</h3><p class="muted">' +
      text(group.description[language]) + '</p>' + (links.length ? listLinks(links) :
        '<p class="muted">' + tr('researchLocalOnly') + '</p>') + '</li>';
  });
  if (sources.length) items.unshift('<li class="tight"><h3>' + tr('exampleSources') + '</h3>' + listLinks(sources) + '</li>');
  return '<details class="research"><summary>' + tr(heading) + '</summary><ul class="research-items">' + items.join('') + '</ul></details>';
}
function concreteChart() {
  const formatMM = new Intl.NumberFormat(language ? 'en-GB' : 'ru', { style: 'unit', unit: 'millimeter', maximumFractionDigits: 2 });
  return '<figure class="guide-chart tight"><figcaption><strong>' + tr('guideChartTitle') + '</strong><p class="muted">' +
    tr('guideChartCondition').replace('%d', concreteStudy.immersionDays) + '</p></figcaption>' +
    concreteStudy.widths.map(({ label, mm }) => '<div class="guide-measure"><div><span>' + text(label[language]) +
      '</span><strong>' + formatMM.format(mm) + '</strong></div><meter min="0" max="0.5" value="' + mm + '" aria-label="' +
      attr(label[language]) + '" aria-valuetext="' + attr(formatMM.format(mm)) + '"></meter></div>').join('') +
    '<p>' + safeLink(concreteStudy.abstract, tr('guideReadStudy')) + '</p></figure>';
}
function houseProjectSample() {
  const flow = '<ol class="example-chain house-project-flow" aria-label="' + tr('houseProjectFlow') + '">' +
    ['houseDetect', 'houseCheck', 'houseApprove', 'houseRestore', 'houseVerify'].map(key => '<li>' + tr(key) + '</li>').join('') + '</ol>';
  const sections = houseProjectGroups.map(({ label, fields }) =>
    '<section class="tight"><h3>' + text(label[language]) + '</h3><dl class="house-project-grid">' +
    Object.entries(fields).map(([key, [field, prompt]]) => '<div><dt>' + text(field[language]) +
      '</dt><dd><p class="muted">' + text(prompt[language]) + '</p><p>' + text(houseProjectExample[key][language]) +
      '</p></dd></div>').join('') + '</dl></section>').join('');
  return panel('houseProjectExample', '<p>' + tr('houseProjectExampleNote') + '</p>' + flow + sections);
}
function territoryContext(key) {
  if (!Object.hasOwn(territoryInterfaces, key)) return '';
  const entries = territoryInterfaces[key].map(([label, explanation]) => [label[language], explanation[language]]);
  const note = key === 'factory' ? 'territoryFactory' : 'territorySketch';
  return panel('territoryLinks', '<p class="muted">' + tr(note) + '</p>' + descriptionList(entries) +
    '<div class="actions">' + button('territoryTests', testRegistryURL(key === 'factory' ? 'factory' : 'neighbourhood'), true) +
    safeLink(urbanPrototype, tr('testOpenUrban')) + '</div>');
}
async function guide(params) {
  const selection = params.get('object');
  const key = Object.hasOwn(guideCases, selection) ? selection : 'buildings';
  const sample = examples[key];
  const route = guideCases[key];
  const words = value => text(value[language]);
  const chooser = '<nav class="panel tight" aria-label="' + tr('guideChoose') + '">' + title('guideChoose') + '<div class="chips">' +
    Object.entries(guideCases).map(([id, item]) => chip(item.label[language], '#/guide?' + new URLSearchParams({ object: id }),
      key === id)).join('') + '</div></nav>';
  const sampleView = '<div class="panel example-intro guide-sample"><div class="tight">' + title('exampleTitle') +
    '<h3>' + words(sample.title) + '</h3><p>' + words(sample.summary) + '</p>' + descriptionList([
      [tr('domain'), domains[exampleDomain(key)].label[language]], [tr('type'), name(types, sample.type)],
      [tr('level'), name(levels, sample.level)], [tr('stage'), name(stages, sample.stage)],
      [tr('property'), name(properties, sample.property)], [tr('evidence'), sample.evidenceLabel?.[language] || name(evidence, sample.evidence)],
      [tr('exampleSource'), words(sample.source)]
    ]) + (key === 'buildings' ? concreteChart() : '') +
    '<div><a href="#/example/' + attr(key) + '">' + tr('guideFullExample') + '</a></div></div>' +
    '<figure class="example-image"><img src="./' + attr(exampleImagePath(sample)) + '" alt="' + attr(sample.imageAlt[language]) +
    '"><figcaption>' + (sample.imageCaption ? words(sample.imageCaption) :
      tr(sample.sourceImage ? 'exampleSourceImage' : 'exampleIllustration')) + '</figcaption></figure></div>';
  const limits = tr('guideFileLimits').replace('%f', attachmentLimits.fileMiB).replace('%p', attachmentLimits.passportMiB);
  const paragraph = value => '<p>' + value + '</p>';
  const design = sample.design ? descriptionList(Object.entries(sample.design).map(([field, value]) =>
    [architectureFields[field].label[language], value[language]])) : paragraph(words(route.design));
  const verification = paragraph(words(sample.procedure)) + (key === 'buildings' ? '' : exampleResultsTable(sample)) +
    '<p><strong>' + tr(sample.stage === 'concept' ? 'exampleTarget' : 'exampleResult') + '</strong></p>' + paragraph(words(sample.outcome));
  const steps = [
    ['guideDefine', paragraph(words(route.scope))],
    ['guideDraft', paragraph(tr('guideDraftText')) + '<p>' + button('guideStart', exampleDraftURL(key), true) + '</p>'],
    ['guideClaim', paragraph(tr('guideClaimText')) + paragraph(words(route.claim))],
    ['guideDesign', paragraph(tr('guideDesignText')) + design],
    ['guideAttach', paragraph(tr('guideAttachText')) + '<p><strong>' + tr(sample.stage === 'concept' ? 'guidePlannedFiles' : 'guideFileSet') +
      '</strong></p>' + paragraph(words(sample.documents)) + '<p class="muted">' + limits + '</p>'],
    ['exampleProcedure', verification],
    ['guidePublish', paragraph(tr('guidePublishText'))]
  ].map(([heading, body]) => '<li><h3>' + tr(heading) + '</h3>' + body + '</li>').join('');
  const available = await localResearch();
  const sources = (route.references || []).concat(sample.links).filter(([, url]) => !url.startsWith('/research/') || available.has(url));
  const sourceList = sources.length ? panel('guideSources', '<ul class="compact-list">' + sources.map(([label, url]) =>
    '<li>' + safeLink(url, label[language]) + '</li>').join('') + '</ul>') : '';
  const sections = [
    ['meaning', ['meaningText']], ['included', ['includedText', 'scopeText']],
    ['passportPurpose', ['passportText', 'evidenceText']], ['related', ['relationText']], ['findTitle', ['findText']]
  ];
  return layout(crumbs(tr('guide')) + '<div class="tight"><h1>' + tr('guideHeading') + '</h1><p class="muted">' + tr('guideIntro') + '</p></div>' +
    chooser + sampleView + (key === 'house' ? houseProjectSample() : '') + territoryContext(key === 'grid' ? 'neighbourhood' : key) +
    panel('guideSteps', '<ol class="guide-steps">' + steps + '</ol>') + sourceList +
    panel('guideFilesMissing', paragraph(route.missing ? words(route.missing) : tr('guideDataNote'))) +
    researchLinks(foundationalResearch, available, 'researchBackground') +
    '<details><summary>' + tr('guideReference') + '</summary><div class="stack guide guide-reference">' +
    sections.map(([heading, paragraphs]) => panel(heading, paragraphs.map(key => '<p>' + tr(key) + '</p>').join(''))).join('') +
    panel('architecture', '<p>' + tr('architectureHelp') + '</p><dl class="data">' +
      Object.values(architectureFields).map(field => '<div><dt><strong>' + text(field.label[language]) +
        '</strong></dt><dd>' + text(field.help[language]) + '</dd></div>').join('') + '</dl>') +
    '</div></details>');
}
function catalogURL(params, change = {}) {
  const query = new URLSearchParams(params);
  for (const [key, value] of Object.entries(change)) {
    if (value) query.set(key, value);
    else query.delete(key);
  }
  return '#/catalog' + (query.size ? '?' + query : '');
}
function chip(label, href, active) {
  return '<a class="chip" href="' + attr(href) + '"' + (active ? ' aria-current="true"' : '') + '>' + text(label) + '</a>';
}
async function testRegistryView(params) {
  const requestedGroup = params.get('group');
  const selected = Object.hasOwn(testRegistry, requestedGroup) ? requestedGroup : '';
  const groups = Object.entries(testRegistry);
  const filter = '<nav class="chips" aria-label="' + tr('testChoose') + '">' +
    chip(tr('testAll'), testRegistryURL(), !selected) + groups.map(([key, group]) =>
      chip(group.label[language], testRegistryURL(key), key === selected)).join('') + '</nav>';
  const available = await localResearch();
  const registry = groups.filter(([key]) => !selected || selected === key).map(([, group]) => {
    const rows = group.tests.map(([id, label, inputs, output]) => '<tr><th scope="row"><span class="muted mono">' + text(id) +
      '</span><br>' + text(label[language]) + '</th><td>' + text(inputs[language]) + '</td><td>' + text(output[language]) + '</td></tr>');
    const sources = group.sources.map(([label, url]) => [label, Array.isArray(url) ? url[language] : url])
      .filter(([, url]) => !url.startsWith('/research/') || available.has(url));
    return '<section class="panel tight"><div class="page-top"><h2>' + text(group.label[language]) +
      '</h2><p class="muted">' + tr(group.status) + '</p></div>' +
      table([tr('testRegistry'), tr('testInput'), tr('testOutput')], rows, 'test-registry-table') +
      '<div class="actions"><a href="#/example/' + attr(group.example) + '">' + tr('testOpenExample') + '</a>' +
      sources.map(([label, url]) => safeLink(url, tr(label))).join('') + '</div></section>';
  }).join('');
  return layout(crumbs(tr('testRegistry')) + '<div class="tight"><h1>' + tr('testRegistry') + '</h1><p class="muted">' +
    tr('testRegistryIntro') + '</p></div>' + filter + registry);
}
async function showCatalog(params) {
  const domainKey = params.get('domain');
  const domain = Object.hasOwn(domains, domainKey) ? domains[domainKey] : null;
  const heading = domain?.label[language] || tr('allAreas');
  const base = catalogURL('', { domain: domain ? domainKey : '' });
  const hasFilters = filterKeys.some(key => params.get(key));
  const research = domain && domainResearch[domainKey];
  const keys = domain ? homeExamples.filter(key => exampleDomain(key) === domainKey) : homeExamples;
  const [records, available] = await Promise.all([
    api('passports?' + params, 'GET', undefined, AbortSignal.timeout(4500)).catch(() => null),
    research ? localResearch() : null
  ]);
  const compare = '<div class="page-top"><div class="tight"><h2>' + tr('objectCatalog') +
    '</h2><p class="muted">' + tr('compareHint') + '</p></div><button class="secondary" type="button" data-action="compare"' +
    (comparison.size < 2 ? ' disabled' : '') + '>' + tr('compare') + ' <span id="compare-count">(' + comparison.size + ')</span></button></div>';
  const classification = panel('classification',
    '<nav class="chips" aria-label="' + tr('areas') + '">' + chip(tr('allAreas'), catalogURL(params, { domain: '' }), !domain) +
    Object.keys(domains).map(key => chip(domains[key].label[language],
      catalogURL(params, { domain: key }), key === domainKey)).join('') + '</nav>' +
    '<nav class="chips" aria-label="' + tr('level') + '">' + chip(tr('allLevels'), catalogURL(params, { level: '' }), !params.get('level')) +
    Object.keys(levels).map(key => chip(name(levels, key), catalogURL(params, { level: key }), params.get('level') === key)).join('') + '</nav>');
  const filterForm = '<form class="panel tight filters" data-form="filters" data-domain="' + attr(domain ? domainKey : '') + '"><h3>' + tr('filters') +
    '</h3>' + input('q', tr('searchLabel'), params.get('q'), 'type="search" maxlength="200"') +
    ['type', 'stage', 'property', 'evidence'].map(key => select(key, tr(key), taxonomy[key], params.get(key), 'any')).join('') +
    input('person', tr('person'), params.get('person'), 'maxlength="200"') + '<input type="hidden" name="level" value="' +
    attr(params.get('level')) + '"><div class="actions">' + submit('search') + '<a href="' + attr(base) + '">' + tr('reset') + '</a></div></form>';
  const mobileLabel = key => '<span class="mobile-label" aria-hidden="true">' + tr(key) + '</span>';
  const rows = (records || []).map(item => '<tr role="row"><td role="cell" class="catalog-check"><label class="check"><input type="checkbox" name="compare" value="' + attr(item.id) +
    '" aria-label="' + attr(tr('choose') + ' ' + item.title) + '"' + (comparison.has(item.id) ? ' checked' : comparison.size >= 4 ? ' disabled' : '') +
    '></label></td><td role="cell" class="catalog-name"><a href="' + passportURL(item.id) + '">' + text(item.title) + '</a><p class="muted">' +
    text([item.author, item.organization].filter(Boolean).join(' · ')) + '</p></td><td role="cell">' + mobileLabel('type') +
    text([name(levels, item.level), name(types, item.type)].filter(Boolean).join(' · ') || tr('none')) + '</td><td role="cell">' + mobileLabel('property') +
    text(item.claims.map(claim => name(properties, claim.property)).filter(Boolean).join(', ') || tr('none')) +
    '</td><td role="cell">' + mobileLabel('stage') + '<p>' + text(name(stages, item.stage) || tr('none')) + '</p><p class="muted">' +
    recordLabel(item) + '</p></td><td role="cell">' + mobileLabel('updated') + date(item.updated) + '</td></tr>');
  const listing = records === null ? notice('registryUnavailable') : records.length ? table(['<span class="visually-hidden">' + tr('choose') + '</span>',
    ...['title', 'type', 'property', 'stage', 'updated'].map(tr)], rows, 'catalog-table') :
    '<section class="panel empty tight"><h3>' + tr(hasFilters ? 'noResults' : 'noRecords') + '</h3><p>' +
    tr(hasFilters ? 'fewerFilters' : 'emptyContext') + '</p><div class="actions">' +
    (hasFilters ? button('reset', base, true) : button('create', createURL(domainKey), true)) + '</div></section>';
  return layout(crumbs(tr('catalog')) + '<div class="tight"><h1>' + heading + '</h1><p class="muted">' +
    (domain?.description[language] || tr('catalogAbout')) + '</p></div>' +
    (hasFilters ? '' : exampleGallery(keys)) + (domainKey === 'infrastructure' ? territoryContext('neighbourhood') : '') +
    researchLinks(research, available) + classification +
    '<div class="catalog-layout">' + filterForm + '<section class="tight">' + compare + listing +
    (records?.length ? '<div>' + button('create', createURL(domainKey), true) + '</div>' : '') + '</section></div>');
}
async function compareView(params) {
  const ids = (params.get('ids') || '').split(',').slice(0, 4);
  const records = await api('passports?' + new URLSearchParams({ ids: ids.join(',') }));
  const values = [
    ['id', item => item.id], ['domain', item => item.domains.map(key => domains[key]?.label[language]).filter(Boolean).join(', ')],
    ['type', item => name(types, item.type)], ['level', item => name(levels, item.level)], ['stage', item => name(stages, item.stage)],
    ['description', item => item.description], ['author', item => item.author], ['organization', item => item.organization],
    ['property', item => item.claims.map(claim => {
      const property = name(properties, claim.property);
      const support = name(evidence, claim.evidence);
      return [property, support].filter(Boolean).join(' · ');
    }).filter(Boolean).join('\n')], ['version', item => item.version], ['updated', item => date(item.updated)]
  ];
  const result = records.length < 2 ? notice('compareInvalid', true) : table([tr('field'), ...records.map(item =>
    '<a href="' + passportURL(item.id) + '">' + text(item.title) + '</a>')], values.map(([label, read]) =>
    '<tr><th scope="row">' + (passportFields[label]?.[language] || tr(label)) + '</th>' +
    records.map(item => '<td class="preline">' + text(read(item) || tr('none')) + '</td>').join('') + '</tr>'), 'comparison-table');
  return layout(crumbs(catalogLink + tr('catalog') + '</a>', tr('comparison')) + '<h1>' + tr('comparison') + '</h1>' +
    result + '<div class="actions">' + button('backCatalog', '#/catalog', true) + '</div>');
}
function descriptionList(pairs) {
  const supplied = pairs.filter(([, value]) => value);
  if (!supplied.length) return '<p class="muted">' + tr('none') + '</p>';
  return '<dl class="data">' + supplied.map(([label, value]) => '<div><dt>' + text(label) +
    '</dt><dd class="preline">' + text(value) + '</dd></div>').join('') + '</dl>';
}
function fieldValues(passport, keys) {
  return descriptionList(keys.map(key => [name(passportFields, key), passport[key]]));
}
function exampleResultsTable(example) {
  const words = value => text(Array.isArray(value) ? value[language] : value);
  return example.rows ? table(example.columnsLabel.map(words), example.rows.map(row =>
    '<tr><th scope="row">' + words(row[0]) + '</th>' + row.slice(1).map(value => '<td>' + words(value) + '</td>').join('') + '</tr>'),
    'example-results') : '';
}
async function exampleView(key) {
  if (!Object.hasOwn(examples, key)) throw new Error('missing');
  const example = examples[key];
  const domain = exampleDomain(key);
  const words = value => text(Array.isArray(value) ? value[language] : value);
  const available = await localResearch();
  const domainLink = '<a href="' + catalogURL('', { domain }) + '">' + words(domains[domain].label) + '</a>';
  const details = descriptionList([
    [tr('type'), name(types, example.type)], [tr('level'), name(levels, example.level)],
    [tr('stage'), name(stages, example.stage)], [tr('property'), name(properties, example.property)],
    [tr('evidence'), example.evidenceLabel?.[language] || name(evidence, example.evidence)],
    [tr('exampleSource'), example.source[language]]
  ]);
  const image = '<figure class="example-image"><img src="./' + attr(exampleImagePath(example)) + '" alt="' +
    words(example.imageAlt) + '"><figcaption>' + (example.imageCaption ? words(example.imageCaption) :
      tr(example.sourceImage ? 'exampleSourceImage' : 'exampleIllustration')) + '</figcaption></figure>';
  const relationsBlock = example.related ? '<ol class="example-chain">' +
    example.related.map(item => '<li>' + words(item) + '</li>').join('') + '</ol>' : '';
  const design = example.design ? panel('architecture', descriptionList(Object.entries(example.design).map(([field, value]) =>
    [architectureFields[field].label[language], value[language]]))) : '';
  const sourceLinks = example.links.filter(([, url]) => !url.startsWith('/research/') || available.has(url))
    .map(([label, url]) => [label[language], url]);
  const relatedResearch = (domainResearch[domain] || []).filter(group => (group.examples || [domain]).includes(key));
  return layout(crumbs(catalogLink + tr('catalog') + '</a>', domainLink, tr('exampleTitle')) +
    '<div class="panel example-intro"><div class="tight"><p class="eyebrow">' + tr('exampleTitle') + '</p><h1>' + words(example.title) +
    '</h1><p class="muted">' + words(example.summary) + '</p>' + details + '</div>' + image + '</div>' +
    researchLinks(relatedResearch, available, 'researchMore', sourceLinks) + (key === 'house' ? houseProjectSample() : '') +
    territoryContext(key === 'grid' ? 'neighbourhood' : key) + relationsBlock + design +
    panel('exampleData', '<p>' + words(example.documents) + '</p>') +
    panel('exampleProcedure', '<p>' + words(example.procedure) + '</p>') +
    panel(example.stage === 'concept' ? 'exampleTarget' : 'exampleResult', exampleResultsTable(example) + '<p>' + words(example.outcome) + '</p>') +
    panel('exampleStorageTitle', '<p>' + tr(useCloud ? 'exampleCloudStorage' : 'exampleStorage') + '</p><div class="actions">' +
      button('exampleOwn', exampleDraftURL(key)) +
      (example.columns ? '<a href="' + (useCloud ? 'data:text/csv;charset=utf-8,' +
        encodeURIComponent(example.columns.join(',') + '\r\n') : './examples/' + attr(key) + '.csv') +
        '" download="' + attr(key) + '-data-template.csv">' + tr('exampleTemplate') + '</a>' : '') + '</div>'));
}
function passportContent(passport) {
  const identity = [
    [tr('id'), passport.id], [tr('version'), passport.version], [tr('updated'), date(passport.updated)],
    [name(passportFields, 'author'), passport.author], [name(passportFields, 'organization'), passport.organization],
    [tr('domain'), passport.domains.map(key => domains[key]?.label[language]).filter(Boolean).join(', ')],
    [tr('type'), name(types, passport.type)], [tr('level'), name(levels, passport.level)], [tr('stage'), name(stages, passport.stage)],
    [tr('visibility'), tr(passport.visibility)], [tr('status'), tr(passport.status)]
  ];
  const claims = passport.claims.map(claim => '<article class="panel subtle tight"><h3>' + text(name(properties, claim.property) || tr('claim')) +
    '</h3>' + descriptionList([[tr('evidence'), name(evidence, claim.evidence)],
      ...Object.keys(claimFields).map(key => [name(claimFields, key), claim[key]])]) + '</article>').join('');
  const specific = Object.entries(passport.details).map(([key, fields]) => {
    if (!Object.hasOwn(domains, key)) return '';
    const values = Object.entries(fields).filter(([field, value]) => value && !Object.hasOwn(houseProjectFields, field));
    return values.length ? '<div class="tight"><h3>' + domains[key].label[language] + '</h3>' +
      descriptionList(values.map(([field, value]) => [domains[key].fields[field]?.[language], value])) + '</div>' : '';
  }).join('');
  const houseFields = passport.details.buildings || {};
  const houseProject = houseProjectGroups.map(({ label, fields }) => {
    const values = Object.entries(fields).filter(([key]) => houseFields[key]);
    return values.length ? '<div class="tight"><h3>' + text(label[language]) + '</h3>' +
      descriptionList(values.map(([key, [field]]) => [field[language], houseFields[key]])) + '</div>' : '';
  }).join('');
  return panel('identity', (passport.description ? '<p class="preline">' + text(passport.description) + '</p>' : '') + descriptionList(identity)) +
    panel('living', claims || '<p class="muted">' + tr('noClaims') + '</p>') +
    (Object.keys(architectureFields).some(key => passport[key]) ? panel('architecture', fieldValues(passport, Object.keys(architectureFields))) : '') +
    panel('engineering', fieldValues(passport, engineeringKeys) + specific) +
    (houseProject ? panel('houseProject', houseProject) : '') +
    panel('origins', fieldValues(passport, originKeys));
}
async function passportView(id, version) {
  const endpoint = 'passports/' + encodeURIComponent(id);
  const data = await api(endpoint + (version ? '/versions/' + encodeURIComponent(version) : ''));
  const passport = version ? data : data.passport;
  const location = crumbs(catalogLink + tr('catalog') + '</a>', text(passport.title));
  const heading = '<div class="page-top"><div class="tight">' +
    '<h1>' + text(passport.title) + '</h1><p class="muted">' + (version ? tr('versionView') + ' · ' + passport.version : recordLabel(passport)) + '</p></div>' +
    (version ? button('current', passportURL(id), true) : passport.editable ? button('edit', '#/edit/' + encodeURIComponent(id)) : '') + '</div>';
  const content = passportContent(passport);
  const links = passport.links.map(link => '<li>' + safeLink(link.url, link.title || link.url) + '</li>');
  if (version) return layout(location + heading + content + panel('files', links.length ?
    '<ul class="compact-list">' + links.join('') + '</ul>' : '<p class="muted">' + tr('noFiles') + '</p>'));
  const related = data.related.map(item => '<li><a href="' + passportURL(item.target) + '">' + text(item.title) + '</a> · ' +
    text((item.incoming ? tr('inbound') + ' · ' : '') + name(relations, item.type)) +
    (item.note ? '<p class="muted preline">' + text(item.note) + '</p>' : '') + '</li>');
  const fileURL = file => '/api/' + endpoint + '/files/' + encodeURIComponent(file.id);
  const fileLink = file => useCloud ?
    'href="#" data-action="download-cloud-file" data-passport="' + attr(id) + '" data-file="' + attr(file.id) + '" data-filename="' + attr(file.name) + '"' :
    'href="' + fileURL(file) + '" download';
  const files = [...links, ...data.files.map(file => '<li><a ' + fileLink(file) + '>' +
    text(file.name) + '</a> · ' + text(name(attachmentCategories, file.category)) +
    (file.revision ? ' · ' + text(file.revision) : '') + ' · ' + new Intl.NumberFormat(language ? 'en' : 'ru', {
      style: 'unit', unit: file.size < 1000 ? 'byte' : 'kilobyte', maximumFractionDigits: 1
    }).format(file.size < 1000 ? file.size : file.size / 1000) +
    (passport.editable ? ' ' + removeButton(endpoint + '/files/' + encodeURIComponent(file.id), 'reload') : '') + '</li>')];
  const photo = data.files.find(file => file.category === 'image' && (useCloud ? file.previewURL : file.preview));
  const cover = photo ? '<figure class="passport-photo"><img src="' + attr(useCloud ? photo.previewURL : fileURL(photo) + '?preview=1') + '" alt="' + attr(photo.name) +
    '"><figcaption>' + text(photo.name) + '</figcaption></figure>' : '';
  const upload = passport.editable ? '<form class="tight" data-form="file" data-id="' + attr(id) + '">' +
    '<p class="muted">' + tr('fileGuide') + '</p><div class="grid-2">' + select('category', tr('fileCategory'), attachmentCategories, 'other') +
    input('revision', tr('fileRevision'), '', 'maxlength="100"') + '</div>' +
    input('file', tr('file') + ' (≤ ' + attachmentLimits.fileMiB + (language ? ' MiB)' : ' МиБ)'), '', 'type="file" required') +
    formStatus + '<div>' + submit('upload', true) + '</div></form>' : '';
  const versions = data.versions.map(item => '<li><a href="' + passportURL(id) + '/version/' + item.version + '">' +
    tr('version') + ' ' + item.version + '</a> · ' + date(item.updated) +
    (item.changes ? '<p class="muted preline">' + text(item.changes) + '</p>' : '') + '</li>');
  const comments = data.comments.map(item => '<article class="comment tight"><p><strong>' + text(item.name) +
    '</strong> <span class="muted">· ' + date(item.created) + '</span></p><p class="preline">' + text(item.message) + '</p>' +
    (item.deletable ? '<div>' + removeButton(endpoint + '/comments/' + encodeURIComponent(item.id), 'reload') + '</div>' : '') + '</article>');
  const removal = passport.editable ? panel('removeZone', '<p class="muted">' + tr('removePassportHelp') + '</p><div>' +
    removeButton(endpoint, '#/catalog', 'removePassport') + '</div>') : '';
  const discuss = user ? '<form class="tight" data-form="comment" data-id="' + attr(id) + '">' +
    area('message', tr('message'), '', 'required') + formStatus + '<div>' + submit('send', true) + '</div></form>' :
    '<p><a href="' + attr(accountURL(passportURL(id))) + '">' + tr('signIn') + '</a></p>';
  return layout(location + heading + cover + content +
    panel('related', related.length ? '<ul class="compact-list">' + related.join('') + '</ul>' : '<p class="muted">' + tr('noRelated') + '</p>') +
    panel('files', (files.length ? '<ul class="compact-list">' + files.join('') + '</ul>' : '<p class="muted">' + tr('noFiles') + '</p>') + upload) +
    panel('history', '<ul class="compact-list">' + versions.join('') + '</ul>') +
    panel('discussions', (comments.join('') || '<p class="muted">' + tr('noComments') + '</p>') + discuss) + removal);
}
function accountView() {
  if (!user) return authPage('login', new URLSearchParams({ next: '#/account' }));
  return layout(crumbs(tr('accountTitle')) + '<section class="panel tight"><h1>' + tr('accountTitle') + '</h1><p>' +
    tr('accountSigned') + ' <strong>' + text(user.name) + '</strong></p><p><a href="#/rules">' + tr('rulesTitle') + '</a></p></section>' +
    panel('removeAccount', '<p class="muted">' + tr('removeAccountHelp') + '</p><div>' +
      removeButton('account', '#/', 'removeAccount') + '</div>'));
}
function aboutView() {
  const links = [['ORCID 0009-0004-7834-1486', 'https://orcid.org/0009-0004-7834-1486'], ['GitHub', 'https://github.com/EvgeniyPusser'],
    ['Zenodo', 'https://zenodo.org/records/23012010'], ['evgenii@living-things.org', 'mailto:evgenii@living-things.org']];
  return layout(crumbs(tr('aboutTitle')) + '<section class="panel stack"><div class="tight"><h1>' + tr('aboutTitle') + '</h1><p>' +
    tr('aboutLead') + '</p></div><div class="tight"><h2>' + tr('aboutAimTitle') + '</h2><p>' + tr('aboutAimText') + '</p></div>' +
    '<div class="tight"><h2>' + tr('aboutWhoTitle') + '</h2><p>' + tr('aboutWhoText') + '</p><ul class="compact-list">' +
    links.map(([label, url]) => '<li>' + safeLink(url, label) + '</li>').join('') + '</ul></div>' +
    '<div class="tight"><h2>' + tr('aboutJoinTitle') + '</h2><p>' + tr('aboutJoinText') + '</p></div><div class="actions">' +
    button('registerSubmit', '#/register') + button('rulesTitle', '#/rules', true) + '</div></section>');
}
function rulesView() {
  const sections = [['rulesOwnTitle', 'rulesOwnText'], ['rulesSeeTitle', 'rulesSeeText'], ['rulesRemoveTitle', 'rulesRemoveText'],
    ['rulesDutyTitle', 'rulesDutyText'], ['rulesContactTitle', 'rulesContactText']];
  return layout(crumbs(tr('rulesTitle')) + '<section class="panel stack"><div class="tight"><h1>' + tr('rulesTitle') + '</h1><p class="muted">' +
    tr('rulesIntro') + '</p></div>' + sections.map(([heading, paragraph]) =>
      '<div class="tight"><h2>' + tr(heading) + '</h2><p>' + tr(paragraph) + '</p></div>').join('') + '</section>');
}

const access = { public: strings.public, private: strings.private };
function houseProjectEditor(details = {}) {
  return '<div class="stack" data-house-project hidden><p>' + tr('houseProjectEditorNote') + ' ' +
    '<a href="#/guide?object=house" rel="noopener" target="_blank">' + tr('houseOpenSample') + '</a></p>' +
    houseProjectGroups.map(({ label, fields }) => '<fieldset class="grid-2"><legend>' + text(label[language]) + '</legend>' +
      Object.entries(fields).map(([key, [field, prompt]]) => '<div class="architecture-field">' +
        area('detail.buildings.' + key, field[language], details[key], 'aria-describedby="house-' + key + '"') +
        '<p class="muted" id="house-' + key + '">' + text(prompt[language]) + '</p></div>').join('') + '</fieldset>').join('') + '</div>';
}
function editSections(passport, candidates) {
  const chosen = passport.domains || [];
  const typesBlock = ['type', 'level', 'stage'].map(key => select(key, tr(key), taxonomy[key], passport[key])).join('');
  const domainEditor = Object.entries(domains).map(([key, config]) => '<label class="check"><input type="checkbox" name="domains" value="' + key +
    '"' + (chosen.includes(key) ? ' checked' : '') + '>' + config.label[language] + '</label>').join('');
  return panel('identity', '<div class="grid-2">' +
    '<div class="wide">' + input('title', tr('title'), passport.title, 'required maxlength="200"') + '</div>' +
    input('author', name(passportFields, 'author'), passport.author, 'maxlength="4000"') +
    input('organization', name(passportFields, 'organization'), passport.organization, 'maxlength="4000"') +
    '<div class="wide">' + passportArea(passport, 'description') + '</div></div><div class="editor-options">' + typesBlock +
    '</div><fieldset class="tight"><legend>' + tr('domain') + '</legend><div class="grid-2">' + domainEditor + '</div></fieldset>') +
    panel('living', '<p class="muted">' + tr('claimHelp') + '</p><div class="tight" id="claim-list">' +
      (passport.claims || [{}]).map(claimEditor).join('') + '</div><div>' + customButton('addClaim', 'add-claim') + '</div>') +
    panel('architecture', '<p class="muted">' + tr('architectureHelp') + '</p><div class="grid-2">' +
      Object.entries(architectureFields).map(([key, field]) => '<div class="architecture-field">' +
        area(key, field.label[language], passport[key], 'aria-describedby="' + key + '-help"') +
        '<p class="muted" id="' + key + '-help">' + text(field.help[language]) + '</p></div>').join('') + '</div>') +
    panel('engineering', '<div class="grid-2">' + engineeringKeys.map(key => passportArea(passport, key)).join('') + '</div>') +
    panel('domainFields', '<p class="muted">' + tr('specificHelp') + '</p>' + Object.entries(domains).map(([key, domain]) =>
      '<fieldset class="tight" data-domain-fields="' + key + '"' + (chosen.includes(key) ? '' : ' hidden disabled') + '><legend>' + domain.label[language] +
      '</legend><div class="grid-2">' + Object.keys(domain.fields).filter(field => !Object.hasOwn(houseProjectFields, field)).map(field =>
        area('detail.' + key + '.' + field, name(domain.fields, field), passport.details?.[key]?.[field])).join('') + '</div>' +
      (key === 'buildings' ? houseProjectEditor(passport.details?.buildings) : '') + '</fieldset>').join('')) +
    panel('origins', '<div class="grid-2">' + [...originKeys, 'changes'].map(key => passportArea(passport, key)).join('') + '</div>') +
    panel('related', '<div id="relation-list" class="tight">' + (passport.relations || []).map(item => relationEditor(item, candidates)).join('') +
      '</div>' + (candidates.length ? '<div>' + customButton('addRelation', 'add-relation') + '</div>' :
        '<p class="muted">' + tr('relationHelp') + '</p>')) +
    panel('files', '<p class="muted">' + tr(useCloud ? 'exampleCloudStorage' : 'exampleStorage') + '</p><div id="link-list" class="tight">' + (passport.links || []).map(linkEditor).join('') +
      '</div><div>' + customButton('addLink', 'add-link') + '</div>');
}
function claimEditor(item = {}) {
  return rowEditor('claim', tr('claim'), select('property', tr('property'), properties, item.property) +
    select('evidence', tr('evidence'), evidence, item.evidence) +
    Object.keys(claimFields).map(key => area(key, name(claimFields, key), item[key])).join(''));
}
function relationEditor(item, candidates) {
  const targets = Object.fromEntries(candidates.map(target => [target.id, [target.title, target.title]]));
  return rowEditor('relation', tr('relationType'), select('type', tr('relationType'), relations, item.type) +
    select('target', tr('target'), targets, item.target) + '<div class="wide">' +
    area('note', tr('relationNote'), item.note) + '</div>');
}
function linkEditor(item = {}) {
  return rowEditor('link', tr('linkUrl'), input('title', tr('linkTitle'), item.title, 'maxlength="200"') +
    input('url', tr('linkUrl'), item.url, 'type="url" maxlength="2000"'));
}
function rowEditor(kind, legend, fields) {
  return '<fieldset class="subtle tight" data-row="' + kind + '"><legend>' + legend + '</legend><div class="grid-2">' +
    fields + '</div><div>' + customButton('removeEntry', 'remove-row') + '</div></fieldset>';
}
function syncEditor(form) {
  const current = new FormData(form);
  const domainKeys = current.getAll('domains');
  for (const fieldset of form.querySelectorAll('[data-domain-fields]')) {
    fieldset.hidden = fieldset.disabled = !domainKeys.includes(fieldset.dataset.domainFields);
  }
  const houseProject = form.querySelector('[data-house-project]');
  houseProject.hidden = current.get('level') !== 'whole' &&
    ![...houseProject.querySelectorAll('textarea')].some(field => field.value);
  for (const row of form.querySelectorAll('[data-row="claim"]')) {
    const level = current.get('level');
    const stage = current.get('stage');
    const support = row.querySelector('[name=evidence]').value;
    for (const [key, optional] of [
      ['role', !level || level === 'whole'], ['proof', !support || support === 'author']
    ]) {
      row.querySelector('[name=' + key + ']').closest('label').classList.toggle('muted', optional);
    }
    const feedback = row.querySelector('[name=feedback]');
    feedback.placeholder = stage === 'concept' ? tr('observationNote') : '';
  }
  const type = current.get('type');
  form.querySelector('[name=characteristics]').closest('label').firstChild.textContent =
    type === 'software' ? (language ? 'Architecture and technical characteristics' : 'Архитектура и технические характеристики')
      : name(passportFields, 'characteristics');
}
function editorPage(passport, candidates) {
  const id = passport.id;
  const label = id ? 'edit' : 'create';
  return layout(crumbs(catalogLink + tr('catalog') + '</a>', tr(label)) + '<h1>' + tr(label) + '</h1>' +
    '<p class="muted">' + tr('editorHelp') + '</p><form class="stack" data-form="passport" data-id="' + attr(id) +
    '" data-version="' + attr(passport.version) + '">' + editSections(passport, candidates) +
    '<div class="panel tight">' + select('visibility', tr('visibility'), access, passport.visibility || 'private') +
    '<p class="muted">' + tr('accessHelp') + '</p>' + formStatus +
    '<div class="actions">' + submit('saveDraft', true, 'value="draft"') +
    submit(passport.status === 'published' ? 'savePublished' : 'publish', false, 'value="published"') +
    button('cancel', id ? passportURL(id) : '#/catalog', true) + '</div></div></form>');
}
async function openEditor(id, params, routeToken) {
  if (!user) return authPage('login', new URLSearchParams({ next: location.hash }));
  const reused = editorState?.route === location.hash && editorState.passport;
  const domain = params.get('domain');
  const initial = { domains: Object.hasOwn(domains, domain) ? [domain] : [] };
  const exampleKey = params.get('example') === '1' ? domain : params.get('example');
  if (Object.hasOwn(examples, exampleKey) && exampleDomain(exampleKey) === domain) {
    Object.assign(initial, { type: examples[exampleKey].type, level: examples[exampleKey].level });
  }
  const [loaded, allRecords] = await Promise.all([id ? api('passports/' + encodeURIComponent(id)) : null, api('passports')]);
  if (id && !loaded.passport.editable) throw new Error('forbidden');
  const candidates = allRecords.filter(item => item.id !== id);
  const passport = reused || loaded?.passport || initial;
  if (routeToken === generation) editorState = { candidates, route: location.hash, passport };
  return editorPage(passport, candidates);
}
function nextURL(value) {
  return /^#\/(?:new|edit\/|passport\/|catalog)(?:[\w/?&=%.,+-]*)$/.test(value || '') ? value : '#/catalog';
}
function authPage(route, params) {
  const register = route === 'register';
  const next = nextURL(params.get('next'));
  const query = '?' + new URLSearchParams({ next });
  const fields = (register ? input('name', tr('accountName'), '', 'required autocomplete="name" maxlength="120"') : '') +
    input('email', tr('email'), '', 'type="email" required autocomplete="email" maxlength="254"') +
    input('password', tr('password'), '', 'type="password" minlength="10" maxlength="256" required autocomplete="' +
      (register ? 'new-password' : 'current-password') + '" aria-describedby="password-hint"');
  return layout(crumbs(tr(register ? 'register' : 'signIn')) + '<section class="panel auth stack"><h1>' +
    tr(register ? 'register' : 'signIn') + '</h1><p class="muted">' + tr('needAccount') + '</p>' +
    '<form class="tight" data-form="' + (register ? 'register' : 'login') + '" data-next="' + attr(next) + '">' + fields +
    '<p id="password-hint" class="muted">' + tr('passwordHint') + '</p>' + formStatus + '<div class="actions">' +
    submit(register ? 'registerSubmit' : 'signIn') + button(register ? 'signIn' : 'register',
      '#/' + (register ? 'login' : 'register') + query, true) + '</div></form></section>');
}
async function render({ focus = false, keepScroll = false } = {}) {
  const routeToken = ++generation;
  const currentHash = location.hash;
  if (editorState?.route !== currentHash) editorState = null;
  const [path = '', query = ''] = currentHash.replace(/^#\/?/, '').split('?');
  const [route, id, action, version] = path.split('/');
  const params = new URLSearchParams(query);
  document.documentElement.lang = language ? 'en' : 'ru';
  frame(route);
  const previousScroll = window.scrollY;
  const researchOpen = keepScroll && main.querySelector('details.research')?.open;
  main.setAttribute('aria-busy', 'true');
  let result;
  try {
    switch (route) {
      case '': result = home(); break;
      case 'guide': result = await guide(params); break;
      case 'tests': result = await testRegistryView(params); break;
      case 'catalog': result = await showCatalog(params); break;
      case 'example': result = await exampleView(id); break;
      case 'compare': result = await compareView(params); break;
      case 'passport': result = await passportView(id, action === 'version' ? version : undefined); break;
      case 'edit':
      case 'new': result = await openEditor(id, params, routeToken); break;
      case 'login':
      case 'register': result = authPage(route, params); break;
      case 'account': result = accountView(); break;
      case 'rules': result = rulesView(); break;
      case 'about': result = aboutView(); break;
      default: throw new Error('missing');
    }
  } catch (error) {
    result = layout(notice(errorMessage(error), true) + '<div>' + button('backCatalog', '#/catalog', true) + '</div>');
  }
  if (routeToken !== generation) return;
  main.innerHTML = result;
  const research = main.querySelector('details.research');
  if (research && researchOpen) research.open = true;
  main.removeAttribute('aria-busy');
  const alert = flash;
  flash = '';
  if (alert) main.firstElementChild.insertAdjacentHTML('afterbegin', notice(alert));
  const editor = main.querySelector('[data-form=passport]');
  if (editor) syncEditor(editor);
  document.title = (main.querySelector('h1')?.textContent || tr('catalog')) + (route ? ' · Living Things' : '');
  if (focus) {
    main.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  } else if (keepScroll) window.scrollTo(0, previousScroll);
}
function routeTo(href) {
  if (location.hash === href) {
    render({ focus: true });
    return;
  }
  location.hash = href;
}
function editorData(form, status) {
  const data = new FormData(form);
  const readRows = kind => [...form.querySelectorAll('[data-row="' + kind + '"]')].map(row =>
    Object.fromEntries([...row.querySelectorAll('input,textarea,select')].map(field => [field.name, field.value])));
  const details = {};
  for (const field of form.querySelectorAll('[name^="detail."]')) {
    const [, domain, key] = field.name.split('.');
    details[domain] ??= {};
    details[domain][key] = field.value;
  }
  const claims = readRows('claim').filter(item => Object.values(item).some(value => value.trim()));
  return {
    id: form.dataset.id, version: Number(form.dataset.version), status,
    ...Object.fromEntries(['title', 'stage', 'type', 'level', 'visibility', ...Object.keys(passportFields)].map(key => [key, data.get(key)])),
    domains: data.getAll('domains'), details, claims, relations: readRows('relation'), links: readRows('link')
  };
}
async function uploadAttachment(id, file, data) {
  if (!file?.size || file.size > attachmentLimits.fileMiB * 1024 * 1024) throw new Error('fileInvalid');
  if (useCloud) return (await cloud()).uploadCloudFile(id, file, data);
  const query = new URLSearchParams({ name: file.name, category: data.get('category'), revision: data.get('revision') });
  const response = await fetch('/api/passports/' + encodeURIComponent(id) + '/files?' + query, {
    method: 'POST', headers: { 'Content-Type': 'application/octet-stream' }, body: file
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error || 'failed');
  }
}
async function transact(form, task) {
  const buttons = [...form.querySelectorAll('button:not([disabled])')];
  const status = form.querySelector('.form-status');
  status.innerHTML = notice('loading');
  buttons.forEach(button => { button.disabled = true; });
  try {
    await task();
    status.textContent = '';
  } catch (error) {
    status.innerHTML = notice(errorMessage(error), true);
    status.scrollIntoView({ block: 'nearest' });
  } finally {
    buttons.forEach(button => { button.disabled = false; });
  }
}
document.addEventListener('submit', event => {
  const form = event.target;
  const kind = form.dataset.form;
  if (!kind) return;
  event.preventDefault();
  const data = new FormData(form);
  const id = form.dataset.id;
  if (kind === 'global-search' || kind === 'filters') {
    routeTo(catalogURL('', { domain: form.dataset.domain, ...Object.fromEntries(data) }));
    return;
  }
  if (kind === 'register' || kind === 'login') {
    transact(form, async () => {
      const result = await api(kind, 'POST', { ...Object.fromEntries(data), next: form.dataset.next });
      user = result.user;
      if (result.confirmationRequired) {
        flash = 'cloudCheckInbox';
        routeTo(accountURL(form.dataset.next));
        return;
      }
      routeTo(form.dataset.next);
    });
  }
  if (kind === 'passport') {
    const status = event.submitter?.value || 'draft';
    transact(form, async () => {
      const result = await api(id ? 'passports/' + encodeURIComponent(id) : 'passports', id ? 'PUT' : 'POST', editorData(form, status));
      flash = 'saved';
      routeTo(passportURL(result.id));
    });
  }
  if (kind === 'comment' || kind === 'file') {
    transact(form, async () => {
      if (kind === 'file') {
        await uploadAttachment(id, data.get('file'), data);
      } else {
        await api('passports/' + encodeURIComponent(id) + '/comments', 'POST', { message: data.get('message') });
      }
      flash = kind === 'file' ? 'uploaded' : 'sent';
      await render({ keepScroll: true });
    });
  }
});
document.addEventListener('change', event => {
  const field = event.target;
  if (field.name === 'compare') {
    if (field.checked && comparison.size < 4) comparison.add(field.value);
    else comparison.delete(field.value);
    const compare = main.querySelector('[data-action=compare]');
    compare.disabled = comparison.size < 2;
    main.querySelector('#compare-count').textContent = '(' + comparison.size + ')';
    for (const control of main.querySelectorAll('[name=compare]')) control.disabled = comparisonsFull(control);
    return;
  }
  if (field.form?.dataset.form === 'passport') syncEditor(field.form);
});
function applyTheme() {
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#111315' : '#13263a';
}
function comparisonsFull(field) {
  return comparison.size >= 4 && !field.checked;
}
document.addEventListener('click', async event => {
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const action = control.dataset.action;
  if (action === 'download-cloud-file') {
    event.preventDefault();
    try {
      const url = await (await cloud()).downloadCloudFile(control.dataset.passport, control.dataset.file, control.dataset.filename);
      location.assign(url);
    } catch (error) {
      control.closest('li').insertAdjacentHTML('beforeend', notice(errorMessage(error), true));
    }
    return;
  }
  if (action === 'remove') {
    if (!control.dataset.armed) {
      control.dataset.armed = 'true';
      control.textContent = tr('confirmRemove');
      return;
    }
    control.disabled = true;
    try {
      const result = await api(control.dataset.endpoint, 'DELETE');
      if ('user' in result) user = result.user;
      flash = control.dataset.endpoint === 'account' ? 'accountRemoved' : 'removed';
      if (control.dataset.after === 'reload') await render({ keepScroll: true });
      else routeTo(control.dataset.after);
    } catch (error) {
      control.disabled = false;
      control.insertAdjacentHTML('afterend', notice(errorMessage(error), true));
    }
    return;
  }
  if (action === 'play-intro') {
    const figure = control.closest('figure');
    const video = figure.querySelector('video');
    control.hidden = true;
    try {
      await video.play();
      video.focus();
    } catch {
      figure.querySelector('.intro-video-fallback').hidden = false;
    }
  }
  if (action === 'skip') {
    event.preventDefault();
    main.focus();
  }
  if (action === 'theme') {
    dark = !dark;
    preference('lt-theme', dark ? 'dark' : 'light');
    applyTheme();
    control.textContent = tr(dark ? 'lightTheme' : 'darkTheme');
  }
  if (action === 'language') {
    const form = main.querySelector('[data-form=passport]');
    if (form && editorState) {
      editorState.passport = editorData(form, editorState.passport.status);
    }
    language = 1 - language;
    preference('lt-language', language ? 'en' : 'ru');
    await render({ keepScroll: true });
    header.querySelector('[data-action=language]').focus({ preventScroll: true });
  }
  if (action === 'logout') {
    try {
      user = (await api('logout', 'POST', {})).user;
      editorState = null;
      comparison.clear();
      await render();
    } catch (error) {
      main.firstElementChild.insertAdjacentHTML('afterbegin', notice(errorMessage(error), true));
    }
  }
  if (action === 'compare') routeTo('#/compare?' + new URLSearchParams({ ids: [...comparison].join(',') }));
  if (action === 'remove-row') {
    const row = control.closest('[data-row]');
    const add = row.parentElement.nextElementSibling?.querySelector('button');
    row.remove();
    add?.focus();
  }
  const additions = {
    'add-claim': ['claim-list', () => claimEditor()],
    'add-link': ['link-list', () => linkEditor()],
    'add-relation': ['relation-list', () => relationEditor({}, editorState?.candidates || [])]
  };
  if (Object.hasOwn(additions, action)) {
    const [listId, make] = additions[action];
    const list = document.getElementById(listId);
    list.insertAdjacentHTML('beforeend', make());
    syncEditor(control.form);
    list.lastElementChild.querySelector('select,input').focus();
  }
});
window.addEventListener('hashchange', () => render({ focus: true }));
applyTheme();
if (location.protocol !== 'file:') {
  try {
    user = (await api('session', 'GET', undefined, AbortSignal.timeout(4500))).user;
  } catch {
    // Public examples work without a registry connection.
  }
  if (useCloud) {
    const next = new URLSearchParams(location.search).get('lt-next');
    if (next) history.replaceState(null, '', location.pathname + (user ? nextURL(next) : accountURL(nextURL(next))));
  }
  await render();
}
