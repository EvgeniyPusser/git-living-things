import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.89.0/+esm';
import { architectureFields, attachmentCategories, claimFields, domains, passportFields, properties } from './taxonomy.js';

const client = createClient('https://pyqqnypzlhcryvjkkoaf.supabase.co', 'sb_publishable_XbU-9OeNFKnqHDbyZhBU6Q_GA7SogQ3', {
  auth: { flowType: 'pkce' }
});
const bucket = client.storage.from('lt-passport-files');
const uuid = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
const errors = {
  invalid_credentials: 'loginFailed', user_already_exists: 'registered', email_exists: 'registered',
  email_not_confirmed: 'cloudConfirmEmail', email_address_not_authorized: 'cloudEmailUnavailable',
  over_request_rate_limit: 'rate', over_email_send_rate_limit: 'rate', validation_failed: 'credentials'
};

function unwrap({ data, error }) {
  if (error) throw new Error(errors[error.code] || (error.code === 'PGRST116' ? 'missing' : error.message));
  return data;
}
const userInfo = user => user ? { id: user.id, name: user.user_metadata?.name || user.email } : null;
const clean = (value, max = 4000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const fields = (input, schema) => Object.fromEntries(Object.keys(schema).map(key => [key, clean(input?.[key])]));
const match = (value, by) => !by || value === by;

function passport(row, userId) {
  const { id, owner, status, visibility, version, updated, data } = row;
  return { ...data, id, status, visibility, version, updated, editable: owner === userId,
    claims: Array.isArray(data.claims) ? data.claims : [], links: Array.isArray(data.links) ? data.links : [],
    relations: [], details: data.details || {}, domains: data.domains || [] };
}

async function account() {
  return userInfo(unwrap(await client.auth.getSession()).session?.user);
}

async function authenticate(kind, values) {
  const credentials = { email: clean(values.email, 254), password: values.password };
  if (kind === 'login') return { user: userInfo(unwrap(await client.auth.signInWithPassword(credentials)).user) };
  const redirect = new URL(location.pathname, location.origin);
  if (values.next) redirect.searchParams.set('lt-next', values.next);
  const data = unwrap(await client.auth.signUp({ ...credentials, options: {
    data: { name: clean(values.name, 120) }, emailRedirectTo: redirect.href
  } }));
  return { user: userInfo(data.session?.user), confirmationRequired: !data.session };
}

async function listPassports(params, signal) {
  const ids = (params.get('ids') || '').split(',').filter(id => uuid.test(id)).slice(0, 4);
  if (params.has('ids') && !ids.length) return [];
  let query = client.from('lt_passports').select('id,status,visibility,version,updated,data').order('updated', { ascending: false })
    .order('id');
  if (ids.length) query = query.in('id', ids);
  if (signal) query = query.abortSignal(signal);
  const rows = [];
  const pageSize = 250;
  for (let offset = 0; ; offset += pageSize) {
    const page = unwrap(await query.range(offset, offset + pageSize - 1));
    rows.push(...page);
    if (page.length < pageSize || ids.length) break;
  }
  const words = clean(params.get('q'), 200).toLowerCase().split(/\s+/).filter(Boolean);
  const person = clean(params.get('person'), 200).toLowerCase();
  const domain = params.get('domain');
  const property = params.get('property');
  const evidence = params.get('evidence');
  return rows.map(row => passport(row)).filter(item => {
    const people = [item.author, item.organization].join(' ').toLowerCase();
    const haystack = [item.id, item.title, item.description, item.composition, item.characteristics, item.interfaces, people,
      ...Object.keys(architectureFields).map(key => item[key]), ...Object.values(item.details).flatMap(value => Object.values(value || {})),
      ...item.claims.flatMap(claim => [...(properties[claim.property] || []), claim.mechanism, claim.effect])].join(' ').toLowerCase();
    return (!domain || item.domains.includes(domain)) && words.every(word => haystack.includes(word)) &&
      (!person || people.includes(person)) && ['type', 'level', 'stage'].every(key => match(item[key], params.get(key))) &&
      ((!property && !evidence) || item.claims.some(claim => match(claim.property, property) && match(claim.evidence, evidence)));
  });
}

async function loadPassport(id, version) {
  const user = await account();
  if (version) {
    const row = unwrap(await client.from('lt_versions').select('*').eq('passport', id).eq('version', version).single());
    return passport({ ...row, id }, user?.id);
  }
  const [row, links, versions, comments, fileRows] = (await Promise.all([
    client.from('lt_passports').select('*').eq('id', id).single(),
    client.from('lt_relations').select('*').or('source.eq.' + id + ',target.eq.' + id),
    client.from('lt_versions').select('version,updated,changes:data->>changes').eq('passport', id).order('version', { ascending: false }),
    client.from('lt_comments').select('name,message,created').eq('passport', id).order('created'),
    client.from('lt_files').select('id,name,category,revision,preview,size').eq('passport', id).eq('ready', true).order('created')
  ])).map(unwrap);
  const current = passport(row, user?.id);
  const linked = links.map(link => ({ target: link.source === id ? link.target : link.source,
    type: link.type, note: link.note, incoming: link.source !== id }));
  const targets = [...new Set(linked.map(item => item.target))];
  const titles = targets.length ? unwrap(await client.from('lt_passports').select('id,title:data->>title').in('id', targets)) : [];
  const lookup = new Map(titles.map(item => [item.id, item.title]));
  const related = linked.filter(item => lookup.has(item.target)).map(item => ({ ...item, title: lookup.get(item.target) }));
  current.relations = related.filter(item => !item.incoming).map(({ target, type, note }) => ({ target, type, note }));
  const files = fileRows;
  const cover = files.find(file => file.preview && file.category === 'image');
  if (cover) {
    const preview = await bucket.createSignedUrl(id + '/' + cover.id, 60);
    cover.previewURL = preview.data?.signedUrl;
  }
  return { passport: current, related, versions, comments, files };
}

async function savePassport(values) {
  const selected = [...new Set(values.domains)].filter(key => Object.hasOwn(domains, key));
  const details = Object.fromEntries(selected.map(key => [key, fields(values.details?.[key], domains[key].fields)]));
  const claims = values.claims.map(claim => ({ ...fields(claim, claimFields), property: claim.property, evidence: claim.evidence }));
  const links = values.links.filter(link => clean(link.url) || clean(link.title)).map(link => {
    let url;
    try { url = new URL(link.url); } catch { throw new Error('invalidLink'); }
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('invalidLink');
    return { title: clean(link.title, 200), url: url.href };
  });
  const payload = { ...fields(values, passportFields), id: values.id || '', version: values.version,
    title: clean(values.title, 200), status: values.status, visibility: values.visibility,
    domains: selected, type: values.type, level: values.level, stage: values.stage, details, claims, links,
    relations: values.relations.filter(item => item.type || item.target || clean(item.note)) };
  return { id: unwrap(await client.rpc('lt_save_passport', { payload })) };
}

async function previewType(file) {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const matches = (bytes, offset = 0) => bytes.every((byte, i) => head[offset + i] === byte);
  if (matches([137,80,78,71,13,10,26,10])) return 'image/png';
  if (matches([255,216,255])) return 'image/jpeg';
  if (matches([82,73,70,70]) && matches([87,69,66,80], 8)) return 'image/webp';
  return null;
}

export async function uploadCloudFile(passportId, file, form) {
  const category = form.get('category') || 'other';
  if (!Object.hasOwn(attachmentCategories, category)) throw new Error('fileInvalid');
  const preview = category === 'image' ? await previewType(file) : null;
  const fileId = unwrap(await client.rpc('lt_begin_file', { passport_id: passportId, filename: file.name,
    file_category: category, file_revision: form.get('revision') || '', byte_count: file.size, preview_type: preview }));
  const ids = { passport_id: passportId, file_id: fileId };
  const path = passportId + '/' + fileId;
  try {
    unwrap(await bucket.upload(path, file, { contentType: preview || 'application/octet-stream' }));
    unwrap(await client.rpc('lt_finish_file', ids));
  } catch (error) {
    await bucket.remove([path]).catch(() => {});
    await client.rpc('lt_cancel_file', ids);
    throw error;
  }
}

export async function downloadCloudFile(passportId, fileId, filename) {
  const { signedUrl } = unwrap(await bucket.createSignedUrl(passportId + '/' + fileId, 60, { download: filename }));
  return signedUrl;
}

export async function cloudApi(path, method = 'GET', values, signal) {
  const [route, search] = path.split('?');
  const [resource, id, section, version] = route.split('/');
  if (resource === 'research') return [];
  if (resource === 'session') return { user: await account() };
  if (resource === 'register' || resource === 'login') return authenticate(resource, values);
  if (resource === 'logout') {
    unwrap(await client.auth.signOut({ scope: 'local' }));
    return { user: null };
  }
  if (resource !== 'passports' || (id && !uuid.test(id))) throw new Error('missing');
  if (section === 'comments' && method === 'POST') {
    unwrap(await client.from('lt_comments').insert({ passport: id, message: clean(values.message) }));
    return { saved: true };
  }
  if ((method === 'POST' || method === 'PUT') && !section) return savePassport(values);
  if (method === 'GET' && id) return loadPassport(id, section === 'versions' ? version : null);
  if (method === 'GET') return listPassports(new URLSearchParams(search), signal);
  throw new Error('missing');
}
