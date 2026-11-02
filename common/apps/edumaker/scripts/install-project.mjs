import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
let command, args;
if (process.platform === 'win32') {
  if (!process.env.npm_execpath) throw new Error('Run through pnpm run install:ci.');
  command = process.execPath;
  args = [process.env.npm_execpath, 'install', '--frozen-lockfile', '--prefer-offline'];
} else {
  command = 'bash'; args = ['scripts/install-pnpm.sh'];
}
const result = spawnSync(command, args, { cwd: root, stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
