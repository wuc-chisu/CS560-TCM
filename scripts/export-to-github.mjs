import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const gitDir = path.join(projectRoot, '.git');

if (!existsSync(gitDir)) {
  console.error('This project is not a Git repository.');
  process.exit(1);
}

try {
  execSync('git status --short', { cwd: projectRoot, stdio: 'pipe' });
  execSync('git add .', { cwd: projectRoot, stdio: 'inherit' });
  execSync('git commit -m "Backup export"', { cwd: projectRoot, stdio: 'inherit' });
  execSync('git push', { cwd: projectRoot, stdio: 'inherit' });
  console.log('Exported to GitHub successfully.');
} catch (error) {
  console.error('GitHub export failed.');
  if (error instanceof Error && 'stderr' in error) {
    console.error(error.stderr?.toString?.() || error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
}
