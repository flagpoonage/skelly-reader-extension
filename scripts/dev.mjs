import esbuild from 'esbuild';
import path from 'path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const target = process.argv
  .find((a) => a.startsWith('--target='))
  ?.split('--target=')[1];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const __rootdir = path.join(__dirname, '../');
const __builddir = path.join(__rootdir, './dist');
const __sourcedir = path.join(__rootdir, './src');

execSync(`mkdir -p ${__builddir} && rm -rf ${path.join(__builddir, '/*')}`);
execSync(`cp -rf ${path.join(__rootdir, './icons/*')} ${__builddir}`);

const manifest_data = await fs.readFile(
  path.join(__rootdir, 'manifest.json'),
  'utf-8',
);

const package_data = await fs.readFile(
  path.join(__rootdir, 'package.json'),
  'utf-8',
);

const manifest_json = JSON.parse(manifest_data);
const package_json = JSON.parse(package_data);

manifest_json.version = package_json.version;
manifest_json.name = package_json.displayName;
manifest_json.author = package_json.author;
manifest_json.description = package_json.description;

if (target === 'firefox') {
  manifest_json.background.scripts = [manifest_json.background.service_worker];
  delete manifest_json.background.service_worker;
}

await fs.writeFile(
  path.join(__builddir, 'manifest.json'),
  JSON.stringify(manifest_json, null, 2),
  'utf-8',
);

function getHtmlPages() {
  return [
    'popup/popup.html',
    'app/app.html',
    'reader/reader.html',
    'reader/reader-sandbox.html',
    'crypto/crypto.html',
  ].map((a) => path.join(__sourcedir, a));
}

execSync(`cp ${getHtmlPages().join(' ')} ${__builddir}`);

execSync(
  `cp -rf ${path.join(__sourcedir, './themes')} ${path.join(
    __builddir,
    './themes',
  )}`,
);

const ctx = await esbuild.context({
  entryPoints: [
    path.join(__sourcedir, './service-worker.ts'),
    path.join(__sourcedir, './popup.tsx'),
    path.join(__sourcedir, './app.tsx'),
    path.join(__sourcedir, './crypto.tsx'),
    path.join(__sourcedir, './reader.tsx'),
    path.join(__sourcedir, './reader-sandbox.tsx'),
    path.join(__sourcedir, './injected-scripts/links.ts'),
  ],
  sourcemap: 'inline',
  outdir: __builddir,
  format: 'esm',
  platform: 'browser',
  bundle: true,
});

ctx.watch();
