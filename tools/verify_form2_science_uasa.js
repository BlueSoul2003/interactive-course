const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const vm = require('node:vm');
const crypto = require('node:crypto');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname,'..');
const rel = 'content/SPM_Syllabus/Form2/Science/UASA_2024';
const out = path.join(root,'.codex-tmp/form2-science-20261003');
fs.mkdirSync(out,{recursive:true});
const sandbox = {window:{}};
vm.runInNewContext(fs.readFileSync(path.join(root,rel,'data.js'),'utf8'),sandbox);
vm.runInNewContext(fs.readFileSync(path.join(root,rel,'question-layout.js'),'utf8'),sandbox);
const data = JSON.parse(JSON.stringify(sandbox.window.UASA_SCIENCE));
const layouts = sandbox.window.UASA_QUESTION_LAYOUT;
assert.equal(Object.keys(layouts).length,85);
assert.equal(data.questions.length,59);
assert.deepEqual(['A','B','C'].map(s=>data.questions.filter(q=>q.section===s).length),[20,5,34]);
assert.equal(data.questions.reduce((n,q)=>n+q.steps.length,0),130);
assert.equal(new Set(data.questions.map(q=>q.section+q.label)).size,59);
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,rel,'source.pdf'))).digest('hex'),data.sourceSha256);
for(const q of data.questions){
  assert(q.text.length>15 && q.steps.length>0);
  assert.equal(q.images.length,q.sourceRects.length);
  q.images.forEach((image,i)=>{
    assert(fs.existsSync(path.join(root,rel,image)),image);
    const layout=layouts[image];
    assert.equal(layout.sourceHeight,q.dimensions[i][1]);
    assert(layout.strips.length>0);
    let end=0;
    for(const [top,bottom] of layout.strips){
      assert(top>=end && bottom>top && bottom<=layout.sourceHeight,image);
      end=bottom;
    }
  });
  for(const s of q.steps) assert(s.bm && s.en && s.zh);
}
assert.match(data.questions.find(q=>q.section==='A'&&q.label==='4').steps[0].en,/cannot be determined/);
assert.match(data.questions.find(q=>q.section==='A'&&q.label==='14').steps[0].en,/0 A/);
assert.match(data.questions.find(q=>q.label==='5(b)'&&q.section==='C').steps.at(-1).bm,new RegExp(String(200/100*690+150/100*280+200/100*130+300/100*690+300/100*300)));
assert.match(data.questions.find(q=>q.label==='4(d)'&&q.section==='C').steps.at(-1).bm,/0\.8 A/);
assert.match(data.questions.find(q=>q.section==='A'&&q.label==='4').steps[0].zh,/無法確定.*缺少/);
assert.match(data.questions.find(q=>q.section==='A'&&q.label==='14').steps[0].zh,/0 A.*沒有正確答案/);
assert.match(data.questions.find(q=>q.label==='5(b)'&&q.section==='C').steps.at(-1).zh,/5030 kJ/);
assert.match(data.questions.find(q=>q.label==='6(c)'&&q.section==='C').steps.at(-1).zh,/不能去除所有微生物.*不一定適合飲用/);
const landing=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(landing,/data-module-id="spm-sci-f2-uasa-2024"\s+data-bundle="spm_form2"/);
assert.match(fs.readFileSync(path.join(root,'db/schema.sql'),'utf8'),/'spm-sci-f2-uasa-2024'.*'spm_form2'/);
console.log('PASS: complete bank, original PDF hash, source crops, Malay answers, 130 Chinese/English explanations, calculation and conditional-answer checkpoints, local registration.');
const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  const type={'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.pdf':'application/pdf'}[path.extname(file)]||'text/plain';
  res.writeHead(200,{'Content-Type':type});fs.createReadStream(file).pipe(res);
});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const url=base+'/'+rel+'/index.html?from='+encodeURIComponent('#/secondary/spm/spm-science');
  let browser;
  try{
    browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'msedge',headless:true});
    const context=await browser.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});
    await context.route('https://**/*',r=>r.abort());
    const page=await context.newPage();const errors=[];const missing=[];
    page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
    await page.goto(url);
    assert(await page.locator('#answerEmpty').isVisible());
    assert.equal(await page.locator('.answer-step').count(),0);
    assert.equal(await page.locator('[data-explanation-language="zh"]').getAttribute('aria-pressed'),'true');
    await page.locator('[data-explanation-language="en"]').click();
    await page.locator('#explanationToggle').click();
    assert.equal(await page.locator('.answer-step').count(),0,'settings must not reveal answers');
    await page.locator('[data-explanation-language="zh"]').click();
    await page.locator('#explanationToggle').click();
    await page.screenshot({path:path.join(out,'desktop-hidden.png')});
    await page.keyboard.press('Space');assert.equal(await page.locator('.answer-step').count(),1);
    await page.keyboard.press('Space');assert.equal(await page.locator('.answer-step').count(),2);
    assert.equal(await page.locator('.chinese:visible').count(),2);
    assert.equal(await page.locator('.english:visible').count(),0);
    await page.locator('#explanationToggle').click();
    assert.equal(await page.locator('.explanation:visible').count(),0);
    assert.equal(await page.locator('.answer-main:visible').count(),2,'hiding explanations must retain the Malay answers');
    await page.locator('[data-explanation-language="en"]').click();
    assert.equal(await page.locator('.explanation:visible').count(),0,'language change respects hidden explanations');
    await page.keyboard.press('e');assert.equal(await page.locator('.english:visible').count(),2);
    await page.keyboard.press('l');assert.equal(await page.locator('.explanation:visible').count(),4);
    await page.keyboard.press('l');assert.equal(await page.locator('.chinese:visible').count(),2);
    await page.keyboard.press('Backspace');assert.equal(await page.locator('.answer-step').count(),1);
    await page.keyboard.press('h');assert.equal(await page.locator('.answer-step').count(),0);
    await page.locator('#revealButton').click();await page.keyboard.press('Space');assert.equal(await page.locator('.answer-step').count(),2);
    await page.keyboard.press('Space');assert.match(await page.locator('#questionTitle').innerText(),/Soalan 2$/);assert.equal(await page.locator('.answer-step').count(),0);
    await page.keyboard.press('ArrowLeft');
    const shots=new Map([['A14','a14-conditional.png'],['B3','b3-force-matching.png'],['C1(c)','c1-variables.png'],['C3(a)(iii)','c3-pyramid.png'],['C4(d)','c4-current.png'],['C5(b)','c5-calorie.png'],['C6(c)','c6-filter.png']]);
    for(let i=0;i<data.questions.length;i++){
      const q=data.questions[i];
      await page.locator('#jumpButton').click();
      await page.locator('#questionMap button').nth(i).click();
      assert.equal(await page.locator('.answer-step').count(),0);
      await page.waitForFunction(()=>[...document.querySelectorAll('#questionImages img')].every(im=>im.complete&&im.naturalWidth>0));
      for(let j=0;j<q.steps.length;j++){
        await page.keyboard.press('Space');
        assert.equal(await page.locator('.answer-step').count(),j+1,`${q.section}${q.label}: step ${j+1}`);
        assert.equal(await page.locator('.answer-main').last().innerText(),q.steps[j].bm);
        assert.equal(await page.locator('.chinese:visible').last().innerText(),q.steps[j].zh);
      }
      await page.locator('[data-explanation-language="en"]').click();
      assert.deepEqual(await page.locator('.english:visible').allTextContents(),q.steps.map(s=>s.en));
      assert.equal(await page.locator('.chinese:visible').count(),0);
      if(q.steps.some(s=>s.diagram==='pyramid'))assert.match(await page.locator('.pyramid').innerText(),/Egret/);
      if(q.steps.some(s=>s.diagram==='filter'))assert.match(await page.locator('.filter-diagram').innerText(),/Clean face mask/);
      await page.locator('[data-explanation-language="both"]').click();
      assert.equal(await page.locator('.explanation:visible').count(),q.steps.length*2);
      assert.equal(await page.locator('.answer-step').count(),q.steps.length,'language changes preserve reveal progress');
      await page.locator('#explanationToggle').click();assert.equal(await page.locator('.explanation:visible').count(),0);
      if(q.steps.some(s=>s.diagram))assert.equal(await page.locator('.pyramid:visible,.filter-diagram:visible').count(),0);
      await page.locator('#explanationToggle').click();
      await page.locator('[data-explanation-language="zh"]').click();
      if(q.steps.some(s=>s.diagram==='pyramid'))assert.match(await page.locator('.pyramid').innerText(),/白鷺/);
      if(q.steps.some(s=>s.diagram==='filter'))assert.match(await page.locator('.filter-diagram').innerText(),/乾淨口罩/);
      assert(await page.locator('#answerDone').isVisible());
      assert.equal(await page.evaluate(()=>scrollY),0,'desktop reveal should scroll the answer pane, not the whole page');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      if(shots.has(q.section+q.label))await page.screenshot({path:path.join(out,shots.get(q.section+q.label))});
    }
    assert(await page.locator('#revealButton').isDisabled());
    await page.locator('[data-explanation-language="en"]').click();await page.locator('#explanationToggle').click();
    await page.reload();assert.equal(await page.locator('.answer-step').count(),0);assert.match(await page.locator('#questionTitle').innerText(),/6\(c\)/);
    assert.equal(await page.locator('[data-explanation-language="en"]').getAttribute('aria-pressed'),'true');
    assert.equal(await page.locator('#explanationToggle').getAttribute('aria-pressed'),'false');
    await page.keyboard.press('Space');assert.equal(await page.locator('.explanation:visible').count(),0);
    await page.locator('#explanationToggle').click();assert.equal(await page.locator('.english:visible').count(),1);
    await page.keyboard.press('h');
    assert.match(await page.locator('.back-link').getAttribute('href'),/#\/secondary\/spm\/spm-science/);
    const fittedZoom=parseInt(await page.locator('#zoomLabel').innerText());
    await page.locator('#zoomIn').click();assert.equal(await page.locator('#zoomLabel').innerText(),`${Math.min(175,fittedZoom+25)}%`);
    assert.equal(await page.locator('#fitButton').getAttribute('aria-pressed'),'false');
    await page.locator('#zoomOut').click();
    await page.locator('#fitButton').click();assert.equal(await page.locator('#zoomLabel').innerText(),`${fittedZoom}%`);
    assert.equal(await page.locator('#fitButton').getAttribute('aria-pressed'),'true');
    await page.locator('#helpButton').click();await page.keyboard.press('Space');assert.equal(await page.locator('.answer-step').count(),0);await page.keyboard.press('Escape');
    await page.locator('#noteButton').click();assert(await page.locator('#teacherNote').isVisible());await page.locator('#noteButton').click();
    await page.setViewportSize({width:1366,height:768});
    for(let i=0;i<20;i++){
      await page.locator('#jumpButton').click();await page.locator('#questionMap button').nth(i).click();
      await page.waitForFunction(()=>[...document.querySelectorAll('#questionImages img')].every(im=>im.complete&&im.naturalWidth>0));
      assert(await page.evaluate(()=>{const s=document.querySelector('#questionScroll');return s.scrollHeight<=s.clientHeight+1&&s.scrollTop===0;}),`objective A${i+1} must fit without scrolling`);
    }
    for(const width of [1366,768,390,320]){
      await page.setViewportSize({width,height:width>800?768:844});
      await page.locator('#jumpButton').click();await page.locator('#questionMap button').nth(53).click();
      await page.locator('[data-explanation-language="both"]').click();await page.keyboard.press('Space');
      assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`page overflow at ${width}`);
      assert(await page.locator('#revealButton').isVisible());
      if(width < 961) assert(await page.evaluate(()=>document.querySelector('.answer-step .english').getBoundingClientRect().bottom <= document.querySelector('.control-bar').getBoundingClientRect().top),`revealed bilingual answer covered by dock at ${width}`);
      for(const language of ['zh','en','both']){
        await page.locator(`[data-explanation-language="${language}"]`).click();
        assert.equal(await page.locator('.explanation:visible').count(),language==='both'?2:1);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`language toolbar overflow at ${width}`);
      }
      await page.screenshot({path:path.join(out,`responsive-${width}.png`),fullPage:true});
    }
    await page.goto('file:///'+path.join(root,rel,'index.html').replaceAll('\\','/'));
    assert(await page.locator('#answerEmpty').isVisible());await page.keyboard.press('Space');assert.equal(await page.locator('.answer-step').count(),1);
    await page.locator('[data-explanation-language="en"]').click();assert.equal(await page.locator('.english:visible').count(),1);
    await page.locator('#explanationToggle').click();assert.equal(await page.locator('.explanation:visible').count(),0);
    assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
    console.log('PASS: all 59 screens / 130 keyboard reveals and Chinese/English/both explanations, explanation visibility, E/L controls, translated diagrams, preference persistence, undo/hide, mouse-to-keyboard, next/reset, resume with hidden answers, picker, source return, notes, help, manual/auto zoom, all 20 objective questions fit at 1366x768, four viewport sizes, offline language controls; no page errors or missing assets.');
    await context.close();
  }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
