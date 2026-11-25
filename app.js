import { strings } from './locale.js';
import { domains, levels, types, properties, evidence, stages, relations, passportFields, claimFields } from './taxonomy.js';

const main = document.querySelector('#main');
const header = document.querySelector('#header');
const footer = document.querySelector('#footer');
const taxonomy = { level: levels, type: types, stage: stages, property: properties, evidence };
const filterKeys = ['q', 'level', 'type', 'stage', 'property', 'evidence', 'person'];
const engineeringKeys = ['composition', 'characteristics', 'interfaces', 'conditions'];
const originKeys = ['sources', 'rules', 'transfer', 'license'];
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
const createURL = domain => '#/new' + (domain ? '?domain=' + encodeURIComponent(domain) : '');
const accountURL = next => '#/login?' + new URLSearchParams({ next });
const recordLabel = item => text(tr(item.status) + ' · ' + tr(item.visibility));
const safeLink = (url, label) => '<a href="' + attr(url) + '" rel="noreferrer">' + text(label) + '</a>';

async function api(path, method = 'GET', values, signal) {
  const response = await fetch('/api/' + path, {
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
    '</a><a href="#/guide"' + current('guide') + '>' + tr('guide') + '</a><a href="#/catalog"' + current('catalog') + '>' + tr('catalog') + '</a></nav>' +
    '<nav class="nav-end" aria-label="' + tr('accountSettings') + '">' +
    (user ? '<span class="account-name">' + text(user.name) + '</span><button type="button" data-action="logout">' + tr('signOut') + '</button>'
      : '<a href="#/login"' + current('login') + '>' + tr('signIn') + '</a>') +
    '<button type="button" lang="' + (language ? 'ru' : 'en') + '" data-action="language">' +
    (language ? 'Русский' : 'English') + '</button><button type="button" data-action="theme">' +
    tr(dark ? 'lightTheme' : 'darkTheme') + '</button></nav></div></header>';
  footer.innerHTML = '<footer class="foot"><div class="wrap"><span>Living Things · ' + tr('portal') + '</span><a href="#/guide">' + tr('guide') + '</a></div></footer>';
}
function home() {
  const areaList = Object.entries(domains).map(([key, domain]) => '<a class="panel area" href="#/catalog?domain=' + key +
    '"><h3>' + domain.label[language] + '</h3><p class="muted">' + domain.description[language] + '</p></a>').join('');
  return layout('<section class="hero"><p class="eyebrow">' + tr('portal') + '</p><h1>Living Things</h1><p>' + tr('tagline') + '</p>' +
    globalSearch() + '</section><section class="panel intro"><h2>' + tr('intro') + '</h2>' +
    [['meaning', 'meaningBrief'], ['scope', 'scopeText'], ['passportPurpose', 'passportText'], ['findTitle', 'findText']].map(([heading, paragraph]) =>
      '<div class="tight"><h3>' + tr(heading) + '</h3><p class="muted">' + tr(paragraph) + '</p></div>').join('') +
    '<div class="actions">' + button('openGuide', '#/guide', true) + '</div></section><section class="tight"><h2>' + tr('areas') +
    '</h2><div class="areas">' + areaList + '</div></section>');
}
function guide() {
  const sections = [
    ['meaning', ['meaningText']], ['included', ['includedText', 'scopeText']],
    ['passportPurpose', ['passportText', 'evidenceText']], ['related', ['relationText']], ['findTitle', ['findText']]
  ];
  return layout(crumbs(tr('guide')) + '<h1>' + tr('guide') + '</h1><div class="stack guide">' +
    sections.map(([heading, paragraphs]) => panel(heading, paragraphs.map(key => '<p>' + tr(key) + '</p>').join(''))).join('') +
    '</div><div class="actions">' + button('backCatalog', '#/catalog') + button('create', '#/new', true) + '</div>');
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
async function showCatalog(params) {
  const domainKey = params.get('domain');
  const domain = Object.hasOwn(domains, domainKey) ? domains[domainKey] : null;
  const heading = domain?.label[language] || tr('allAreas');
  const base = catalogURL('', { domain: domain ? domainKey : '' });
  const hasFilters = filterKeys.some(key => params.get(key));
  const records = await api('passports?' + params);
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
  const rows = records.map(item => '<tr role="row"><td role="cell" class="catalog-check"><label class="check"><input type="checkbox" name="compare" value="' + attr(item.id) +
    '" aria-label="' + attr(tr('choose') + ' ' + item.title) + '"' + (comparison.has(item.id) ? ' checked' : comparison.size >= 4 ? ' disabled' : '') +
    '></label></td><td role="cell" class="catalog-name"><a href="' + passportURL(item.id) + '">' + text(item.title) + '</a><p class="muted">' +
    text([item.author, item.organization].filter(Boolean).join(' · ')) + '</p></td><td role="cell">' + mobileLabel('type') +
    text([name(levels, item.level), name(types, item.type)].filter(Boolean).join(' · ') || tr('none')) + '</td><td role="cell">' + mobileLabel('property') +
    text(item.claims.map(claim => name(properties, claim.property)).filter(Boolean).join(', ') || tr('none')) +
    '</td><td role="cell">' + mobileLabel('stage') + '<p>' + text(name(stages, item.stage) || tr('none')) + '</p><p class="muted">' +
    recordLabel(item) + '</p></td><td role="cell">' + mobileLabel('updated') + date(item.updated) + '</td></tr>');
  const listing = records.length ? table(['<span class="visually-hidden">' + tr('choose') + '</span>',
    ...['title', 'type', 'property', 'stage', 'updated'].map(tr)], rows, 'catalog-table') :
    '<section class="panel empty tight"><h3>' + tr(hasFilters ? 'noResults' : 'noRecords') + '</h3><p>' +
    tr(hasFilters ? 'fewerFilters' : 'emptyContext') + '</p><div class="actions">' +
    (hasFilters ? button('reset', base, true) : button('create', createURL(domainKey), true)) + '</div></section>';
  const tools = domain ? panel('tools', domain.tools?.length ?
    '<ul class="compact-list">' + domain.tools.map(tool => '<li>' +
      safeLink(Array.isArray(tool[2]) ? tool[2][language] : tool[2], tool[language]) + '</li>').join('') + '</ul>' :
    '<p class="muted">' + tr('noTools') + '</p>') : '';
  return layout(crumbs(tr('catalog')) + '<div class="page-top"><div class="tight"><h1>' + heading + '</h1><p class="muted">' +
    (domain?.description[language] || tr('catalogAbout')) + '</p></div>' + button('create', createURL(domainKey)) + '</div>' +
    classification + '<div class="catalog-layout">' + filterForm + '<section class="tight">' + compare + listing + '</section></div>' + tools);
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
  const specific = Object.entries(passport.details).filter(([key, fields]) => domains[key] && Object.values(fields).some(Boolean))
    .map(([key, fields]) => '<div class="tight"><h3>' + domains[key].label[language] + '</h3>' +
      descriptionList(Object.entries(fields).map(([field, value]) => [domains[key].fields[field]?.[language], value])) + '</div>').join('');
  return panel('identity', (passport.description ? '<p class="preline">' + text(passport.description) + '</p>' : '') + descriptionList(identity)) +
    panel('living', claims || '<p class="muted">' + tr('noClaims') + '</p>') + panel('engineering', fieldValues(passport, engineeringKeys) + specific) +
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
  const files = [...links, ...data.files.map(file => '<li><a href="/api/' + endpoint + '/files/' + attr(file.id) + '" download>' +
    text(file.name) + '</a> · ' + new Intl.NumberFormat(language ? 'en' : 'ru', {
      style: 'unit', unit: file.size < 1000 ? 'byte' : 'kilobyte', maximumFractionDigits: 1
    }).format(file.size < 1000 ? file.size : file.size / 1000) + '</li>')];
  const upload = passport.editable ? '<form class="tight" data-form="file" data-id="' + attr(id) + '">' +
    input('file', tr('file'), '', 'type="file" required') + formStatus + '<div>' + submit('upload', true) + '</div></form>' : '';
  const versions = data.versions.map(item => '<li><a href="' + passportURL(id) + '/version/' + item.version + '">' +
    tr('version') + ' ' + item.version + '</a> · ' + date(item.updated) +
    (item.changes ? '<p class="muted preline">' + text(item.changes) + '</p>' : '') + '</li>');
  const comments = data.comments.map(item => '<article class="comment tight"><p><strong>' + text(item.name) +
    '</strong> <span class="muted">· ' + date(item.created) + '</span></p><p class="preline">' + text(item.message) + '</p></article>');
  const discuss = user ? '<form class="tight" data-form="comment" data-id="' + attr(id) + '">' +
    area('message', tr('message'), '', 'required') + formStatus + '<div>' + submit('send', true) + '</div></form>' :
    '<p><a href="' + attr(accountURL(passportURL(id))) + '">' + tr('signIn') + '</a></p>';
  return layout(location + heading + content +
    panel('related', related.length ? '<ul class="compact-list">' + related.join('') + '</ul>' : '<p class="muted">' + tr('noRelated') + '</p>') +
    panel('files', (files.length ? '<ul class="compact-list">' + files.join('') + '</ul>' : '<p class="muted">' + tr('noFiles') + '</p>') + upload) +
    panel('history', '<ul class="compact-list">' + versions.join('') + '</ul>') +
    panel('discussions', (comments.join('') || '<p class="muted">' + tr('noComments') + '</p>') + discuss));
}

const access = { public: strings.public, private: strings.private };
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
    panel('engineering', '<div class="grid-2">' + engineeringKeys.map(key => passportArea(passport, key)).join('') + '</div>') +
    panel('domainFields', '<p class="muted">' + tr('specificHelp') + '</p>' + Object.entries(domains).map(([key, domain]) =>
      '<fieldset data-domain-fields="' + key + '"' + (chosen.includes(key) ? '' : ' hidden disabled') + '><legend>' + domain.label[language] +
      '</legend><div class="grid-2">' + Object.keys(domain.fields).map(field =>
        area('detail.' + key + '.' + field, name(domain.fields, field), passport.details?.[key]?.[field])).join('') + '</div></fieldset>').join('')) +
    panel('origins', '<div class="grid-2">' + [...originKeys, 'changes'].map(key => passportArea(passport, key)).join('') + '</div>') +
    panel('related', '<div id="relation-list" class="tight">' + (passport.relations || []).map(item => relationEditor(item, candidates)).join('') +
      '</div>' + (candidates.length ? '<div>' + customButton('addRelation', 'add-relation') + '</div>' :
        '<p class="muted">' + tr('relationHelp') + '</p>')) +
    panel('files', '<div id="link-list" class="tight">' + (passport.links || []).map(linkEditor).join('') +
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
  const initial = { domains: Object.hasOwn(domains, params.get('domain')) ? [params.get('domain')] : [] };
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
  main.setAttribute('aria-busy', 'true');
  let result;
  try {
    switch (route) {
      case '': result = home(); break;
      case 'guide': result = guide(); break;
      case 'catalog': result = await showCatalog(params); break;
      case 'compare': result = await compareView(params); break;
      case 'passport': result = await passportView(id, action === 'version' ? version : undefined); break;
      case 'edit':
      case 'new': result = await openEditor(id, params, routeToken); break;
      case 'login':
      case 'register': result = authPage(route, params); break;
      default: throw new Error('missing');
    }
  } catch (error) {
    result = layout(notice(errorMessage(error), true) + '<div>' + button('backCatalog', '#/catalog', true) + '</div>');
  }
  if (routeToken !== generation) return;
  main.innerHTML = result;
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
function encodeFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = () => reject(new Error('fileInvalid'));
    reader.readAsDataURL(file);
  });
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
      user = (await api(kind, 'POST', Object.fromEntries(data))).user;
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
      let payload = { message: data.get('message') };
      if (kind === 'file') {
        const file = data.get('file');
        if (!file?.size || file.size > 5 * 1024 * 1024) throw new Error('fileInvalid');
        payload = { name: file.name, content: await encodeFile(file) };
      }
      await api('passports/' + encodeURIComponent(id) + (kind === 'file' ? '/files' : '/comments'), 'POST', payload);
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
if (location.protocol !== 'file:' && ['/', '/index.html'].includes(location.pathname)) {
  try {
    user = (await api('session', 'GET', undefined, AbortSignal.timeout(4500))).user;
  } catch {
    flash = 'failed';
  }
  await render();
}
