const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const scriptPath = path.join(repoRoot, 'tools', 'generate_pdf_catalog.py');

const candidates = [];

if (process.env.PYTHON) {
  candidates.push({ command: process.env.PYTHON, args: [scriptPath] });
}

if (process.platform === 'win32') {
  candidates.push({
    command: path.join(
      os.homedir(),
      '.cache',
      'codex-runtimes',
      'codex-primary-runtime',
      'dependencies',
      'python',
      'python.exe'
    ),
    args: [scriptPath],
  });
  candidates.push({ command: 'py', args: ['-3', scriptPath] });
  candidates.push({ command: 'python', args: [scriptPath] });
} else {
  candidates.push({ command: 'python3', args: [scriptPath] });
  candidates.push({ command: 'python', args: [scriptPath] });
}

let lastError = null;

for (const candidate of candidates) {
  if (path.isAbsolute(candidate.command) && !fs.existsSync(candidate.command)) {
    continue;
  }

  const result = spawnSync(candidate.command, candidate.args, {
    cwd: repoRoot,
    env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
    stdio: 'inherit',
  });

  if (result.error) {
    lastError = result.error;
    continue;
  }

  process.exit(result.status || 0);
}

console.error('Could not find a Python runtime to generate the PDF catalog.');
if (lastError) {
  console.error(lastError.message);
}
process.exit(1);
