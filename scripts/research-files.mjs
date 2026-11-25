import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const types = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.md': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.pdf': 'application/pdf',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
};

export function researchFiles(root) {
  const sibling = resolve(root, '..');
  const files = {
    '/research/car/population.md': resolve(sibling, 'living-car/results/population/RESULTS.md'),
    '/research/aircraft/README.md': resolve(sibling, 'living-aircraft/README.md'),
    '/research/aircraft/RESULTS.md': resolve(sibling, 'living-aircraft/results/stage1/RESULTS.md'),
    '/research/hospital/README.md': resolve(sibling, 'hospital-floor-prototype/README.md'),
    '/research/hospital/experiment.md': resolve(sibling, 'hospital-floor-prototype/docs/experiment.md'),
    '/research/v3/commentary.pdf': resolve(sibling, 'living-things-v3/output/pdf/living-things-v3-commentary.pdf'),
    '/research/regeneration/README.md': resolve(sibling, 'structural-regeneration/README.md'),
    '/research/regeneration/manuscript.docx': resolve(sibling, 'structural-regeneration/submission/Manuscript_JOBE_anonymised.docx')
  };
  const interior = [
    'index.html', 'style.css', 'translations.js', 'locale.js', 'engine.js', 'data.js', 'vendor/three.js',
    'app.js', 'README.md', 'article/JOURNAL_SELECTION.md', 'article/manuscript.html', 'article/manuscript.md',
    'article/figures/equation-aesthetic.png', 'article/figures/equation-clearance.png',
    'article/figures/equation-interaction.png', 'article/figures/equation-ridge.png', 'article/figures/verification.png'
  ];
  for (const file of interior) files['/research/interior/' + file] = resolve(sibling, 'interior-assessment', file);
  const archive = process.env.LIVING_THINGS_ARTICLE_DIR;
  if (archive) {
    files['/research/manuscripts/living-things.docx'] = resolve(archive,
      'Статья ОК2/Final/Living_Things_Full_Article_REVIEW_READY_FINAL.docx');
    files['/research/manuscripts/morphogenesis.pdf'] = resolve(archive,
      'Статья 3 Морфогенез/Новый вариант для Frontiers/Morphogenesis_Living_Building_Frontiers_FINAL_2026-10-28.pdf');
  }

  return {
    available(req) {
      return localRequest(req) ? Object.entries(files)
        .filter(([url, file]) => ['.html', '.md', '.docx', '.pdf'].includes(extname(url)) && existsSync(file))
        .map(([url]) => url) : [];
    },
    async serve(req, res, path) {
      if (!localRequest(req) || !Object.hasOwn(files, path) || !['GET', 'HEAD'].includes(req.method)) return false;
      let data;
      try {
        data = await readFile(files[path]);
      } catch (error) {
        if (error.code === 'ENOENT') return false;
        throw error;
      }
      const type = types[extname(path)];
      if (type.startsWith('text/html')) {
        res.setHeader('Content-Security-Policy',
          "default-src 'self'; style-src 'self' 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; object-src 'none'");
      }
      if (extname(path) === '.docx') {
        res.setHeader('Content-Disposition', 'attachment; filename="' + path.split('/').at(-1) + '"');
      }
      res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : data);
      return true;
    }
  };
}

function localRequest(req) {
  return !process.env.LIVING_THINGS_ORIGIN &&
    ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress) &&
    /^(?:127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/i.test(req.headers.host || '');
}
