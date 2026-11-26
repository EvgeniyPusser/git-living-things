import { createServer } from 'node:http';
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { createReadStream, mkdirSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { domains, levels, types, properties, evidence, stages, relations, passportFields, claimFields, architectureFields,
  attachmentCategories, attachmentLimits } from '../taxonomy.js';
import { researchFiles } from './research-files.mjs';
import { examples, exampleImagePath } from '../examples.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const research = researchFiles(root);
const location = process.env.LIVING_THINGS_DB || resolve(root, 'var/portal.sqlite');
if (location !== ':memory:') mkdirSync(dirname(resolve(location)), { recursive: true });
const db = new DatabaseSync(location);
db.exec(
  'PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;' +
  'CREATE TABLE IF NOT EXISTS accounts (id TEXT PRIMARY KEY, email TEXT UNIQUE, name TEXT, password TEXT);' +
  'CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, account TEXT REFERENCES accounts(id), expires INTEGER);' +
  'CREATE TABLE IF NOT EXISTS passports (id TEXT PRIMARY KEY, owner TEXT REFERENCES accounts(id), visibility TEXT, status TEXT, version INTEGER, updated TEXT, data TEXT);' +
  'CREATE TABLE IF NOT EXISTS versions (passport TEXT REFERENCES passports(id), version INTEGER, updated TEXT, visibility TEXT, status TEXT, data TEXT, PRIMARY KEY(passport,version));' +
  'CREATE TABLE IF NOT EXISTS files (id TEXT PRIMARY KEY, passport TEXT REFERENCES passports(id), name TEXT, content BLOB);' +
  'CREATE TABLE IF NOT EXISTS attachment_metadata (file TEXT PRIMARY KEY REFERENCES files(id) ON DELETE CASCADE, category TEXT NOT NULL, revision TEXT NOT NULL, preview TEXT);' +
  'CREATE TABLE IF NOT EXISTS comments (id TEXT PRIMARY KEY, passport TEXT REFERENCES passports(id), author TEXT REFERENCES accounts(id), created TEXT, message TEXT);' +
  'CREATE INDEX IF NOT EXISTS passports_owner ON passports(owner);' +
  'CREATE INDEX IF NOT EXISTS files_passport ON files(passport);' +
  'CREATE INDEX IF NOT EXISTS comments_passport ON comments(passport);'
);

const sql = new Map();
function statement(query) {
  if (!sql.has(query)) sql.set(query, db.prepare(query));
  return sql.get(query);
}
const get = (query, ...args) => statement(query).get(...args);
const all = (query, ...args) => statement(query).all(...args);
const run = (query, ...args) => statement(query).run(...args);
const hashPassword = promisify(scrypt);
const digest = value => createHash('sha256').update(value).digest('hex');
const now = () => new Date().toISOString();
const origin = process.env.LIVING_THINGS_ORIGIN;
const secure = origin?.startsWith('https://') ? '; Secure' : '';
const uptimeCookie = 60 * 60 * 24 * 7;
const maxFile = attachmentLimits.fileMiB * 1024 * 1024;
const maxAttachments = attachmentLimits.passportMiB * 1024 * 1024;
const fileUploadPath = /^\/api\/passports\/[a-f0-9-]{36}\/files$/;
const delayWindow = 15 * 60 * 1000;
const attempts = new Map();

class RequestError extends Error {
  constructor(status, code) {
    super(code);
    this.status = status;
  }
}
function requireValue(condition, status, code) {
  if (!condition) throw new RequestError(status, code);
}
const clean = (value, max = 4000) => typeof value === 'string' ? value.trim().slice(0, max) : '';
const select = (object, key) => typeof key === 'string' && Object.hasOwn(object, key) ? key : '';
function fields(source, schema) {
  return Object.fromEntries(Object.keys(schema).map(key => [key, clean(source?.[key])]));
}
function array(value, max) {
  return Array.isArray(value) ? value.slice(0, max) : [];
}
function externalUrl(value) {
  try {
    const url = new URL(clean(value, 2000));
    if (['http:', 'https:'].includes(url.protocol) && !url.username && !url.password) return url.href;
  } catch {}
  return '';
}
function json(res, payload, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}
async function bytes(req, limit) {
  if (Number(req.headers['content-length']) > limit) {
    req.resume();
    throw new RequestError(413, 'large');
  }
  const chunks = [];
  let length = 0;
  for await (const chunk of req.iterator({ destroyOnReturn: false })) {
    length += chunk.length;
    if (length > limit) {
      req.resume();
      throw new RequestError(413, 'large');
    }
    chunks.push(chunk);
  }
  return Buffer.concat(chunks, length);
}
async function body(req) {
  requireValue(req.headers['content-type']?.split(';')[0] === 'application/json', 415, 'invalid');
  const contents = await bytes(req, 7.5 * 1024 * 1024);
  try {
    const value = JSON.parse(contents);
    if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  } catch {}
  throw new RequestError(400, 'invalid');
}
function imageType(content) {
  if (content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'image/png';
  if (content[0] === 255 && content[1] === 216 && content[2] === 255) return 'image/jpeg';
  if (content.toString('ascii', 0, 4) === 'RIFF' && content.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  return null;
}
async function saveAttachment(req, res, params, id, user, binary) {
  const input = binary ? Object.fromEntries(params) : await body(req);
  const filename = clean(input.name, 180).replace(/[\u0000-\u001f\u007f/\\]/g, '_').toWellFormed();
  requireValue(filename, 422, 'fileInvalid');
  const category = select(attachmentCategories, input.category) || 'other';
  const revision = clean(input.revision, 100);
  const content = binary ? await bytes(req, maxFile) :
    typeof input.content === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(input.content) ?
      Buffer.from(input.content, 'base64') : null;
  requireValue(content?.length && content.length <= maxFile, 422, 'fileInvalid');
  const file = randomUUID();
  const preview = category === 'image' ? imageType(content) : null;
  db.exec('BEGIN IMMEDIATE');
  try {
    requireOwner(readRecord(id, user), user);
    const total = get('SELECT coalesce(sum(length(content)),0) AS bytes FROM files WHERE passport=?', id).bytes;
    requireValue(total + content.length <= maxAttachments, 422, 'fileQuota');
    run('INSERT INTO files VALUES (?,?,?,?)', file, id, filename, content);
    run('INSERT INTO attachment_metadata VALUES (?,?,?,?)', file, category, revision, preview);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return json(res, { saved: true, id: file }, 201);
}
function sessionToken(req) {
  return req.headers.cookie?.match(/(?:^|;\s*)lt_session=([a-f0-9]{64})(?:;|$)/)?.[1] || '';
}
function session(req) {
  const token = sessionToken(req);
  return token && get('SELECT a.id,a.name,a.email FROM accounts a JOIN sessions s ON s.account=a.id WHERE s.token=? AND s.expires>?', digest(token), Date.now()) || null;
}
function login(req, res, user) {
  const token = randomBytes(32).toString('hex');
  const old = sessionToken(req);
  if (old) run('DELETE FROM sessions WHERE token=?', digest(old));
  run('DELETE FROM sessions WHERE expires<=?', Date.now());
  run('INSERT INTO sessions VALUES (?,?,?)', digest(token), user.id, Date.now() + uptimeCookie * 1000);
  res.setHeader('Set-Cookie', 'lt_session=' + token + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=' + uptimeCookie + secure);
  json(res, { user });
}
async function authenticate(req, res, path) {
  const time = Date.now();
  if (attempts.size > 1000) {
    for (const [ip, record] of attempts) if (record.until <= time) attempts.delete(ip);
  }
  const key = req.socket.remoteAddress;
  const last = attempts.get(key);
  const record = last && last.until > time ? last : { count: 0, until: time + delayWindow };
  requireValue(record.count < 30, 429, 'rate');
  attempts.set(key, record);
  record.count += 1;
  const data = await body(req);
  const email = clean(data.email, 254).toLowerCase();
  const password = typeof data.password === 'string' ? data.password : '';
  requireValue(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && password.length >= 10 && password.length <= 256, 400, 'credentials');
  if (path === '/api/register') {
    const name = clean(data.name, 120);
    requireValue(name, 400, 'invalid');
    const salt = randomBytes(16).toString('hex');
    const secret = (await hashPassword(password, salt, 64)).toString('hex');
    const id = randomUUID();
    const result = run('INSERT INTO accounts VALUES (?,?,?,?) ON CONFLICT(email) DO NOTHING', id, email, name, salt + ':' + secret);
    requireValue(result.changes, 409, 'registered');
    return login(req, res, { id, email, name });
  }
  const account = get('SELECT * FROM accounts WHERE email=?', email);
  const [salt, secret] = account?.password.split(':') || ['invalid-account', '00'.repeat(64)];
  const actual = await hashPassword(password, salt, 64);
  requireValue(account && timingSafeEqual(actual, Buffer.from(secret, 'hex')), 401, 'loginFailed');
  return login(req, res, { id: account.id, name: account.name, email });
}

const publicRecord = row => row.visibility === 'public' && row.status === 'published';
const readable = (row, user) => row && (row.owner === user?.id || publicRecord(row));
const record = id => get('SELECT * FROM passports WHERE id=?', id);
const visible = user => all("SELECT * FROM passports WHERE (visibility='public' AND status='published') OR owner=? ORDER BY updated DESC", user?.id ?? '');
const flatten = (row, user) => ({
  ...JSON.parse(row.data), id: row.id, updated: row.updated, version: row.version,
  visibility: row.visibility, status: row.status, editable: row.owner === user?.id
});
function readRecord(id, user) {
  const row = record(id);
  requireValue(readable(row, user), 404, 'missing');
  return row;
}
function requireOwner(row, user) {
  requireValue(row.owner === user?.id, 403, 'forbidden');
}
function filteredRelations(passport, user) {
  return passport.relations.filter(link => readable(record(link.target), user));
}
function normalize(input, user, current) {
  requireValue(['draft', 'published'].includes(input.status) && ['public', 'private'].includes(input.visibility), 400, 'invalid');
  const area = [...new Set(array(input.domains, 20).filter(key => select(domains, key)))];
  const details = {};
  for (const key of area) details[key] = fields(input.details?.[key], domains[key].fields);
  const passport = {
    title: clean(input.title, 200),
    ...fields(input, passportFields),
    domains: area,
    type: select(types, input.type),
    level: select(levels, input.level),
    stage: select(stages, input.stage),
    details,
    claims: array(input.claims, 20).map(item => ({
      property: select(properties, item?.property),
      evidence: select(evidence, item?.evidence),
      ...fields(item, claimFields)
    })),
    relations: array(input.relations, 50).map(item => ({
      type: select(relations, item?.type), target: clean(item?.target, 36), note: clean(item?.note, 2000)
    })).filter(item => item.type || item.target || item.note),
    links: array(input.links, 30).map(item => ({ title: clean(item?.title, 200), url: clean(item?.url, 2000) }))
      .filter(item => item.title || item.url)
  };
  requireValue(passport.title, 422, 'titleRequired');
  for (const link of passport.links) {
    link.url = externalUrl(link.url);
    requireValue(link.url, 422, 'invalidLink');
  }
  const available = new Set();
  for (const item of passport.relations) {
    const key = item.type + ':' + item.target;
    requireValue(item.type && item.target && item.target !== current && readable(record(item.target), user) && !available.has(key), 422, 'invalidRelation');
    available.add(key);
  }
  if (input.status === 'published') {
    requireValue(passport.description && passport.author && area.length && passport.type && passport.level && passport.stage, 422, 'publicationFields');
    requireValue(passport.claims.length && passport.claims.every(item =>
      item.property && item.evidence && item.mechanism && item.effect && item.limits &&
      (passport.stage === 'concept' || item.feedback) &&
      (item.evidence === 'author' || item.proof) &&
      (passport.level === 'whole' || item.role)), 422, 'publicationClaims');
  }
  return passport;
}
function savePassport(input, user, existing) {
  const passport = normalize(input, user, existing?.id);
  const id = existing?.id || randomUUID();
  const updated = now();
  const version = (existing?.version || 0) + 1;
  const data = JSON.stringify(passport);
  db.exec('BEGIN IMMEDIATE');
  try {
    if (existing) {
      requireValue(input.version === existing.version, 409, 'stale');
      const result = run('UPDATE passports SET visibility=?,status=?,version=?,updated=?,data=? WHERE id=? AND version=?',
        input.visibility, input.status, version, updated, data, id, existing.version);
      requireValue(result.changes, 409, 'stale');
    } else {
      run('INSERT INTO passports VALUES (?,?,?,?,?,?,?)', id, user.id, input.visibility, input.status, version, updated, data);
    }
    run('INSERT INTO versions VALUES (?,?,?,?,?,?)', id, version, updated, input.visibility, input.status, data);
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
  return id;
}
function detail(row, user) {
  const passport = flatten(row, user);
  passport.relations = filteredRelations(passport, user);
  const outgoing = passport.relations.map(item => ({ ...item, title: JSON.parse(record(item.target).data).title }));
  const incoming = visible(user).flatMap(candidate => {
    if (candidate.id === row.id) return [];
    const data = JSON.parse(candidate.data);
    return data.relations.filter(item => item.target === row.id)
      .map(item => ({ ...item, target: candidate.id, title: data.title, incoming: true }));
  });
  return {
    passport,
    related: [...outgoing, ...incoming],
    files: all("SELECT f.id,f.name,length(f.content) AS size,coalesce(m.category,'other') AS category,m.revision,m.preview " +
      'FROM files f LEFT JOIN attachment_metadata m ON m.file=f.id WHERE f.passport=? ORDER BY f.rowid', row.id),
    comments: all('SELECT c.created,c.message,a.name FROM comments c JOIN accounts a ON c.author=a.id WHERE c.passport=? ORDER BY c.rowid', row.id),
    versions: all('SELECT version,updated,visibility,status,data FROM versions WHERE passport=? ORDER BY version DESC', row.id)
      .filter(item => passport.editable || publicRecord(item))
      .map(item => ({ version: item.version, updated: item.updated, changes: JSON.parse(item.data).changes }))
  };
}

function catalog(params, user) {
  const words = clean(params.get('q'), 200).toLowerCase().split(/\s+/).filter(Boolean);
  const people = clean(params.get('person'), 200).toLowerCase();
  const domain = params.get('domain');
  const property = params.get('property');
  const confirmation = params.get('evidence');
  const ids = params.get('ids')?.split(',').slice(0, 4);
  return visible(user).map(row => flatten(row, user)).filter(item => {
    const haystack = [item.id, item.title, item.description, item.author, item.organization, item.composition, item.characteristics,
      item.interfaces, ...Object.keys(architectureFields).map(key => item[key]), ...Object.values(item.details).flatMap(Object.values),
      ...item.claims.flatMap(claim => [...(properties[claim.property] || []), claim.mechanism, claim.effect])].join(' ').toLowerCase();
    return (!ids || ids.includes(item.id)) && (!domain || item.domains.includes(domain)) &&
      ['level', 'type', 'stage'].every(key => !params.get(key) || params.get(key) === item[key]) &&
      (!property && !confirmation || item.claims.some(claim =>
        (!property || claim.property === property) && (!confirmation || claim.evidence === confirmation))) &&
      (!people || [item.author, item.organization].join(' ').toLowerCase().includes(people)) &&
      words.every(word => haystack.includes(word));
  }).map(({ id, title, description, author, organization, domains, level, type, stage, status, visibility, updated, version, claims }) =>
    ({ id, title, description, author, organization, domains, level, type, stage, status, visibility, updated, version,
      claims: claims.map(({ property, evidence }) => ({ property, evidence })) }));
}

async function api(req, res, url) {
  const { pathname: path, searchParams } = url;
  const method = req.method;
  const mime = req.headers['content-type']?.split(';')[0];
  const binary = method === 'POST' && mime === 'application/octet-stream' && fileUploadPath.test(path);
  if (method !== 'GET') {
    requireValue(['POST', 'PUT'].includes(method), 405, 'invalid');
    const expected = origin || ('http://' + req.headers.host);
    requireValue(!req.headers.origin || req.headers.origin === expected, 403, 'forbidden');
    requireValue(mime === 'application/json' || binary, 415, 'invalid');
  }
  if (method === 'POST' && ['/api/register', '/api/login'].includes(path)) return authenticate(req, res, path);
  const user = session(req);
  if (method === 'POST' && path === '/api/logout') {
    const token = sessionToken(req);
    if (token) run('DELETE FROM sessions WHERE token=?', digest(token));
    res.setHeader('Set-Cookie', 'lt_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0' + secure);
    return json(res, { user: null });
  }
  if (method === 'GET' && path === '/api/session') return json(res, { user });
  if (method === 'GET' && path === '/api/research') return json(res, research.available(req));
  if (method === 'GET' && path === '/api/passports') return json(res, catalog(searchParams, user));
  if (method !== 'GET') requireValue(user, 401, 'signIn');
  if (method === 'POST' && path === '/api/passports') {
    return json(res, { id: savePassport(await body(req), user) }, 201);
  }
  const match = /^\/api\/passports\/([a-f0-9-]{36})(?:\/(files|comments|versions)(?:\/([a-f0-9-]+))?)?$/.exec(path);
  requireValue(match, 404, 'missing');
  const [, id, section, itemId] = match;
  const row = readRecord(id, user);
  if (method === 'GET' && !section) return json(res, detail(row, user));
  if (method === 'GET' && section === 'versions' && itemId) {
    const snapshot = get('SELECT * FROM versions WHERE passport=? AND version=?', id, Number(itemId));
    requireValue(snapshot && (row.owner === user?.id || publicRecord(snapshot)), 404, 'missing');
    const version = flatten({ ...row, ...snapshot }, user);
    version.relations = filteredRelations(version, user);
    return json(res, version);
  }
  if (method === 'GET' && section === 'files' && itemId) {
    const file = get('SELECT f.name,f.content,m.preview FROM files f LEFT JOIN attachment_metadata m ON m.file=f.id ' +
      'WHERE f.passport=? AND f.id=?', id, itemId);
    requireValue(file, 404, 'missing');
    if (searchParams.has('preview')) {
      requireValue(file.preview, 404, 'missing');
      res.writeHead(200, { 'Content-Type': file.preview, 'Cache-Control': 'no-store' });
      return res.end(file.content);
    }
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream', 'Cache-Control': 'no-store',
      'Content-Disposition': "attachment; filename*=UTF-8''" + encodeURIComponent(file.name).replace(/['()*]/g, char => '%' + char.charCodeAt(0).toString(16))
    });
    return res.end(file.content);
  }
  if (method === 'POST' && section === 'comments' && !itemId) {
    const message = clean((await body(req)).message);
    requireValue(message, 422, 'invalid');
    readRecord(id, user);
    run('INSERT INTO comments VALUES (?,?,?,?,?)', randomUUID(), id, user.id, now(), message);
    return json(res, { saved: true }, 201);
  }
  requireOwner(row, user);
  if (method === 'PUT' && !section) return json(res, { id: savePassport(await body(req), user, row) });
  if (method === 'POST' && section === 'files' && !itemId) {
    return saveAttachment(req, res, searchParams, id, user, binary);
  }
  throw new RequestError(404, 'missing');
}

const staticFiles = {
  '/': ['index.html', 'text/html'], '/index.html': ['index.html', 'text/html'],
  '/styles.css': ['styles.css', 'text/css'], '/app.js': ['app.js', 'text/javascript'],
  '/research.js': ['research.js', 'text/javascript'],
  '/examples.js': ['examples.js', 'text/javascript'],
  '/scripts/open-local.js': ['scripts/open-local.js', 'text/javascript'],
  '/taxonomy.js': ['taxonomy.js', 'text/javascript'], '/locale.js': ['locale.js', 'text/javascript'],
  '/buildings/urban-graph.html': ['buildings/urban-graph.html', 'text/html'],
  '/buildings/urban-graph.css': ['buildings/urban-graph.css', 'text/css'],
  '/buildings/styles.css': ['buildings/styles.css', 'text/css'],
  '/buildings/urban-model.js': ['buildings/urban-model.js', 'text/javascript'],
  '/buildings/urban-graph.js': ['buildings/urban-graph.js', 'text/javascript'],
  '/assets/intro/poster.jpg': ['assets/intro/poster.jpg', 'image/jpeg'],
  '/assets/intro/living-things-ru.mp4': ['assets/intro/living-things-ru.mp4', 'video/mp4'],
  '/assets/intro/living-things-en.mp4': ['assets/intro/living-things-en.mp4', 'video/mp4'],
  '/assets/intro/living-things-ru.vtt': ['assets/intro/living-things-ru.vtt', 'text/vtt'],
  '/assets/intro/living-things-en.vtt': ['assets/intro/living-things-en.vtt', 'text/vtt'],
  ...Object.fromEntries(Object.values(examples).map(example => {
    const path = exampleImagePath(example);
    return ['/' + path, [path, 'image/' + path.split('.').pop()]];
  }))
};
async function serveVideo(req, res, file) {
  const path = resolve(root, file);
  const { size } = await stat(path);
  const headers = { 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
  let start = 0;
  let end = size - 1;
  if (req.headers.range) {
    const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
    if (range?.[1]) {
      start = Number(range[1]);
      if (range[2]) end = Math.min(end, Number(range[2]));
    } else if (range?.[2]) {
      start = Math.max(0, size - Number(range[2]));
    }
    if (!range || (!range[1] && !range[2]) || start > end) {
      res.writeHead(416, { ...headers, 'Content-Range': 'bytes */' + size });
      return res.end();
    }
    headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + size;
  }
  headers['Content-Length'] = end - start + 1;
  res.writeHead(req.headers.range ? 206 : 200, headers);
  if (req.method === 'HEAD') return res.end();
  await pipeline(createReadStream(path, { start, end }), res);
}
const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; object-src 'none'");
  try {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/api/')) return await api(req, res, url);
    if (url.pathname.startsWith('/research/') && await research.serve(req, res, url.pathname)) return;
    const template = /^\/examples\/([a-z]+)\.csv$/.exec(url.pathname)?.[1];
    if (Object.hasOwn(examples, template) && examples[template].columns && ['GET', 'HEAD'].includes(req.method)) {
      res.writeHead(200, {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="' + template + '-data-template.csv"'
      });
      return res.end(req.method === 'HEAD' ? undefined : examples[template].columns.join(',') + '\r\n');
    }
    const file = Object.hasOwn(staticFiles, url.pathname) && staticFiles[url.pathname];
    requireValue(file && ['GET', 'HEAD'].includes(req.method), 404, 'missing');
    if (file[1] === 'video/mp4') return await serveVideo(req, res, file[0]);
    res.writeHead(200, { 'Content-Type': file[1] + '; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(req.method === 'HEAD' ? undefined : await readFile(resolve(root, file[0])));
  } catch (error) {
    if (!(error instanceof RequestError) && error.code !== 'ERR_STREAM_PREMATURE_CLOSE') console.error(error);
    if (!res.headersSent) json(res, { error: error instanceof RequestError ? error.message : 'server' }, error.status || 500);
    else res.end();
  }
});
const host = process.env.HOST || '127.0.0.1';
server.listen(Number(process.env.PORT || 4173), host, () => {
  console.log('Living Things: http://' + host + ':' + server.address().port);
});
