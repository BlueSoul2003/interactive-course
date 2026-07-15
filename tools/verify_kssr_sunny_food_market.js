'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const file = path.join(
  __dirname,
  '..',
  'content',
  'KSSR_Syllabus',
  'Primary3',
  'English',
  'Unit6',
  'index.html',
);
const html = fs.readFileSync(file, 'utf8');
const emoji = /\p{Extended_Pictographic}/u;

assert.match(html, /<details class="settings-menu">/, 'Settings must use a disclosure');
assert.doesNotMatch(
  html,
  /<details class="settings-menu"[^>]*\sopen(?:\s|>)/,
  'Settings disclosure must be closed on first load',
);
assert.match(html, /class="settings-panel"/, 'Settings panel is missing');

for (const action of ['mute', 'previous', 'switch-profile', 'reset-view']) {
  assert.match(
    html,
    new RegExp(`class="settings-panel"[\\s\\S]*?data-action="${action}"`),
    `Settings panel is missing ${action}`,
  );
}
assert.match(
  html,
  /class="settings-panel"[\s\S]*?data-tutor-hold/,
  'Settings panel is missing the teacher hold control',
);
assert.match(
  html,
  /@media \(max-width: 820px\)[\s\S]*?\.settings-panel\s*{[^}]*width:min\(440px,calc\(100vw - 40px\)\)/,
  'Mobile settings panel must leave a safe viewport margin',
);
assert.match(
  html,
  /\.sr-only\s*{[^}]*position:absolute/,
  'Screen-reader-only spelling labels must not be visually duplicated',
);

for (const match of html.matchAll(/<button\b[^>]*\bdata-choice\b[^>]*>([\s\S]*?)<\/button>/g)) {
  const label = match[1].replace(/<[^>]+>/g, '');
  assert.equal(
    emoji.test(label),
    false,
    `Answer choice contains an emoji: ${label.trim()}`,
  );
}

assert.match(
  html,
  /data-visual-role="question-source"[^>]*aria-label="one apple"/,
  'Apple question-source visual is missing',
);
assert.match(
  html,
  /data-visual-role="question-source"[^>]*aria-label="oranges in one basket"/,
  'Orange question-source visual is missing',
);
assert.match(
  html,
  /data-visual-role="question-source"[^>]*aria-label="three bowls"/,
  'Bowl question-source visual is missing',
);
assert.doesNotMatch(
  html,
  /R I C E|B R E A D|C H I C K E N|placeholder="rice,/,
  'Spelling answers must not be printed before submission',
);

const streetFood = html.match(
  /<article[^>]*data-activity-id="unit-6-p049-01"[\s\S]*?<\/article>/,
)?.[0] || '';
const beforeFeedback = streetFood.split('<div data-feedback')[0];
assert.equal(
  beforeFeedback.includes('🍢'),
  false,
  'Satay emoji appears before the answer is checked',
);
assert.match(
  html,
  /\.question-card\[data-question-type="street_food_matching"\]\s+\[data-feedback\]\[data-type="success"\]::before/,
  'Satay reinforcement must be success-only',
);

console.log('PASS verify_kssr_sunny_food_market');
