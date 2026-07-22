import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';

const SOFT_LIMIT = 250;
const HARD_LIMIT = 400;
const ROOT = process.cwd();
const SKIPPED_DIRECTORIES = new Set(['dist', 'node_modules', '.git']);
const SOURCE_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.mjs',
  '.sql',
  '.ts',
  '.tsx',
]);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) {
        return SKIPPED_DIRECTORIES.has(entry.name) ? [] : collectFiles(path);
      }
      return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
    }),
  );
  return nested.flat();
}

function countCodeLines(source) {
  let inBlockComment = false;
  return source.split(/\r?\n/).reduce((count, originalLine) => {
    let line = originalLine.trim();
    if (!line) return count;

    if (inBlockComment) {
      const end = line.indexOf('*/');
      if (end === -1) return count;
      inBlockComment = false;
      line = line.slice(end + 2).trim();
    }

    while (line.startsWith('/*')) {
      const end = line.indexOf('*/', 2);
      if (end === -1) {
        inBlockComment = true;
        return count;
      }
      line = line.slice(end + 2).trim();
    }

    if (!line || line.startsWith('//')) return count;
    return count + 1;
  }, 0);
}

const results = await Promise.all(
  (await collectFiles(ROOT)).map(async (path) => ({
    path: relative(ROOT, path),
    lines: countCodeLines(await readFile(path, 'utf8')),
  })),
);
const overSoft = results.filter(({ lines }) => lines > SOFT_LIMIT);
const overHard = results.filter(({ lines }) => lines > HARD_LIMIT);

results
  .sort((left, right) => right.lines - left.lines)
  .forEach(({ path, lines }) => console.log(`${String(lines).padStart(3)}  ${path}`));

if (overSoft.length) {
  console.warn(`\n소프트 리미트(${SOFT_LIMIT}줄) 초과: ${overSoft.length}개 파일`);
}
if (overHard.length) {
  console.error(`하드 리미트(${HARD_LIMIT}줄) 초과: ${overHard.length}개 파일`);
  process.exitCode = 1;
}
