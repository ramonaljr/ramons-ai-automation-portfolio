// Usage: node build.js [slug...]  → out/<slug>.html (one self-contained film per case study)
const fs=require('fs'),path=require('path');
const dir=__dirname,shell=fs.readFileSync(path.join(dir,'shell.html'),'utf8');
const core=fs.readFileSync(path.join(dir,'engine-core.js'),'utf8'),run=fs.readFileSync(path.join(dir,'engine-run.js'),'utf8');
const esc=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const slugs=process.argv.slice(2).length?process.argv.slice(2):fs.readdirSync(path.join(dir,'films')).map(f=>f.replace(/\.js$/,''));
for(const slug of slugs){
  const film=fs.readFileSync(path.join(dir,'films',slug+'.js'),'utf8');
  const meta={};new Function('FILM','RED','TEAL','AMBER','BLUE',film.split('\nconst ')[0]+';meta.f=FILM;'.replace('meta','this')).call(meta,{},'','','','');
  const f=meta.f;
  const html=shell.replace(/{{TITLE}}/g,esc(f.title)).replace('{{SUB}}',esc(f.sub)).replace('{{ARIA}}',esc(f.aria))
    .replace('{{SCRIPT}}',()=>core+'\n/* ---------- film: '+slug+' ---------- */\n'+film+'\n'+run);
  fs.writeFileSync(path.join(dir,'out',slug+'.html'),html);
  console.log('built',slug,(html.length/1024).toFixed(0)+' KB');
}
