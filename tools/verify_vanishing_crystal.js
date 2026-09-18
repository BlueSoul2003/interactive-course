const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),id='igcse-y4-sci-vanishing-crystal',route='content/IGCSE_Syllabus/Year4/Science/Extended_Learning_Vanishing_Crystal/index.html',dir=path.dirname(path.join(root,route));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const section=html.slice(html.indexOf('<div id="igcse-science-y4"'),html.indexOf('<div id="igcse-science-y8"'));
const extension=section.slice(section.indexOf('data-module-group="extension"'));
assert(extension.includes(`data-module-id="${id}"`));assert.equal((html.match(new RegExp(`data-module-id="${id}"`,'g'))||[]).length,1);
assert(extension.includes('data-bundle="igcse_y4_science"'));assert(extension.includes('<h3>The Vanishing Crystal</h3>'));assert(extension.includes('Extended Learning'));assert(extension.includes(`href="${route}"`));assert(!extension.includes('Year 5'));
const entry=JSON.parse(fs.readFileSync(path.join(root,'resources/module-manifest.json'))).modules.find(m=>m.id===id);assert.equal(entry.path,route);assert.equal(entry.title,'The Vanishing Crystal');assert.equal(entry.delivery,'public');
const sql=fs.readFileSync(path.join(root,'db/register_vanishing_crystal.sql'),'utf8');assert(sql.includes(`'${id}'`));assert(sql.includes("'igcse_y4_science', 'Year4', true, 'protected'"));
const lessonHTML=fs.readFileSync(path.join(root,route),'utf8');assert(lessonHTML.includes('#/secondary/igcse/igcse-science-y4'));assert(lessonHTML.includes('navigation.js?v=1.0.0'));
for(const [,url] of lessonHTML.matchAll(/(?:src|href)="([^"]+)"/g)){if(/^(https?:|#)/.test(url))continue;assert(fs.existsSync(path.resolve(dir,url.split(/[?#]/)[0])),url);}
for(const file of ['lesson.js','challenge.js','motion.js','feedback.js','app.js'])new vm.Script(fs.readFileSync(path.join(dir,file),'utf8'),{filename:file});
const d=require(path.join(dir,'lesson.js')),c=require(path.join(dir,'challenge.js'));assert.equal(d.slides.length,17);assert.equal(c.bank.length,50);assert.equal(new Set(c.bank.map(q=>q.id)).size,50);
for(const n of c.sizes){const ids=c.sample(n);assert.equal(ids.length,n);assert.equal(new Set(ids).size,n);assert.deepEqual(c.levels.map(l=>ids.filter(id=>c.bank.find(q=>q.id===id).level===l).length),[n*.4,n*.4,n*.2]);}
for(const clip of d.clips){const u=new URL(d.embedURL(clip,'https://bluesoul2003.github.io'));assert.equal(u.searchParams.get('origin'),'https://bluesoul2003.github.io');assert.equal(u.searchParams.get('end'),String(clip.end));}
assert(!/Eason/.test(lessonHTML+fs.readFileSync(path.join(dir,'lesson.js'),'utf8')));
console.log('PASS Vanishing Crystal: card placement/title/bundle, registry, launcher destination, return route, local assets, scripts, 17 screens, 50 questions and balanced rounds.');
