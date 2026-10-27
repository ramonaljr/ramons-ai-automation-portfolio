/* ---------- timeline: intro + body + recap ---------- */
const TY=TYPES[FILM.type],PROTAG=FILM.protag||'dennice',KEYS=Object.keys(ACTORS),MULTI=KEYS.length>1;
const R0=BODY[BODY.length-1].e;
const BEATS=[
  {s:-6,e:-5,say:'',cam:[640,340,1.0],hold:1.4},
  {s:-5,e:-3.6,say:'',cam:[640,340,1.0],hold:3},
  {s:-3.6,e:-2.2,say:'',cam:[640,340,1.0],hold:3},
  {s:-2.2,e:-.8,say:'',cam:[640,340,1.0],hold:3.4},
  // a silent beat clears the card before anyone speaks over it
  {s:-.8,e:-.01,say:'',cam:[640,340,1.0],hold:.15},
  ...BODY];
{let t=R0;const add=(d,o)=>{BEATS.push(Object.assign({s:t,e:t+d,cam:[640,360,1.0]},o));t+=d;};
  add(.5,{say:RECAP.opener||"Let's recap what happened.",who:PROTAG,side:true});
  add(1.1,{say:'',hold:.6});
  RECAP.points.forEach((p,i)=>{p.t=t;add(.7,{say:'',hold:p.hold||3.6});});
  RECAP.endT=t;add(.9,{say:'',hold:4.6});}
const END=BEATS[BEATS.length-1].e;
const INTRO=FILM.intro.map((x,i)=>({t:[-4.9,-3.5,-2.1][i],k:TY.labels[i],c:[INK,RED,TEAL][i],x}));
const CHAPS=[[-6,0,'intro','Intro','what this film shows','intro']];
CHAPS_B.forEach((c,i)=>CHAPS.push([c.t,i<CHAPS_B.length-1?CHAPS_B[i+1].t:R0,c.ring,c.chip,c.title,c.mood||'setup']));
CHAPS.push([R0,END,'recap','Recap','the recap','recap']);
CHAPS[1][0]=Math.min(CHAPS[1][0],0);
const chapAt=t=>{let i=0;CHAPS.forEach((c,j)=>{if(t>=c[0])i=j;});return i;};
// the protagonist steps to the edge of the frame for the recap; the others step out
{const a=ACTORS[PROTAG],x0=track(a.x,R0);a.x=a.x.filter(k=>k[0]<R0);a.x.push([R0+.5,x0],[R0+1.4,1212]);}

/* ---------- actors ---------- */
const HEAD={};
function actorAt(key,t){const a=ACTORS[key],c=CAST[key];
  const x=track(a.x,t),vx=(track(a.x,t+.03)-track(a.x,t-.03))/.06,walking=Math.abs(vx)>25;
  let fy=a.y?track(a.y,t):598;if(walking)fy-=Math.abs(Math.sin(t*16))*5;else fy-=Math.sin(A*3+key.length)*1.2;
  const dir=walking?(vx<0?-1:1):stepVal(a.face,t,1);
  let pose=ivVal(a.poses,t)||'idle';const carry=ivVal(a.carry,t);if(carry)pose='carry';
  const b=BEATS[bi],spk=b.who||PROTAG;
  if(pose==='idle'&&!walking&&spk===key&&b.say&&t>=0)pose='talk';
  const mood=ivVal(a.moods,t)||'normal';
  if(pose==='celebrate'&&!walking)fy-=Math.abs(Math.sin(A*6))*22;
  let alpha=seg(t,-.6,-.05);if(a.vis){let v=0;a.vis.forEach(([p,q])=>{v=Math.max(v,Math.min(seg(t,p,p+.3),1-seg(t,q-.3,q)));});alpha*=v;}
  if(key!==PROTAG)alpha*=1-seg(t,R0+.5,R0+1.1);
  const focus=spk!==key&&ACTORS[spk]?track(ACTORS[spk].x,t):b.cam[0];
  return {x,fy,dir,pose,mood,walking,sw:walking?Math.sin(t*16)*7:0,alpha,carry,held:ivVal(a.hold,t),gx:clamp((focus-x)/60,-2.2,2.2)};}
function drawActors(t){
  if(t<-.6){KEYS.forEach(k=>{HEAD[k]=null;});return;}
  KEYS.forEach(key=>{const st=actorAt(key,t),c=CAST[key];if(st.alpha<=0){HEAD[key]=null;return;}
    ctx.save();ctx.globalAlpha*=st.alpha;
    const r=drawChar(c,st.x,st.fy,{pose:st.pose,mood:st.mood,walking:st.walking,sw:st.sw,dir:st.dir,gx:st.gx,t:A});
    if(st.carry){const h=r.hands;item(st.carry[0]||st.carry,(h[0][0]+h[1][0])/2,(h[0][1]+h[1][1])/2-16,.8,1,600,st.carry[1]);}
    if(st.held){const h=r.hands[1];item(st.held[0]||st.held,h[0]+st.dir*10,h[1]-8,.6,1,610,st.held[1]);}
    ctx.restore();HEAD[key]=st.alpha>.3?[st.x,r.headY]:null;});}
// interval values with a payload: [[a,b,'type','label']] → ['type','label']
['carry','hold'].forEach(f=>KEYS.forEach(k=>{const a=ACTORS[k];if(a[f])a[f]=a[f].map(r=>[r[0],r[1],[r[2],r[3]]]);}));

/* ---------- frame furniture ---------- */
function chapterTitle(i){const c=CHAPS[i],u=reduce?1:ease(clamp((NOW()-chapT0)/700,0,1));
  ctx.save();ctx.globalAlpha*=u;txt(c[4],64,62,{size:26,align:'left',color:'#3a322b'});ctx.font='26px '+HAND;const w=ctx.measureText(c[4]).width;
  ctx.strokeStyle=AMBER;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(64,82);ctx.lineTo(64+Math.min(w,110)*u,82);ctx.stroke();ctx.restore();}
function ring(s){const i=chapAt(s),c=CHAPS[i],p=seg(s,c[0],c[1]),cx=1188,cy=64;
  sk(ell(cx,cy,22,22,20),{seed:950,fill:'rgba(252,249,241,.9)',lw:1.6,stroke:'rgba(43,38,33,.4)'});
  ctx.strokeStyle=RING;ctx.lineWidth=3.5;ctx.lineCap='round';ctx.beginPath();ctx.arc(cx,cy,22,-Math.PI/2,-Math.PI/2+p*Math.PI*2);ctx.stroke();
  ctx.fillStyle=RING;ctx.fillRect(cx-4,cy-4,8,8);txt((i+1)+' · '+c[2],cx,cy+40,{size:12,font:MONO,color:'#4a4239'});}
function wrap(str,maxW){ctx.font='25px '+HAND;const words=str.split(' '),lines=[];let cur='';
  words.forEach(w=>{const tr=cur?cur+' '+w:w;if(ctx.measureText(tr).width>maxW&&cur){lines.push(cur);cur=w;}else cur=tr;});if(cur)lines.push(cur);return lines;}
function bubble(b,hx,hy){
  if(!b.say)return;const el=reduce?1e3:(NOW()-bubbleT0)/1000;
  const pop=reduce?1:back(clamp(el/.25,0,1));const shown=Math.floor(el*40);
  const lines=wrap(b.say,400);ctx.font='25px '+HAND;const tw=Math.max(...lines.map(l=>ctx.measureText(l).width));
  const w=tw+36,h=lines.length*31+26;let bx,by,tail;
  let side=b.side==='left'?'left':b.side?'right':null;
  // a side bubble with no room beside the speaker goes back above the head
  if(side==='right'&&hx+70+w>W-16)side=hx-70-w>=16?'left':null;
  else if(side==='left'&&hx-70-w<16)side=hx+70+w<=W-16?'right':null;
  if(side==='right'){bx=clamp(hx+70,16,W-16-w);by=clamp(hy-10,100,H-16-h);tail=[bx,by+h/2];}
  else if(side==='left'){bx=clamp(hx-70-w,16,W-16-w);by=clamp(hy-10,100,H-16-h);tail=[bx+w,by+h/2];}
  else{bx=clamp(hx-w/2,16,W-16-w);by=Math.max(100,hy-26-h);tail=[clamp(hx,bx+24,bx+w-24),by+h];}
  ctx.save();ctx.translate(bx+w/2,by+h/2);ctx.scale(pop,pop);ctx.translate(-(bx+w/2),-(by+h/2));
  ctx.fillStyle='rgba(43,38,33,.12)';ctx.beginPath();ctx.roundRect?ctx.roundRect(bx+4,by+5,w,h,16):ctx.rect(bx+4,by+5,w,h);ctx.fill();
  let tp;
  if(side==='right')tp=[[tail[0]+2,tail[1]-10],[hx+26,hy+18],[tail[0]+2,tail[1]+10]];
  else if(side==='left')tp=[[tail[0]-2,tail[1]-10],[hx-26,hy+18],[tail[0]-2,tail[1]+10]];
  else tp=[[tail[0]-12,tail[1]-2],[clamp(hx,tail[0]-40,tail[0]+40),Math.min(hy-4,tail[1]+22)],[tail[0]+12,tail[1]-2]];
  sk(rr(bx,by,w,h,16),{seed:960,fill:PAPERW,lw:2.2,amp:.7});
  sk(tp,{seed:961,fill:PAPERW,lw:2.2,amp:.4,closed:false});
  ctx.fillStyle=PAPERW;
  if(side)ctx.fillRect(side==='right'?tp[0][0]-3:tp[0][0]-2,Math.min(tp[0][1],tp[2][1])+2,5,Math.abs(tp[2][1]-tp[0][1])-4);
  else ctx.fillRect(Math.min(tp[0][0],tp[2][0])+2,Math.min(tp[0][1],tp[2][1])-3,Math.abs(tp[2][0]-tp[0][0])-2||4,Math.abs(tp[2][1]-tp[0][1])+5||5);
  let left=shown;lines.forEach((l,i)=>{const part=l.slice(0,Math.max(0,left));left-=l.length+1;txt(part,bx+18,by+13+15+i*31,{size:25,align:'left'});});
  if(MULTI){const c=CAST[b.who||PROTAG];ctx.font='600 13px '+MONO;const cw=ctx.measureText(c.name).width+20;
    sk(rr(bx+14,by-13,cw,24,8),{seed:965,fill:c.body,lw:1.8,amp:.4});txt(c.name,bx+14+cw/2,by,{size:13,font:MONO,weight:600,color:lum(c.body)>.62?INK:'#fff'});}
  ctx.restore();}
function pill(str,x,y,alpha){ctx.save();ctx.globalAlpha=alpha;ctx.font='600 15px '+MONO;const w=ctx.measureText(str).width+28;
  ctx.fillStyle='rgba(35,31,27,.82)';ctx.beginPath();ctx.roundRect?ctx.roundRect(x-w,y-16,w,32,16):ctx.rect(x-w,y-16,w,32);ctx.fill();
  ctx.fillStyle='#F4EFE6';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(str,x-w+14,y+1);ctx.restore();}
function intro(t){
  if(t>=-.05)return;const a=1-seg(t,-.8,-.05);if(a<=0)return;const k=back(seg(t,-6,-5.3));
  ctx.save();ctx.globalAlpha=a;ctx.translate(640,330);ctx.scale(k,k);ctx.translate(-640,-330);
  plank(170,120,940,400,981);sk(rr(188,136,904,368,3),{seed:982,fill:PAPERW,lw:1.6});
  txt(TY.kicker,640,172,{size:14,font:MONO,color:'#6b6258'});
  txt(FILM.cardTitle,640,214,{size:40});
  ctx.strokeStyle=AMBER;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(585,242);ctx.lineTo(695,242);ctx.stroke();
  INTRO.forEach((r,i)=>{const u=ease(seg(t,r.t,r.t+.6));if(u<=0)return;const y=292+i*72;
    ctx.save();ctx.globalAlpha*=u;ctx.translate(0,8*(1-u));
    txt(r.k.toUpperCase(),228,y,{size:13,font:MONO,align:'left',color:r.c});
    wrapW(r.x,25,660).forEach((l,j)=>txt(l,392,y+j*29,{size:25,align:'left'}));ctx.restore();});
  ctx.restore();}
function statsBoard(t){
  if(!STATS||t<STATS.t0||t>=STATS.t1+.6)return;const k=back(seg(t,STATS.t0,STATS.t0+1.1)),out=ease(seg(t,STATS.t1,STATS.t1+.6)),dy=-470*(1-k)-560*out;
  const n=STATS.stats.length,bw=n*230+80,x0=640-bw/2,y0=STATS.y||110,bh=STATS.h||250;
  ctx.save();ctx.translate(0,dy);
  ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(x0+60,0);ctx.lineTo(x0+60,y0+4);ctx.moveTo(x0+bw-60,0);ctx.lineTo(x0+bw-60,y0+4);ctx.stroke();
  plank(x0,y0,bw,bh,901);sk(rr(x0+18,y0+16,bw-36,bh-32,3),{seed:902,fill:PAPERW,lw:1.6});
  txt(STATS.title,640,y0+50,{size:28});
  STATS.stats.forEach((st,i)=>{const cx=640+(i-(n-1)/2)*230,u=back(seg(t,STATS.t0+1.1+i*.35,STATS.t0+1.5+i*.35));if(u<=0)return;
    ctx.save();ctx.translate(cx,y0+130);ctx.scale(u,u);txt(st.v,0,0,{size:st.size||52,font:MONO,weight:600,color:st.c||TEAL});ctx.restore();
    ctx.save();ctx.globalAlpha*=clamp(u,0,1);wrapW(st.l,21,200).forEach((l,j)=>txt(l,cx,y0+182+j*24,{size:21}));ctx.restore();});
  ctx.restore();}
function recap(t){
  if(t<R0+.5)return;const k=back(seg(t,R0+.5,R0+1.4)),dy=-620*(1-k);
  ctx.save();ctx.translate(0,dy);
  ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(240,0);ctx.lineTo(240,32);ctx.moveTo(1040,0);ctx.lineTo(1040,32);ctx.stroke();
  plank(130,28,1020,562,991);sk(rr(148,44,984,530,3),{seed:992,fill:PAPERW,lw:1.6});
  txt(TY.recap,180,80,{size:32,align:'left'});
  ctx.strokeStyle=AMBER;ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(180,102);ctx.lineTo(290,102);ctx.stroke();
  const bannerLines=wrapW(RECAP.ending,27,880),bh=46+bannerLines.length*31;
  let total=0;const P=RECAP.points.map(r=>{const lines=wrapW(r.x,22,880);total+=28+lines.length*26+16;return lines;});
  const room=560-bh-12-128;const sc=total>room?room/total:1;const gap=sc<1?0:Math.min(34,(room-total)/RECAP.points.length);
  let y=140;
  RECAP.points.forEach((r,i)=>{const u=ease(seg(t,r.t,r.t+.6)),lines=P[i];
    if(u>0){ctx.save();ctx.globalAlpha=u;ctx.translate(0,10*(1-u));
      sk(ell(191,y,11,11,14),{seed:995+i,fill:r.c,lw:1.6,amp:.4});txt(String(i+1),191,y+1,{size:14,font:MONO,color:'#fff'});
      txt(r.h,212,y,{size:24,align:'left',color:r.c});
      lines.forEach((l,j)=>txt(l,212,y+30*sc+j*26*sc,{size:23,align:'left'}));ctx.restore();}
    y+=(28+lines.length*26+16)*sc+gap;});
  const u=ease(seg(t,RECAP.endT,RECAP.endT+.7));
  if(u>0){const by=Math.max(y+2,560-bh);ctx.save();ctx.globalAlpha=u;const s2=.9+.1*back(seg(t,RECAP.endT,RECAP.endT+.5));
    ctx.translate(640,by+bh/2);ctx.scale(s2,s2);ctx.translate(-640,-(by+bh/2));
    sk(rr(172,by,936,bh,10),{seed:999,fill:'#FBEBD0',stroke:AMBER,lw:2.6});
    txt(TY.banner,196,by+22,{size:13,font:MONO,align:'left',color:'#9A600A'});
    bannerLines.forEach((l,j)=>txt(l,196,by+54+j*31,{size:27,align:'left'}));ctx.restore();}
  ctx.restore();}

/* ---------- camera + render ---------- */
let BASE=1;
function camNow(){const b=BEATS[bi].cam,u=reduce?1:ease(clamp((NOW()-camT0)/1000,0,1));
  return [0,1,2].map(k=>camFrom[k]+(b[k]-camFrom[k])*u);}
function nightA(t){let a=0;NIGHT.forEach(([p,q])=>{a=Math.max(a,Math.min(seg(t,p,p+.6),1-seg(t,q-.6,q)));});return a;}
function render(s){
  BOIL=reduce?0:Math.floor(NOW()/1000*6);A=NOW()/1000;
  let [fx,fy,z]=camNow();fx=clamp(fx,W/(2*z),W-W/(2*z));fy=clamp(fy,H/(2*z),H-H/(2*z));
  ctx.setTransform(BASE,0,0,BASE,0,0);ctx.fillStyle=PAPER;ctx.fillRect(0,0,W,H);
  ctx.save();ctx.translate(W/2,H/2);ctx.scale(z,z);ctx.translate(-fx,-fy);
  ctx.drawImage(bg,0,0,W,H);
  const na=nightA(s);if(na>0){ctx.fillStyle='rgba(46,58,102,'+(.42*na)+')';ctx.fillRect(0,0,W,598);}
  if(DRAW_BACK)DRAW_BACK(s);
  LINKS.forEach(l=>drawLink(l,s));
  PROPS.forEach(p=>{if(p.layer!=='front')drawProp(p,s);});
  TOKENS.forEach(o=>drawToken(o,s));
  drawActors(s);
  PROPS.forEach(p=>{if(p.layer==='front')drawProp(p,s);});
  FLIGHTS.forEach(o=>drawFlight(o,s));
  MARKS.forEach(m=>drawMark(m,s));
  if(DRAW_FRONT)DRAW_FRONT(s);
  statsBoard(s);recap(s);intro(s);
  ctx.restore();
  const g=ctx.createRadialGradient(W/2,H/2,H*.38,W/2,H/2,H*.95);g.addColorStop(0,'rgba(40,30,20,0)');g.addColorStop(1,'rgba(40,30,20,.28)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  {const fa=1-seg(s,R0+.4,R0+.9);if(fa>0){ctx.save();ctx.globalAlpha=fa;chapterTitle(chapAt(s));ring(s);
    if(DRAW_HUD&&s>=0){ctx.globalAlpha=fa*seg(s,0,.6);DRAW_HUD(s);}ctx.restore();}}
  const b=BEATS[bi],spk=b.who||PROTAG,hp=HEAD[spk];
  const hx=hp?(hp[0]-fx)*z+W/2:640,hy=hp?(hp[1]-fy)*z+H/2:330;
  bubble(b,hx,hy);
  if(CAPTURE)return;
  if(phase==='wait')pill('click to continue  ▸',W-24,H-30,.65+.35*Math.sin(A*4));
  else if(phase==='end')pill('▸ replay',W-24,H-30,.9);
  else if(paused)pill('❚❚ paused',W-24,H-30,.9);
}

/* ---------- sound ---------- */
let ac=null,master=null,musicBus=null,soundOn=false,musicTimer=null,nextNote=0,stepN=0;
function ensureAudio(){try{if(!ac){ac=new(window.AudioContext||window.webkitAudioContext)();master=ac.createGain();master.gain.value=.55;master.connect(ac.destination);
  musicBus=ac.createGain();musicBus.gain.value=1;musicBus.connect(master);}if(ac.state==='suspended')ac.resume();}catch(e){}}
const mtof=m=>440*Math.pow(2,(m-69)/12);
function toneAt(f,d,type,v,t0,dest,slide=0){const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);if(slide)o.frequency.exponentialRampToValueAtTime(f*slide,t0+d);
  g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.01);g.gain.exponentialRampToValueAtTime(.0001,t0+d);o.connect(g);g.connect(dest||master);o.start(t0);o.stop(t0+d+.05);}
const tone=(f,d,type='triangle',v=.08,w=0,slide=0)=>toneAt(f,d,type,v,(AT??ac.currentTime)+w,master,slide);
function noise(d,v,f0,f1,q=1){const n=Math.floor(ac.sampleRate*d),b=ac.createBuffer(1,n,ac.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=Math.random()*2-1;
  const src=ac.createBufferSource();src.buffer=b;const f=ac.createBiquadFilter();f.type='bandpass';f.Q.value=q;const t0=AT??ac.currentTime;f.frequency.setValueAtTime(f0,t0);f.frequency.exponentialRampToValueAtTime(f1,t0+d);
  const g=ac.createGain();g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+d*.3);g.gain.exponentialRampToValueAtTime(.0001,t0+d);src.connect(f);f.connect(g);g.connect(master);src.start(t0);}
const SFX={whoosh:()=>noise(.45,.22,500,2600,.9),pop:()=>tone(620,.12,'sine',.11,0,1.7),thud:()=>tone(120,.18,'sine',.18,0,.5),
  buzz:()=>{tone(150,.2,'square',.05);tone(140,.22,'square',.05,.22);},chime:()=>[76,79,84].forEach((m,i)=>tone(mtof(m),.6,'sine',.08,i*.07)),
  small:()=>tone(mtof(84),.3,'sine',.06),big:()=>[67,72,76,79,84].forEach((m,i)=>tone(mtof(m),.9,'triangle',.07,i*.08)),
  poof:()=>noise(.4,.18,1800,300,.6),ding:()=>tone(mtof(88),.45,'sine',.07),click:()=>noise(.03,.07,3200,2600,3),tick:()=>tone(1900,.025,'square',.02),
  ring:()=>{for(let i=0;i<6;i++)tone(i%2?1180:940,.07,'sine',.045,i*.075);}};
const EV=[];
PROPS.forEach(p=>{if(p.t0!=null&&p.t0>-5.9&&!p.quiet)EV.push([p.t0,'pop']);if(p.puff&&p.t1!=null)EV.push([p.t1,'poof']);});
FLIGHTS.forEach(o=>{EV.push([o.t0,'whoosh'],[o.t1,o.soft?'pop':'thud']);});
TOKENS.forEach(o=>{if(!o.quiet)EV.push([o.t1,'small']);});
MARKS.forEach(m=>{const n={flag:'buzz',bang:'buzz',cross:'buzz',check:'ding',puff:'poof',q:'pop',label:'pop'}[m.k];if(n&&!m.quiet)EV.push([m.t0,n]);});
if(STATS)EV.push([STATS.t0,'whoosh'],[STATS.t0+1.1,'big']);
[-5.9,-4.9,-3.5,-2.1].forEach(x=>EV.push([x,'pop']));EV.push([R0+.55,'whoosh']);RECAP.points.forEach(p=>EV.push([p.t,'pop']));EV.push([RECAP.endT,'chime']);
EVENTS.forEach(e=>EV.push(e));
const TYPING=[];KEYS.forEach(k=>(ACTORS[k].poses||[]).forEach(r=>{if(r[2]==='type')TYPING.push([r[0],r[1]]);}));
const fire=n=>{if(CAPTURE)LOG.push({t:VCLOCK/1000,name:n});else SFX[n]();};
function sfx(a,b){if(!CAPTURE&&(!ac||!soundOn))return;
  EV.forEach(([x,n])=>{if(x>a&&x<=b)fire(n);});
  if(inAny(b,TYPING)&&Math.floor(b/.09)!==Math.floor(a/.09))fire('click');
  if(inAny(b,RINGS)&&Math.floor(b/.7)!==Math.floor(a/.7))fire('ring');
  if(FILM.ticks&&inAny(b,FILM.ticks)&&Math.floor(b/.5)!==Math.floor(a/.5))fire('tick');}
// Music runs on its own clock, so it keeps playing while the film is paused or waiting for a click.
const MUSD={intro:{root:48,seq:[60,null,67,null,64,null,67,null],v:.04},setup:{root:48,seq:[60,null,64,null,67,null,64,null],v:.045},
  problem:{root:45,seq:[57,null,null,60,null,null,64,null,null,60,null,null,55,null,59,null],v:.04},turn:{root:48,seq:[60,64,67,71,72,71,67,64],v:.04},
  solution:{root:43,seq:[67,null,71,74,null,79,74,71],v:.045},finale:{root:48,seq:[72,76,79,84,79,76,72,null],v:.05},recap:{root:41,seq:[65,69,72,null,76,72,69,null],v:.04}};
const MUS=CHAPS.map(c=>MUSD[c[5]]||MUSD.setup);
function schedule(){const STEP=.3;while(nextNote<ac.currentTime+.25){const m=MUS[chapAt(s)],n=m.seq[stepN%m.seq.length];
  if(n)toneAt(mtof(n),.5,'triangle',m.v,nextNote,musicBus);if(stepN%8===0)toneAt(mtof(m.root),1.6,'sine',.07,nextNote,musicBus);stepN++;nextNote+=STEP;}}
function musicOn(on){if(on&&!musicTimer&&ac){nextNote=ac.currentTime+.08;musicTimer=setInterval(schedule,60);}if(!on&&musicTimer){clearInterval(musicTimer);musicTimer=null;}}
let duck=-1;function setDuck(){if(!musicBus)return;const d=phase==='lead'?.55:1;if(d!==duck){duck=d;musicBus.gain.setTargetAtTime(d,ac.currentTime,.25);}}

/* ---------- player: beats, lead → play → hold/wait ---------- */
BEATS.forEach(b=>b.lead=b.say?clamp(b.say.length/34,1.0,1.9):.15);
let bi=0,phase='lead',pt=0,s=0,mode='click',paused=reduce,speedMul=1.5;
let camFrom=BEATS[0].cam.slice(),camT0=0,bubbleT0=0,chapT0=0,lastChap=-1;
const RATE=.85,HOLD=1.2;
function enter(i,instant){const from=camNow();bi=i;s=BEATS[i].s;phase='lead';pt=0;camFrom=instant?BEATS[i].cam.slice():from;camT0=NOW();bubbleT0=NOW();}
function update(dt){if(paused||phase==='end'||phase==='wait')return;pt+=dt*speedMul;const b=BEATS[bi];
  if(phase==='lead'){if(pt>=b.lead){phase='play';pt=0;}}
  else if(phase==='play'){const a=s;s=Math.min(b.e,s+dt*RATE*speedMul);sfx(a,s);
    // rest just inside the beat, so things that end with it are still on screen during the hold
    if(s>=b.e){s=b.e-1e-4;pt=0;phase=bi===BEATS.length-1?'end':(mode==='auto'?'hold':'wait');}}
  else if(phase==='hold'){if(pt>=(b.hold!=null?b.hold:(b.say?HOLD:.1)))enter(bi+1);}}
function next(){if(phase==='end'){enter(0);return;}if(bi<BEATS.length-1)enter(bi+1);}
function prev(){const back_=(phase==='lead'&&pt<.4)||(phase!=='lead'&&s-BEATS[bi].s<.2&&phase==='play');enter(Math.max(0,back_?bi-1:bi));}
function advance(){
  if(phase==='wait'||phase==='end'){next();return;}
  if(phase==='lead'){phase='play';pt=0;return;}
  if(phase==='play'){s=BEATS[bi].e-1e-4;phase=bi===BEATS.length-1?'end':'wait';pt=0;}}

const pp=document.getElementById('pp'),scrub=document.getElementById('scrub'),time=document.getElementById('time'),spd=document.getElementById('spd'),
  snd=document.getElementById('snd'),fs=document.getElementById('fs'),player=document.getElementById('player'),
  mAuto=document.getElementById('mAuto'),mClick=document.getElementById('mClick');
scrub.min=-6;scrub.max=END;
const I={play:'<svg viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></svg>',pause:'<svg viewBox="0 0 24 24"><path d="M6 4h4v16H6zm8 0h4v16h-4z"/></svg>',
  replay:'<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>',
  on:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>',
  off:'<svg viewBox="0 0 24 24"><path d="M4 9h4l5-4v14l-5-4H4zm12.6 3l2.7-2.7 1.4 1.4-2.7 2.7 2.7 2.7-1.4 1.4-2.7-2.7-2.7 2.7-1.4-1.4 2.7-2.7-2.7-2.7 1.4-1.4z"/></svg>'};
function ui(){const end=phase==='end';pp.innerHTML=end?I.replay:(paused?I.play:I.pause);pp.setAttribute('aria-label',end?'Replay':(paused?'Play':'Pause'));
  snd.innerHTML=(soundOn?I.on:I.off)+'<span>'+(soundOn?'Sound on':'Sound off')+'</span>';snd.setAttribute('aria-label',soundOn?'Turn sound off':'Turn sound on');
  mAuto.setAttribute('aria-pressed',mode==='auto');mClick.setAttribute('aria-pressed',mode==='click');
  const ci=chapAt(s);[...chapEl.children].forEach((b,j)=>b.classList.toggle('on',j===ci));}
function togglePause(){ensureAudio();if(soundOn)musicOn(true);if(phase==='end'){enter(0);paused=false;}else paused=!paused;ui();}
pp.onclick=togglePause;
document.getElementById('next').onclick=()=>{paused=false;next();ui();};
document.getElementById('prev').onclick=()=>{paused=false;prev();ui();};
cv.onclick=()=>{ensureAudio();if(mode==='click'){paused=false;advance();ui();}else togglePause();};
document.addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.target.tagName==='BUTTON'&&e.code==='Space')return;
  if(e.code==='Space'){e.preventDefault();if(mode==='click'){paused=false;advance();}else togglePause();ui();}
  else if(e.code==='ArrowRight'){e.preventDefault();paused=false;if(mode==='click')advance();else next();ui();}
  else if(e.code==='ArrowLeft'){e.preventDefault();paused=false;prev();ui();}});
mAuto.onclick=()=>{mode='auto';if(phase==='wait'){phase='hold';pt=0;}ui();};
mClick.onclick=()=>{mode='click';if(phase==='hold')phase='wait';ui();};
scrub.addEventListener('input',()=>{const v=+scrub.value;let i=0;BEATS.forEach((b,j)=>{if(v>=b.s)i=j;});bi=i;s=Math.min(v,BEATS[i].e);phase='play';pt=0;
  camFrom=BEATS[i].cam.slice();camT0=0;bubbleT0=0;ui();});
const SPEEDS=[.5,.75,1,1.25,1.5,2],spdMenu=document.getElementById('spdMenu'),spdWrap=document.getElementById('speedWrap');
const spdLabel=v=>v+'×';
SPEEDS.forEach(v=>{const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitemradio');b.dataset.v=v;
  b.textContent=v===1?'1× normal':spdLabel(v);b.onclick=e=>{e.stopPropagation();setSpeed(v);closeSpd(true);};spdMenu.appendChild(b);});
function setSpeed(v){speedMul=v;spd.textContent=spdLabel(v);spd.setAttribute('aria-label','Playback speed '+spdLabel(v));
  [...spdMenu.querySelectorAll('button')].forEach(b=>b.setAttribute('aria-checked',+b.dataset.v===v));}
function openSpd(){spdMenu.hidden=false;spd.setAttribute('aria-expanded','true');
  (spdMenu.querySelector('[aria-checked="true"]')||spdMenu.querySelector('button')).focus();}
function closeSpd(refocus){if(spdMenu.hidden)return;spdMenu.hidden=true;spd.setAttribute('aria-expanded','false');if(refocus)spd.focus();}
spd.onclick=e=>{e.stopPropagation();spdMenu.hidden?openSpd():closeSpd();};
document.addEventListener('click',e=>{if(!spdWrap.contains(e.target))closeSpd();});
spdMenu.addEventListener('keydown',e=>{const items=[...spdMenu.querySelectorAll('button')],i=items.indexOf(document.activeElement);
  if(e.key==='Escape'){e.preventDefault();closeSpd(true);}
  else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();items[(i+(e.key==='ArrowDown'?1:items.length-1))%items.length].focus();}
  e.stopPropagation();});
setSpeed(speedMul);
snd.onclick=()=>{soundOn=!soundOn;if(soundOn){ensureAudio();musicOn(true);}else musicOn(false);ui();};
fs.onclick=()=>{try{if(document.fullscreenElement)document.exitFullscreen();else{const r=player.requestFullscreen&&player.requestFullscreen();if(r&&r.catch)r.catch(()=>{});}}catch(e){}};
const chapEl=document.getElementById('chapters');
CHAPS.forEach((c,i)=>{const b=document.createElement('button');b.className='chap';b.type='button';b.innerHTML='<span class="n">'+(i+1)+'</span>'+c[3];
  b.onclick=()=>{const k=BEATS.findIndex(x=>x.s>=c[0]);paused=false;enter(k);ensureAudio();ui();};chapEl.appendChild(b);});

// ---------- capture hook for MP4 rendering (inactive in normal viewing) ----------
function wavB64(buf){const ch=buf.numberOfChannels,len=buf.length,sr=buf.sampleRate,dv=new DataView(new ArrayBuffer(44+len*ch*2));
  const w=(o,str)=>{for(let i=0;i<str.length;i++)dv.setUint8(o+i,str.charCodeAt(i));};
  w(0,'RIFF');dv.setUint32(4,36+len*ch*2,true);w(8,'WAVE');w(12,'fmt ');dv.setUint32(16,16,true);dv.setUint16(20,1,true);dv.setUint16(22,ch,true);
  dv.setUint32(24,sr,true);dv.setUint32(28,sr*ch*2,true);dv.setUint16(32,ch*2,true);dv.setUint16(34,16,true);w(36,'data');dv.setUint32(40,len*ch*2,true);
  const data=[];for(let c=0;c<ch;c++)data.push(buf.getChannelData(c));let o=44;
  for(let i=0;i<len;i++)for(let c=0;c<ch;c++){const v=Math.max(-1,Math.min(1,data[c][i]));dv.setInt16(o,v<0?v*0x8000:v*0x7FFF,true);o+=2;}
  const u8=new Uint8Array(dv.buffer);let bin='';for(let i=0;i<u8.length;i+=0x8000)bin+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(bin);}
window.__storify={
  begin(sc=1.5){CAPTURE=true;cv.width=Math.round(W*sc);cv.height=Math.round(H*sc);BASE=sc;mode='auto';paused=false;speedMul=1;VCLOCK=0;
    LOG.length=0;LOGC.length=0;LOGD.length=0;lastChap=-1;duck=-1;enter(0,true);},
  step(ms){VCLOCK+=ms;update(ms/1000);
    const ci=chapAt(s);if(ci!==lastChap){lastChap=ci;chapT0=NOW();LOGC.push({t:VCLOCK/1000,ci});}
    const d=phase==='lead'?.55:1;if(d!==duck){duck=d;LOGD.push({t:VCLOCK/1000,d});}
    render(s);return phase==='end';},
  info(){return {bi,phase,s,n:BEATS.length,say:BEATS[bi].say,end:END,R0};},
  frame(q=.9){return cv.toDataURL('image/jpeg',q).split(',')[1];},
  async audio(dur){const sr=44100,oc=new OfflineAudioContext(2,Math.ceil(sr*dur),sr);
    const keep=[ac,master,musicBus];ac=oc;master=oc.createGain();master.gain.value=.55;master.connect(oc.destination);
    musicBus=oc.createGain();musicBus.connect(master);
    LOGD.forEach(e=>musicBus.gain.setTargetAtTime(e.d,e.t,.25));
    const chapAtT=tt=>{let c=0;LOGC.forEach(e=>{if(e.t<=tt)c=e.ci;});return c;};
    for(let n=0,tt=.05;tt<dur;n++,tt+=.3){const m=MUS[chapAtT(tt)],note=m.seq[n%m.seq.length];
      if(note)toneAt(mtof(note),.5,'triangle',m.v,tt,musicBus);if(n%8===0)toneAt(mtof(m.root),1.6,'sine',.07,tt,musicBus);}
    LOG.forEach(e=>{AT=e.t;SFX[e.name]();});AT=null;
    const buf=await oc.startRendering();[ac,master,musicBus]=keep;return wavB64(buf);}
};

function fit(){if(CAPTURE)return;const dpr=Math.min(2,window.devicePixelRatio||1),w=cv.clientWidth||W;cv.width=Math.round(w*dpr);cv.height=Math.round(w*9/16*dpr);BASE=cv.width/W;}
new ResizeObserver(fit).observe(cv);fit();
let last=performance.now();
function frame(now){if(CAPTURE){requestAnimationFrame(frame);return;}const dt=Math.min(.1,(now-last)/1000);last=now;
  update(dt);if(soundOn)setDuck();
  const ci=chapAt(s);if(ci!==lastChap){lastChap=ci;chapT0=NOW();ui();}
  render(s);if(document.activeElement!==scrub)scrub.value=s;time.textContent=(bi+1)+' / '+BEATS.length;
  if(phase==='end'&&pp.getAttribute('aria-label')!=='Replay')ui();
  requestAnimationFrame(frame);}
ui();
const start=()=>{enter(0,true);if(reduce){bi=3;s=BEATS[3].e-1e-4;phase='wait';mode='click';ui();}requestAnimationFrame(n=>{last=n;frame(n);});};
if(document.fonts&&document.fonts.load){Promise.race([Promise.all([document.fonts.load('26px "Patrick Hand"'),document.fonts.load('12px "IBM Plex Mono"')]),new Promise(r=>setTimeout(r,1500))]).then(start,start);}else start();
})();
