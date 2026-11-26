// Saving and loading. Inside a portal passport (?portal=1 in an iframe) the portal stores the model
// as a passport attachment; the helper never sees credentials. Outside, files go to and from the computer.
// Messages: helper → portal {source:'living-house-model', type:'ready'|'save'|'open-request'};
// portal → helper {source:'living-things-portal', type:'model'|'saved'|'error'}. Same origin as the portal.
import { FORMAT, VERSION } from './graph.js';

const params = new URLSearchParams(location.search);
export const embedded = params.get('portal') === '1' && window.parent !== window;
export const readonly = embedded && params.get('readonly') === '1';
const origin = location.origin;

function wait(types, ms) {
  return new Promise((resolve, reject) => {
    const finish = (fn, value) => { clearTimeout(timer); window.removeEventListener('message', listen); fn(value); };
    const listen = event => {
      if (event.origin !== origin || event.source !== window.parent || event.data?.source !== 'living-things-portal') return;
      if (event.data.type === 'error') finish(reject, new Error(event.data.message || 'portalError'));
      else if (types.includes(event.data.type)) finish(resolve, event.data);
    };
    const timer = setTimeout(() => finish(reject, new Error('portalNoAnswer')), ms);
    window.addEventListener('message', listen);
  });
}
const send = message => window.parent.postMessage({ source: 'living-house-model', ...message }, origin);

// Portal answers "ready" with the passport's latest model, or with model null when there is none.
// Rejects with the portal's error or 'portalNoAnswer'; the helper stays locked until this settles.
export async function load() {
  if (!embedded) return null;
  const answer = wait(['model'], 30000).then(data => data.model ?? null);
  send({ type: 'ready', format: FORMAT, version: VERSION });
  return answer;
}

export const fileName = model => (model.meta?.name || 'living-house').replace(/[\\/:*?"<>|]+/g, '_').trim() + '.living-house.json';

export async function save(model) {
  if (embedded) {
    const answer = wait(['saved'], 20000);
    send({ type: 'save', model, filename: fileName(model) });
    return answer;
  }
  const url = URL.createObjectURL(new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName(model) });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function openFile(file) {
  return file.text().then(text => JSON.parse(text));
}
