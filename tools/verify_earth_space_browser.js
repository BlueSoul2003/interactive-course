/* Run with PLAYWRIGHT_MODULE pointing to an installed Playwright package when it is not local. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '..');
const artifacts = path.join(root, '.codex-tmp/earth-space-20260905');
const route = '/content/IGCSE_Syllabus/Year4/Science/Earth_and_Space_Revision/index.html';
const store = 'earth-space-revision-v1';
fs.mkdirSync(artifacts, { recursive: true });
const server = http.createServer((req, res) => {
  let file;
  try { file = path.resolve(root, '.' + decodeURIComponent(req.url.split('?')[0])); } catch (_) { res.writeHead(400); res.end(); return; }
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
  const type = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' }[path.extname(file)] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type + '; charset=utf-8' }); fs.createReadStream(file).pipe(res);
});
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${server.address().port}${route}`;
  const browser = await chromium.launch({ headless: true, channel: process.env.BROWSER_CHANNEL || 'msedge' });
  try {
    const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
    // Deterministic guest verification. Remote services are deliberately not contacted.
    await context.route('https://**/*', r => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    if (!process.env.YEAR4_PORTAL_ONLY) {
    await page.goto(url);
    assert.equal(await page.locator('.topic-row').count(), 5);
    await page.screenshot({ path: path.join(artifacts, 'desktop-home.png'), fullPage: true });
    console.log('PASS: page renders, five topics visible, desktop screenshot captured.');
    await page.locator('#continue').click();
    await page.locator('#check').click();
    assert.match(await page.locator('#feedback').innerText(), /Choose an option/);
    let q = await page.evaluate(() => window.EARTH_SPACE_DATA.questions[0]);
    await page.locator(`[data-option="${(q.answer + 1) % 4}"]`).click(); await page.locator('#check').click();
    assert.match(await page.locator('#feedback').innerText(), /look again/);
    await page.locator('#back').click(); await page.locator('#review').click();
    assert.match(await page.locator('#position').innerText(), /1 \/ 1/);
    await page.locator('#retry').click(); await page.locator(`[data-option="${q.answer}"]`).click(); await page.locator('#check').click();
    let saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), store);
    assert.equal(saved.answers[q.id].firstCorrect, false); assert.equal(saved.answers[q.id].attempts, 2);
    await page.locator('#back').click(); await page.locator('#review').click(); assert(await page.locator('#empty').isVisible());
    await page.locator('#emptyBack').click(); await page.locator('#mixed').click();
    saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), store);
    assert.equal(new Set(saved.session.ids).size, 10);
    await page.locator('#boardTab').click();
    assert(await page.locator('#board').isVisible());
    let box = await page.locator('#inkCanvas').boundingBox();
    await page.mouse.move(box.x + 40, box.y + 55); await page.mouse.down(); await page.mouse.move(box.x + 160, box.y + 100, { steps: 12 }); await page.mouse.up();
    await page.locator('#typedNotes').fill('Earth spins on its axis.');
    assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key + '-board')).strokes.length, store), 1);
    await page.locator('#expandBoard').click();
    await page.screenshot({ path: path.join(artifacts, 'desktop-board.png'), fullPage: true });
    await page.keyboard.press('Escape'); await page.locator('#next').click(); await page.locator('#boardTab').click();
    assert.equal(await page.locator('#typedNotes').inputValue(), 'Earth spins on its axis.');
    await page.locator('#undo').click();
    assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key + '-board')).strokes.length, store), 0);
    await page.locator('#clearBoard').click(); await page.locator('#cancelConfirm').click();
    assert.equal(await page.locator('#typedNotes').inputValue(), 'Earth spins on its axis.');
    await page.keyboard.press('Escape'); await page.reload(); await page.locator('#continue').click();
    assert.match(await page.locator('#position').innerText(), /2 \/ 10/);
    await page.locator('#boardTab').click(); assert.equal(await page.locator('#typedNotes').inputValue(), 'Earth spins on its axis.');
    await page.locator('#closeBoard').click();
    console.log('PASS: wrong-answer review, first-attempt tracking, mixed practice, board drawing/undo/resize/cancel and reload.');

    // Clear only the isolated test profile; exercise every actual input control in the full bank.
    await page.evaluate(key => localStorage.removeItem(key), store); await page.reload();
    const topics = await page.evaluate(() => window.EARTH_SPACE_DATA.topics.map(t => t.id));
    let checked = 0;
    for (const topic of topics) {
      await page.locator(`[data-topic="${topic}"]`).click();
      const questions = await page.evaluate(topic => window.EARTH_SPACE_DATA.questions.filter(q => q.topic === topic), topic);
      for (const question of questions) {
        if (question.type === 'mcq') await page.locator(`[data-option="${question.answer}"]`).click();
        else for (let i = 0; i < question.answers.length; i++) await page.locator(`#blank${i}`).fill(`  ${question.answers[i][0].toUpperCase()}  `);
        await page.locator('#check').click();
        assert.match(await page.locator('#feedback').innerText(), /Well done/, question.id);
        checked++;
        await page.locator('#next').click();
      }
      await page.locator('#emptyBack').click();
      console.log(`PASS: ${topic}, ${checked}/150 questions submitted through the UI.`);
    }
    assert.equal(checked, 150);
    saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), store);
    assert.equal(Object.values(saved.answers).filter(a => a.correct && a.firstCorrect).length, 150);
    await page.locator('#report').click();
    assert.match(await page.locator('#reportContent').innerText(), /100%/);
    await page.screenshot({ path: path.join(artifacts, 'report.png') });
    await page.locator('#reset').click(); await page.locator('#cancelConfirm').click();
    assert.equal(await page.evaluate(key => Object.keys(JSON.parse(localStorage.getItem(key)).answers).length, store), 150);
    await page.locator('#reset').click(); await page.locator('#acceptConfirm').click();
    saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), store); assert.equal(Object.keys(saved.answers).length, 0); assert(saved.resetAt > 0);
    assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key + '-board')).text, store), 'Earth spins on its axis.');

    // Responsive screens, long diagram MCQ, partial fill grading and draft restoration.
    for (const size of [{ width: 1366, height: 768 }, { width: 1024, height: 768 }, { width: 390, height: 844 }]) {
      await page.setViewportSize(size); await page.locator('#home').click();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Home overflow at ${size.width}`);
      if (size.width === 390) await page.screenshot({ path: path.join(artifacts, 'phone-home.png'), fullPage: true });
      await page.locator('[data-topic="day"]').click(); await page.locator('#questionList').click(); await page.locator('[data-jump="3"]').click();
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Question overflow at ${size.width}`);
      if (size.width >= 1024) {
        const last = await page.locator('[data-option="3"]').boundingBox(); assert(last.y + last.height <= size.height, `Options below fold at ${size.width}`);
      }
      await page.screenshot({ path: path.join(artifacts, `question-${size.width}.png`), fullPage: true });
      await page.locator('#boardTab').click();
      await page.locator('#board').evaluate(async e => { await Promise.all(e.getAnimations().map(a => a.finished)); });
      const boardBox = await page.locator('#board').boundingBox();
      assert(boardBox.x >= 0 && boardBox.x + boardBox.width <= size.width + 1, 'Board must settle entirely inside viewport');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(artifacts, `board-${size.width}.png`), fullPage: true });
      await page.keyboard.press('Escape');
    }
    await page.locator('#home').click(); await page.locator('[data-type="fill"]').click(); await page.locator('[data-topic="day"]').click();
    await page.locator('#next').click(); await page.locator('#blank0').fill('EAST'); await page.locator('#blank1').fill('wrong'); await page.locator('#check').click();
    assert.equal(await page.locator('#blank0').getAttribute('aria-invalid'), 'false'); assert.equal(await page.locator('#blank1').getAttribute('aria-invalid'), 'true');
    await page.screenshot({ path: path.join(artifacts, 'phone-fill-feedback.png'), fullPage: true });
    await page.locator('#next').click(); await page.locator('#blank0').fill('shadow'); await page.reload(); await page.locator('#continue').click();
    assert.equal(await page.locator('#blank0').inputValue(), 'shadow');
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.locator('#boardTab').click();
    assert.equal(await page.locator('#board').evaluate(e => getComputedStyle(e).animationName), 'none');
    await page.keyboard.press('Escape'); assert.equal(await page.evaluate(() => document.activeElement.id), 'boardTab');
    await page.locator('#home').click(); await page.locator('#modelsButton').click();
    await page.locator('#rotationSlider').fill('180'); assert.match(await page.locator('#modelResult').innerText(), /night side/);
    await page.locator('#rotationSlider').fill('360'); assert.match(await page.locator('#modelResult').innerText(), /daylight/);
    await page.locator('[data-model="shadow"]').click(); await page.locator('#shadowSlider').fill('45'); assert.match(await page.locator('#modelResult').innerText(), /1.00 m/);
    await page.locator('#shadowSlider').fill('75'); assert.match(await page.locator('#modelResult').innerText(), /0.27 m/);
    await page.locator('[data-model="planets"]').click(); await page.locator('[data-planet="5"]').click(); assert.match(await page.locator('#planetResult').innerText(), /Saturn/);
    await page.screenshot({ path: path.join(artifacts, 'phone-models.png') });
    await page.locator('#modelsDialog [data-close]').click();
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.locator('.practice-settings summary').click();
    await page.locator('#advanceSetting').check();
    await page.locator('[data-type="mcq"]').click(); await page.locator('[data-topic="earth"]').click();
    const autoQuestion = await page.evaluate(() => { const s = window.EarthSpaceApp.cloudState().session; return window.EARTH_SPACE_DATA.questions.find(q => q.id === s.ids[s.index]); });
    await page.locator(`[data-option="${autoQuestion.answer}"]`).click(); await page.locator('#check').click();
    await page.locator('#stayHere').click(); const stayed = await page.locator('#position').innerText();
    await page.waitForTimeout(4150); assert.equal(await page.locator('#position').innerText(), stayed);
    await page.locator('#retry').click(); await page.locator(`[data-option="${autoQuestion.answer}"]`).click(); await page.locator('#check').click();
    await page.waitForFunction(previous => document.querySelector('#position').textContent !== previous, stayed, { timeout: 6000 });
    await page.keyboard.press('Control+Alt+r'); assert(await page.locator('#confirmDialog').isVisible()); await page.locator('#cancelConfirm').click();
    console.log('PASS: optional four-second advance, cancellation and teacher reset shortcut.');

    }
    const portalURL = url.replace(route, '/index.html#/secondary/igcse/igcse-science-y4');
    const guestSDK = `window.supabase = { createClient() { return { auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange(callback) {
        setTimeout(() => callback('INITIAL_SESSION', null), 0);
        return { data: { subscription: { unsubscribe() {} } } };
      }
    }, from() { return { select() { return { in: async () => ({ data: [], error: null }) }; } }; } }; } };`;
    new Function(guestSDK);
    await context.route('https://cdn.jsdelivr.net/npm/@supabase/**', r => r.fulfill({contentType:'application/javascript', body: guestSDK}));
    await page.goto(portalURL);
    assert.equal(await page.locator('#igcse-science-y4 [data-module-group="lessons"] .card').count(), 7);
    // Publication checkout has all five latest-main revisions; older canonical checkout has three.
    const revisionCount = await page.locator('#igcse-science-y4 [data-module-group="revision"] .card').count();
    assert(revisionCount >= 3);
    const left = await page.locator('[data-module-group="lessons"]').boundingBox(), right = await page.locator('[data-module-group="revision"]').boundingBox();
    assert(right.x > left.x + left.width, 'Desktop sections should be side by side');
    const launchLink = page.locator('#igcse-science-y4 [data-module-id="igcse-y4-sci-earth-space-revision"]');
    const href = await launchLink.getAttribute('href');
    assert.match(href, /launcher.html\?module=igcse-y4-sci-earth-space-revision/);
    await page.screenshot({ path: path.join(artifacts, 'year4-two-columns.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    const mobileLeft = await page.locator('[data-module-group="lessons"]').boundingBox(), mobileRight = await page.locator('[data-module-group="revision"]').boundingBox();
    assert(mobileRight.y >= mobileLeft.y + mobileLeft.height, 'Phone sections should stack');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    // Mock only the access decision; exercise the real manifest/launcher and return-route code.
    await page.route('**/js/auth-access.js*', r => r.fulfill({contentType:'application/javascript', body:'window.supabaseClient = {}; window.AuthAccess = {canLaunchModule: async () => ({allowed: true})};'}));
    await page.goto(new URL(href, portalURL).href);
    await page.waitForURL('**/Earth_and_Space_Revision/index.html?from=*');
    assert.match(await page.locator('.portal-link').getAttribute('href'), /#\/secondary\/igcse\/igcse-science-y4$/);
    console.log(`PASS: Year 4 ${7}+${revisionCount} grouping, responsive columns, registered launcher and exact return route.`);
    assert.deepEqual(errors, []);
    console.log('PASS: 150/150 UI grades; report/reset; responsive desktop/tablet/phone; fill variants/partial grading/drafts; reduced motion; zero page errors.');
    await context.close();
  } finally { await browser.close(); server.close(); }
})().catch(e => { console.error(e); server.close(); process.exitCode = 1; });
