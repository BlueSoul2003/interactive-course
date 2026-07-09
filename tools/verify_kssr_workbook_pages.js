const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const EXPECTED_WORKBOOKS = [
  {
    label: 'Primary 3',
    grade: 3,
    rootParts: ['_drafts', 'kssr_english_workbooks', 'primary3', 'generated'],
  },
  {
    label: 'Primary 6',
    grade: 6,
    rootParts: ['_drafts', 'kssr_english_workbooks', 'primary6', 'generated'],
  },
];
const EXPECTED_UNITS = Array.from({ length: 10 }, (_, index) => `Unit${index + 1}`);
const FORBIDDEN_MARKERS = ['TODO', 'TBD', 'PLACEHOLDER'];

function walkHtml(dir) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }))
    .flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walkHtml(full);
      return entry.name === 'index.html' ? [full] : [];
    });
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return match ? match[1] : '';
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }

  return [...duplicates].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));
}

function pageContext(file, root) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const parts = relative.split('/');
  const primaryPart = parts.find((part) => /^primary[36]$/.test(part));
  const unitPart = parts.find((part) => /^Unit\d+$/.test(part));

  return {
    relative,
    grade: primaryPart ? Number(primaryPart.replace('primary', '')) : null,
    unit: unitPart ? Number(unitPart.replace('Unit', '')) : null,
  };
}

function assertPage(condition, errors, fileLabel, message) {
  if (!condition) errors.push(`${fileLabel}: ${message}`);
}

function verifyPage(file, root) {
  const html = fs.readFileSync(file, 'utf8');
  const { relative, grade, unit } = pageContext(file, root);
  const errors = [];

  assertPage(
    /<script\b[^>]*\bsrc="[^"]*js\/navigation\.js\?v=1\.0\.0"/.test(html),
    errors,
    relative,
    'missing navigation.js?v=1.0.0 script reference',
  );
  assertPage(
    /<script\b[^>]*\bsrc="[^"]*js\/progress-tracker\.js"/.test(html),
    errors,
    relative,
    'missing progress-tracker.js script reference',
  );

  const moduleId = getAttribute(html, 'data-module-id');
  const expectedModuleId = grade && unit ? `kssr-p${grade}-en-unit${unit}` : '';
  assertPage(
    /^kssr-p[36]-en-unit(?:[1-9]|10)$/.test(moduleId),
    errors,
    relative,
    `invalid data-module-id "${moduleId || '<missing>'}"`,
  );
  if (expectedModuleId) {
    assertPage(
      moduleId === expectedModuleId,
      errors,
      relative,
      `data-module-id "${moduleId}" does not match ${expectedModuleId}`,
    );
  }

  const questionCards = [
    ...html.matchAll(/<article\b(?=[^>]*\bclass="[^"]*\bquestion-card\b[^"]*")[^>]*>/g),
  ].map((match) => match[0]);
  assertPage(questionCards.length > 0, errors, relative, 'has no question cards');

  const questionIds = [];
  questionCards.forEach((card, index) => {
    const cardLabel = `question card ${index + 1}`;
    const questionId = getAttribute(card, 'data-question-id');
    const questionType = getAttribute(card, 'data-question-type');
    const sourcePage = getAttribute(card, 'data-source-page');

    questionIds.push(questionId);
    assertPage(
      /^unit-\d+-p\d{3}-\d{2}$/.test(questionId),
      errors,
      relative,
      `${cardLabel} has invalid data-question-id "${questionId || '<missing>'}"`,
    );
    assertPage(
      /^[a-z]+(?:_[a-z]+)*$/.test(questionType),
      errors,
      relative,
      `${cardLabel} has invalid data-question-type "${questionType || '<missing>'}"`,
    );
    assertPage(
      /^[1-9]\d*$/.test(sourcePage),
      errors,
      relative,
      `${cardLabel} has invalid data-source-page "${sourcePage || '<missing>'}"`,
    );
  });

  const duplicateQuestionIds = findDuplicates(questionIds.filter(Boolean));
  assertPage(
    duplicateQuestionIds.length === 0,
    errors,
    relative,
    `duplicate data-question-id values: ${duplicateQuestionIds.join(', ')}`,
  );

  const htmlIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateHtmlIds = findDuplicates(htmlIds);
  assertPage(
    duplicateHtmlIds.length === 0,
    errors,
    relative,
    `duplicate HTML id values: ${duplicateHtmlIds.join(', ')}`,
  );

  const markerPattern = new RegExp(`\\b(?:${FORBIDDEN_MARKERS.join('|')})\\b`);
  const markerMatch = html.match(markerPattern);
  assertPage(
    !markerMatch,
    errors,
    relative,
    `contains forbidden generated marker ${markerMatch ? markerMatch[0] : ''}`,
  );

  assertPage(/id="progressBar"/.test(html), errors, relative, 'missing progressBar hook');
  assertPage(/id="progressStatus"/.test(html), errors, relative, 'missing progressStatus hook');
  assertPage(
    /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/.test(html),
    errors,
    relative,
    'missing reduced-motion CSS',
  );

  return { errors, questionCount: questionCards.length };
}

function verifyWorkbookPages(options = {}) {
  const root = options.root || REPO_ROOT;
  const errors = [];
  const files = [];

  for (const workbook of EXPECTED_WORKBOOKS) {
    const generatedRoot = path.join(root, ...workbook.rootParts);
    const existingFiles = walkHtml(generatedRoot);
    files.push(...existingFiles);

    for (const unitName of EXPECTED_UNITS) {
      const expectedFile = path.join(generatedRoot, unitName, 'index.html');
      if (!fs.existsSync(expectedFile)) {
        errors.push(`${workbook.label}: missing generated page ${unitName}/index.html`);
      }
    }
  }

  if (files.length === 0) {
    errors.push('No generated workbook pages found');
  }

  let questionCount = 0;
  for (const file of files.sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))) {
    const result = verifyPage(file, root);
    errors.push(...result.errors);
    questionCount += result.questionCount;
  }

  if (errors.length > 0) {
    const error = new Error(`FAIL verify_kssr_workbook_pages errors=${errors.length}\n${errors.join('\n')}`);
    error.errors = errors;
    throw error;
  }

  return { fileCount: files.length, questionCount };
}

function main() {
  try {
    const result = verifyWorkbookPages();
    console.log(
      `PASS verify_kssr_workbook_pages files=${result.fileCount} questions=${result.questionCount}`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  verifyWorkbookPages,
  verifyPage,
  walkHtml,
};
