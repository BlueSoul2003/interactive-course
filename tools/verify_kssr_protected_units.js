const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function verifyProtectedUnits(root = path.resolve(__dirname, '..')) {
  const manifestPath = path.join(__dirname, 'fixtures', 'kssr-protected-unit-hashes.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const errors = [];

  for (const [relative, expected] of Object.entries(manifest)) {
    const file = path.join(root, ...relative.split('/'));
    if (!fs.existsSync(file)) {
      errors.push(`${relative}: missing`);
      continue;
    }

    const actual = sha256(file);
    if (actual !== expected) errors.push(`${relative}: changed (${actual})`);
  }

  if (errors.length > 0) {
    throw new Error(`Protected KSSR unit verification failed:\n${errors.join('\n')}`);
  }

  return { fileCount: Object.keys(manifest).length };
}

function main() {
  try {
    const result = verifyProtectedUnits();
    console.log(`PASS verify_kssr_protected_units files=${result.fileCount}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) main();

module.exports = { sha256, verifyProtectedUnits };
