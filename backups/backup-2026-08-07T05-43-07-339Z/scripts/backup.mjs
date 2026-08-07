import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const backupRoot = path.join(projectRoot, 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.join(backupRoot, `backup-${timestamp}`);

const skipDirs = new Set(['.git', 'node_modules', '.next', 'out', 'coverage', 'backups']);

function copyRecursive(sourcePath, targetPath) {
  const stats = statSync(sourcePath);

  if (stats.isDirectory()) {
    mkdirSync(targetPath, { recursive: true });
    for (const entry of readdirSync(sourcePath)) {
      if (skipDirs.has(entry)) continue;
      copyRecursive(path.join(sourcePath, entry), path.join(targetPath, entry));
    }
    return;
  }

  mkdirSync(path.dirname(targetPath), { recursive: true });
  copyFileSync(sourcePath, targetPath);
}

mkdirSync(backupDir, { recursive: true });

for (const entry of readdirSync(projectRoot)) {
  if (skipDirs.has(entry)) continue;
  copyRecursive(path.join(projectRoot, entry), path.join(backupDir, entry));
}

console.log(`Backup created at ${backupDir}`);
