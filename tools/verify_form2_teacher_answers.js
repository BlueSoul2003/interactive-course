// Exercise the shipped HTML in a fresh browser over an ephemeral loopback server.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const papers = [
  ['UASA_2024', 59, 130],
  ['UASA_Pelangi', 60, 136],
];
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const file = path.resolve(root, '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
  res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'msedge', headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
    for (const [name, count, stepCount] of (process.env.PORTAL_ONLY ? [] : papers)) {
      const page = await context.newPage(); const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(`${base}/content/SPM_Syllabus/Form2/Science/${name}/english_chinese.html`);
      await page.waitForFunction(() => window.CLASSROOM);
      const original = await page.evaluate(() => JSON.stringify(CLASSROOM.questions.map(q => q.steps)));
      assert.equal(await page.evaluate(() => CLASSROOM.questions.length), count);
      let steps = 0;
      for (let i = 0; i < count; i++) {
        await page.evaluate(i => CLASSROOM.go(i), i);
        assert.equal(await page.locator('.edit-answer').count(), 0, 'hidden answers cannot be edited');
        const q = await page.evaluate(() => ({ section: CLASSROOM.questions[CLASSROOM.getIndex()].section, count: CLASSROOM.questions[CLASSROOM.getIndex()].steps.length }));
        await page.evaluate(() => CLASSROOM.questions[CLASSROOM.getIndex()].steps.forEach(() => CLASSROOM.reveal()));
        await page.waitForFunction(() => [...document.querySelectorAll('#paperImages img')].every(x => x.complete && x.naturalWidth));
        assert.equal(await page.locator('.edit-answer').count(), q.section === 'A' ? 0 : q.count);
        steps += q.count;
      }
      assert.equal(steps, stepCount);
      for (const section of ['B', 'C']) {
        const index = await page.evaluate(s => CLASSROOM.questions.findIndex(q => q.section === s), section);
        await page.evaluate(i => { CLASSROOM.go(i); CLASSROOM.reveal(); }, index);
        const sourceEn = await page.locator('.step-en').first().textContent();
        const sourceZh = await page.locator('.step-zh').first().textContent();
        await page.locator('.edit-answer').first().click();
        assert.equal(await page.locator('#editEn').inputValue(), sourceEn);
        await page.locator('#editEn').fill('Cancelled change'); await page.keyboard.press('Escape');
        assert.equal(await page.locator('.step-en').first().textContent(), sourceEn);
        await page.locator('.edit-answer').first().click();
        await page.locator('#editEn').fill('   '); await page.locator('#editForm [type=submit]').click();
        assert(await page.locator('#editDialog').isVisible());
        const short = `Short ${section} answer.\n<script>literal text</script>`;
        await page.locator('#editEn').fill(short); await page.locator('#editZh').fill('简短答案。');
        // Typing classroom shortcuts must not reveal or navigate while editing.
        await page.keyboard.press('Space'); await page.keyboard.press('Backspace');
        assert.equal(await page.evaluate(() => CLASSROOM.getIndex()), index);
        assert.equal(await page.evaluate(() => CLASSROOM.getRevealed()), 1);
        await page.locator('#editForm [type=submit]').click();
        assert.equal(await page.locator('.step-en').first().textContent(), short);
        assert.equal(await page.locator('#steps script').count(), 0);
        assert.equal(await page.locator('.teacher-edited').count(), 1);
        await page.reload(); await page.waitForFunction(() => window.CLASSROOM);
        assert.equal(await page.locator('#steps article').count(), 0);
        await page.locator('#reveal').click();
        assert.equal(await page.locator('.step-en').first().textContent(), short);
        await page.locator('#translation').click();
        await page.locator('.edit-answer').first().click();
        await page.locator('#editZh').fill('更短'); await page.locator('#editForm [type=submit]').click();
        assert.equal(await page.locator('.step-zh').first().isVisible(), false);
        await page.locator('#translation').click();
        await page.locator('#jump').click(); const downloadPromise = page.waitForEvent('download');
        await page.locator('#export').click(); const download = await downloadPromise;
        const stream = await download.createReadStream(); const chunks = [];
        for await (const chunk of stream) chunks.push(chunk);
        const exported = JSON.parse(Buffer.concat(chunks).toString());
        assert.equal(exported.records.length, count);
        assert(Object.values(exported.teacherAnswers).some(a => a.en === short));
        await page.locator('[data-close="mapDialog"]').click();
        await page.locator('.edit-answer').first().click();
        await page.locator('#originalDetails summary').click();
        assert.equal(await page.locator('#originalEn').textContent(), sourceEn);
        assert.equal(await page.locator('#originalZh').textContent(), sourceZh);
        if (section === 'C' && process.env.SCREENSHOT_DIR) {
          await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, name + '-editor.png') });
        }
        await page.locator('#restoreAnswer').click();
        assert.equal(await page.locator('.step-en').first().textContent(), sourceEn);
        assert.equal(await page.locator('.teacher-edited').count(), 0);
        await page.reload(); await page.waitForFunction(() => window.CLASSROOM); await page.locator('#reveal').click();
        assert.equal(await page.locator('.step-en').first().textContent(), sourceEn);
      }
      assert.equal(await page.evaluate(() => JSON.stringify(CLASSROOM.questions.map(q => q.steps))), original);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator('.edit-answer').first().click();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      assert(await page.locator('#editForm [type=submit]').isVisible());
      await page.locator('#cancelEdit').click();
      assert.deepEqual(errors, []);
      console.log(`${name}: ${count} screens / ${steps} steps; edit, cancel, reload, export, language, original restore and mobile passed.`);
      await page.close();
    }
    const page = await context.newPage();
    await page.goto(base + '/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof showLessons === 'function');
    await page.evaluate(() => showLessons('spm', 'spm-science'));
    assert.equal(await page.locator('#science-form2-cards a').count(), 2);
    assert.equal(await page.locator('#science-form3-cards a').count(), 4);
    assert(await page.locator('#science-form2-title').isVisible());
    assert(await page.locator('#science-form3-title').isVisible());
    for (const name of ['2024', 'pelangi']) assert.equal(await page.locator(`#science-form2-cards [data-module-id="spm-sci-f2-uasa-${name}"]`).getAttribute('data-bundle'), 'spm_form2');
    if (process.env.SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.SCREENSHOT_DIR, 'portal.png'), fullPage: true });
    console.log('Portal: two Form 2 cards separated from four Form 3 cards.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => server.close());
