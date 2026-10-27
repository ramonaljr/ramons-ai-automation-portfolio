(function(){
const W = 1280, H = 720;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let VCLOCK=null,CAPTURE=false,AT=null;const NOW=()=>VCLOCK??performance.now();const LOG=[],LOGC=[],LOGD=[];
const cv = document.getElementById('film'), ctx = cv.getContext('2d');
const HAND = '"Patrick Hand","Comic Sans MS",cursive', MONO = '"IBM Plex Mono",ui-monospace,monospace';
const INK='#2B2621', PAPER='#F1E9D8', STRIPE='#C5D3DB', WOOD='#AE7A45', WOOD_D='#7E5227',
      SAND='#E8D6AA', PAPERW='#FCF9F1', SCREEN='#262439',
      BULB='#F2C14E', RED='#C8452F', AMBER='#D08A2E', TEAL='#2B8C82', BLUE='#4F74B8', RING='#D2553F', GREEN='#3E9A5B';
/* ---------- helpers ---------- */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const seg=(t,a,b)=>clamp((t-a)/(b-a),0,1);
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
const back=x=>{const c1=1.70158,c3=c1+1;return x<=0?0:1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
const inAny=(t,iv)=>!!iv&&iv.some(([a,b])=>t>=a&&t<b);
const ivVal=(iv,t)=>{if(!iv)return null;let v=null;iv.forEach(r=>{if(t>=r[0]&&t<r[1])v=r[2];});return v;};
const stepVal=(k,t,d)=>{if(!k)return d;let v=d;k.forEach(([a,x])=>{if(t>=a)v=x;});return v;};
function track(k,t){if(t<=k[0][0])return k[0][1];for(let i=1;i<k.length;i++){if(t<=k[i][0]){const[a,v0]=k[i-1],[b,v1]=k[i];return v0+(v1-v0)*ease(seg(t,a,b));}}return k[k.length-1][1];}
function hsh(n){n=Math.sin(n*127.1+311.7)*43758.5453;return n-Math.floor(n);}
let BOIL=0, A=0, GX=0;
const jit=(s,i,a)=>(hsh(s*13.37+i*7.13+BOIL*3.1)-.5)*2*a;

function densify(p,closed,step){const o=[],n=p.length,m=closed?n:n-1;for(let i=0;i<m;i++){const a=p[i],b=p[(i+1)%n],d=Math.hypot(b[0]-a[0],b[1]-a[1]),k=Math.max(1,Math.ceil(d/step));for(let j=0;j<k;j++)o.push([a[0]+(b[0]-a[0])*j/k,a[1]+(b[1]-a[1])*j/k]);}if(!closed)o.push(p[n-1]);return o;}
function rr(x,y,w,h,r){r=Math.min(r,w/2,h/2);const p=[],c=[[x+w-r,y+r,-Math.PI/2],[x+w-r,y+h-r,0],[x+r,y+h-r,Math.PI/2],[x+r,y+r,Math.PI]];for(const[cx,cy,a0]of c)for(let k=0;k<=5;k++){const a=a0+k/5*Math.PI/2;p.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}return densify(p,true,10);}
function ell(cx,cy,rx,ry,n=18){const p=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2;p.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry]);}return p;}
function ln(x1,y1,x2,y2){return densify([[x1,y1],[x2,y2]],false,12);}
function sk(pts,o={}){
  const {closed=true,seed=1,amp=1.1,fill=null,stroke=INK,lw=2.2,passes=2}=o;
  if(fill){ctx.beginPath();pts.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.fillStyle=fill;ctx.fill();}
  if(!stroke)return;
  ctx.strokeStyle=stroke;ctx.lineWidth=lw;ctx.lineJoin='round';ctx.lineCap='round';
  const ga=ctx.globalAlpha;
  for(let q=0;q<passes;q++){ctx.globalAlpha=ga*(q?.4:1);ctx.beginPath();const n=pts.length,L=closed?n+1:n;
    for(let i=0;i<L;i++){const p=pts[i%n],x=p[0]+jit(seed+q*5,i%n,amp),y=p[1]+jit(seed+q*5+99,i%n,amp);i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
  ctx.globalAlpha=ga;
}
function txt(s,x,y,{size=20,color=INK,align='center',font=HAND,base='middle',weight=''}={}){ctx.font=(weight?weight+' ':'')+size+'px '+font;ctx.fillStyle=color;ctx.textAlign=align;ctx.textBaseline=base;ctx.fillText(s,x,y);}
function dot(x,y,r,c){ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fillStyle=c;ctx.fill();}
function plank(x,y,w,h,seed,color=WOOD){
  sk(rr(x,y,w,h,3),{seed,fill:color,amp:.8,lw:2});
  ctx.strokeStyle='rgba(70,40,15,.35)';ctx.lineWidth=1.1;
  const horiz=w>=h;
  for(let k=1;k<=2;k++){ctx.beginPath();
    if(horiz){const yy=y+h*k/3;for(let xx=x+6;xx<=x+w-6;xx+=12){const yj=yy+Math.sin(xx*.05+seed+k)*1.2;xx===x+6?ctx.moveTo(xx,yj):ctx.lineTo(xx,yj);}}
    else{const xx=x+w*k/3;for(let yy=y+6;yy<=y+h-6;yy+=12){const xj=xx+Math.sin(yy*.05+seed+k)*1.2;yy===y+6?ctx.moveTo(xj,yy):ctx.lineTo(xj,yy);}}
    ctx.stroke();}
  if(horiz){dot(x+6,y+h/2,1.8,INK);dot(x+w-6,y+h/2,1.8,INK);}else{dot(x+w/2,y+6,1.8,INK);dot(x+w/2,y+h-6,1.8,INK);}
}
function tag(s,x,y,{size=16,seed=7,font=HAND,fill=PAPERW,color=INK}={}){
  ctx.font=size+'px '+font;const w=ctx.measureText(s).width+18,h=size+12;
  sk(rr(x-w/2,y-h/2,w,h,3),{seed,fill,lw:1.6,amp:.6});txt(s,x,y+1,{size,font,color});
}
function hatch(x,y,w,h,color,seed){
  sk(rr(x,y,w,h,2),{seed,fill:color+'33',stroke:color,lw:2,amp:.8});
  ctx.save();ctx.beginPath();ctx.rect(x+2,y+2,w-4,h-4);ctx.clip();ctx.strokeStyle=color;ctx.lineWidth=1.6;ctx.globalAlpha*=.7;
  for(let k=-h;k<w;k+=8){ctx.beginPath();ctx.moveTo(x+k+jit(seed,k,1),y+h);ctx.lineTo(x+k+h+jit(seed+3,k,1),y);ctx.stroke();}ctx.restore();
}
function wrapW(str,size,maxW){ctx.font=size+'px '+HAND;const words=str.split(' '),lines=[];let cur='';
  words.forEach(w=>{const tr=cur?cur+' '+w:w;if(ctx.measureText(tr).width>maxW&&cur){lines.push(cur);cur=w;}else cur=tr;});lines.push(cur);return lines;}
function lum(hex){const n=parseInt(hex.slice(1),16);return (.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255;}

/* ---------- cached background ---------- */
const bg=document.createElement('canvas');bg.width=W*2;bg.height=H*2;
(function(){const b=bg.getContext('2d');b.scale(2,2);
  b.fillStyle=PAPER;b.fillRect(0,0,W,H);
  b.fillStyle=STRIPE;b.globalAlpha=.6;
  for(let k=-H;k<W+H;k+=170){b.beginPath();b.moveTo(k,0);b.lineTo(k+85,0);b.lineTo(k+85-H,H);b.lineTo(k-H,H);b.closePath();b.fill();}
  b.globalAlpha=1;
  b.strokeStyle='rgba(43,38,33,.10)';b.lineWidth=1;
  [230,360].forEach(r=>{b.beginPath();b.arc(660,600,r,Math.PI,2*Math.PI);b.stroke();});
  for(let a=0;a<=72;a++){const g=Math.PI+a/72*Math.PI,r1=360,r2=a%6?368:380;b.beginPath();b.moveTo(660+Math.cos(g)*r1,600+Math.sin(g)*r1);b.lineTo(660+Math.cos(g)*r2,600+Math.sin(g)*r2);b.stroke();}
  b.beginPath();b.moveTo(660,230);b.lineTo(660,600);b.moveTo(250,470);b.lineTo(1080,470);b.stroke();
  b.fillStyle='#ECE2CA';b.fillRect(0,598,W,H-598);
  b.strokeStyle=INK;b.lineWidth=2;b.beginPath();for(let x=0;x<=W;x+=14){const y=598+Math.sin(x*.03)*1.2+(Math.random()-.5)*1.2;x?b.lineTo(x,y):b.moveTo(x,y);}b.stroke();
  for(let i=0;i<260;i++){b.fillStyle='rgba(120,95,60,.35)';b.beginPath();b.arc(Math.random()*W,606+Math.random()*110,Math.random()*1.6+.4,0,7);b.fill();}
  for(let i=0;i<12000;i++){b.fillStyle='rgba(60,45,30,'+(Math.random()*.06)+')';b.fillRect(Math.random()*W,Math.random()*H,1,1);}
})();

/* ---------- cast (whole roster, tested drawer) ---------- */
function shade(hex,f){const n=parseInt(hex.slice(1),16);const c=[n>>16,(n>>8)&255,n&255].map(v=>Math.max(0,Math.min(255,Math.round(v*f))));return '#'+c.map(v=>v.toString(16).padStart(2,'0')).join('');}
const CAST={
  dennice:{name:'Dennice',role:'analyst · protagonist',body:'#8C95EC',w:80,h:70,r:28,head:'bulb'},
  keith:{name:'Keith',role:'data engineer',body:'#F08A6E',w:74,h:86,r:26,head:'twin',badge:'DATA'},
  unix:{name:'Unix',role:'baby developer',body:'#7CC9A8',w:62,h:56,r:28,head:'leaf'},
  karan:{name:'Karan',role:'manager',body:'#E7B94C',w:82,h:72,r:10,head:'none',visor:true,tie:true},
  ian:{name:'Ian',role:'full-stack developer',body:'#A884D8',w:96,h:62,r:30,head:'dish',glasses:true},
  chris:{name:'Chris',role:'lead data engineer',body:'#62B4E4',w:64,h:92,r:22,head:'spring'},
  isa:{name:'Isa',role:'senior data & martech consultant',body:'#E98FB6',w:76,h:66,r:33,head:'star'},
  jeson:{name:'Jeson',role:'data engineer',body:'#93AA5C',w:94,h:74,r:18,head:'cap'},
  joeen:{name:'Joeen',role:'data engineer',body:'#B8906C',w:72,h:76,r:24,head:'phones'},
  vlada:{name:'Vlada',role:'dbt developer',body:'#F4A259',w:70,h:74,r:26,head:'bun'},
  cannon:{name:'Cannon',role:'QA tester',body:'#98A6B5',w:84,h:70,r:16,head:'flag'},
  wilber:{name:'Wilber',role:'VP of engineering',body:'#4F6DB0',w:78,h:94,r:24,head:'tuft',bowtie:true},
  samantha:{name:'Samantha',role:'BI developer',body:'#F7C3A1',w:72,h:68,r:34,head:'flower'},
  leo:{name:'Leo',role:'BI developer',body:'#BCD65A',w:70,h:72,r:22,head:'beanie'},
  rachelle:{name:'Rachelle',role:'dbt developer',body:'#72D1C8',w:68,h:80,r:30,head:'twinbuns'},
  jomari:{name:'Jomari',role:'Salesforce',body:'#A9D6F5',w:86,h:66,r:32,head:'cloud'},
  mark:{name:'Mark',role:'founder',body:'#D35454',w:82,h:82,r:30,head:'crown'},
  jack:{name:'Jack',role:'martech consultant',body:'#4E9E6E',w:76,h:74,r:20,head:'wifi'},
  david:{name:'David',role:'solutions architect',body:'#D9C58E',w:86,h:80,r:14,head:'hardhat'},
  ryan:{name:'Ryan',role:'Salesforce developer',body:'#3F7FD6',w:72,h:70,r:26,head:'code'},
  beth:{name:'Beth',role:'head of training',body:'#C860B4',w:74,h:78,r:28,head:'gradcap'},
  dean:{name:'Dean',role:'data engineer',body:'#7F9C96',w:88,h:72,r:18,head:'gear'},
  carlos:{name:'Carlos',role:'data director',body:'#9C4A5E',w:80,h:88,r:24,head:'none',glasses:true,mustache:true},
  diego:{name:'Diego',role:'AI director',body:'#7A5CC7',w:78,h:84,r:28,head:'orbit'},
  myk:{name:'Myk',role:'HR lead',body:'#F29E9E',w:74,h:70,r:32,head:'heart'},
  mj:{name:'MJ',role:'dbt developer',body:'#B07AA1',w:76,h:72,r:20,head:'propeller'}};
for(const k in CAST){const c=CAST[k];c.key=k;if(!c.dark)c.dark=shade(c.body,.72);}
function heartPath(cx,cy,s){ctx.beginPath();ctx.moveTo(cx,cy+s*.9);ctx.bezierCurveTo(cx-s*1.4,cy-s*.1,cx-s*.7,cy-s*1.2,cx,cy-s*.45);ctx.bezierCurveTo(cx+s*.7,cy-s*1.2,cx+s*1.4,cy-s*.1,cx,cy+s*.9);ctx.closePath();}
function drawHead(c,W2,hb,t,seed){
  const stem=(len)=>sk(ln(0,hb,0,hb-len),{closed:false,seed:seed+6,lw:2.5,passes:1,amp:.3});
  switch(c.head){
  case 'bulb':sk(ln(0,hb,3,hb-15),{closed:false,seed:seed+6,lw:2.5,passes:1,amp:.4});
    ctx.globalAlpha*=.35+.25*Math.sin(t*4);dot(3,hb-20,9,BULB);ctx.globalAlpha=1;sk(ell(3,hb-20,5,5,10),{seed:seed+7,fill:BULB,lw:1.8,amp:.3});break;
  case 'twin':[-1,1].forEach(k=>{sk(ln(k*W2*.4,hb+2,k*W2*.55,hb-12),{closed:false,seed:seed+8+k,lw:2.5,passes:1,amp:.4});
    sk(ell(k*W2*.55,hb-15,4.5,4.5,10),{seed:seed+10+k,fill:c.dark,lw:1.6,amp:.3});});break;
  case 'leaf':ctx.strokeStyle=INK;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,hb);ctx.quadraticCurveTo(-2,hb-10,4,hb-15);ctx.stroke();
    ctx.save();ctx.translate(8,hb-17);ctx.rotate(-.5+Math.sin(t*2)*.12);sk(ell(0,0,8,4,12),{seed:seed+12,fill:'#8FD694',lw:1.6,amp:.3});ctx.restore();break;
  case 'spring':ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(0,hb);
    for(let k=1;k<=6;k++)ctx.lineTo((k%2?-5:5),hb-k*3.2);ctx.stroke();sk(ell(0,hb-23+Math.sin(t*5)*1.5,5,5,10),{seed:seed+30,fill:'#FF8A5B',lw:1.8,amp:.3});break;
  case 'star':{stem(12);const p=[];for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5+Math.sin(t*2)*.1,r=k%2?3.6:8;p.push([Math.cos(a)*r,hb-19+Math.sin(a)*r]);}
    sk(p,{seed:seed+32,fill:BULB,lw:1.6,amp:.3});break;}
  case 'cap':sk(rr(-W2*.55,hb-12,W2*1.1,16,8),{seed:seed+33,fill:'#E4572E',lw:2});sk(rr(-W2*.1,hb-2,W2*.95,7,3),{seed:seed+34,fill:'#C0431F',lw:1.8,amp:.4});break;
  case 'phones':ctx.strokeStyle=c.dark;ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,hb+14,W2+2,Math.PI*1.12,Math.PI*1.88);ctx.stroke();
    ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();[-1,1].forEach(k=>sk(rr(k*(W2+2)-7,hb+c.h*.18,14,22,5),{seed:seed+35+k,fill:'#3B3140',lw:1.8,amp:.4}));break;
  case 'dish':stem(8);ctx.beginPath();ctx.arc(0,hb-10,9,Math.PI*1.05,Math.PI*1.95);ctx.closePath();ctx.fillStyle=c.dark;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();break;
  case 'bun':sk(ell(0,hb-7,10,9,14),{seed:seed+40,fill:c.dark,lw:2});sk(rr(-7,hb-2,14,4,2),{seed:seed+41,fill:'#E4572E',lw:1.4,amp:.3});break;
  case 'twinbuns':[-1,1].forEach(k=>sk(ell(k*W2*.55,hb-2,8,8,12),{seed:seed+42+k,fill:c.dark,lw:2,amp:.4}));break;
  case 'tuft':ctx.strokeStyle=c.dark;ctx.lineWidth=3.2;ctx.lineCap='round';[[-7,-11,-12],[0,-1,-18],[7,11,-13]].forEach(([a,b,h])=>{ctx.beginPath();ctx.moveTo(a,hb+1);ctx.quadraticCurveTo(a,hb+h*.6,b,hb+h);ctx.stroke();});break;
  case 'flower':stem(12);for(let k=0;k<5;k++){const a=k/5*Math.PI*2+Math.sin(t*1.5)*.2;sk(ell(Math.cos(a)*5.5,hb-18+Math.sin(a)*5.5,4.4,4.4,10),{seed:seed+44+k,fill:'#FFF1F6',lw:1.3,amp:.2});}dot(0,hb-18,3.2,BULB);break;
  case 'beanie':{const R=W2*.66;ctx.beginPath();ctx.arc(0,hb+9,R,Math.PI,2*Math.PI);ctx.closePath();ctx.fillStyle='#3E6FB0';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
    sk(rr(-R-2,hb+3,2*R+4,8,3),{seed:seed+50,fill:'#2F5A94',lw:1.6,amp:.3});sk(ell(0,hb+9-R-4,6,6,10),{seed:seed+51,fill:'#fff',lw:1.6,amp:.3});break;}
  case 'cloud':stem(12);[[-6,-18,6],[1,-23,7.5],[8,-18,6],[1,-16,6]].forEach(([a,b,r],i)=>sk(ell(a,hb+b,r,r*.85,12),{seed:seed+52+i,fill:'#fff',lw:1.4,amp:.3,stroke:i==3?null:INK}));break;
  case 'crown':sk([[-13,hb+2],[-13,hb-10],[-6,hb-4],[0,hb-14],[6,hb-4],[13,hb-10],[13,hb+2]],{seed:seed+56,fill:BULB,lw:1.8,amp:.3});dot(0,hb-5,2,RED);break;
  case 'wifi':dot(0,hb-5,3,INK);ctx.strokeStyle=INK;ctx.lineWidth=2.4;[8,14].forEach((r,i)=>{ctx.globalAlpha=.5+.5*Math.max(0,Math.sin(t*5-i));ctx.beginPath();ctx.arc(0,hb-3,r,1.25*Math.PI,1.75*Math.PI);ctx.stroke();});ctx.globalAlpha=1;break;
  case 'hardhat':{const R=W2*.72;ctx.beginPath();ctx.arc(0,hb+7,R,Math.PI,2*Math.PI);ctx.closePath();ctx.fillStyle=BULB;ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.stroke();
    sk(rr(-R-6,hb+3,2*R+12,6,3),{seed:seed+57,fill:'#D9A520',lw:1.6,amp:.3});sk(ln(0,hb+7-R,0,hb+4),{closed:false,seed:seed+58,lw:2,passes:1,amp:.2});break;}
  case 'code':stem(10);sk(rr(-14,hb-26,28,16,4),{seed:seed+59,fill:SCREEN,lw:1.6,amp:.3});txt('</>',0,hb-17.5,{size:10,font:MONO,color:'#9FE0FF'});break;
  case 'gradcap':sk(rr(-9,hb-7,18,8,2),{seed:seed+60,fill:'#2B2B35',lw:1.6,amp:.3});sk([[-19,hb-9],[0,hb-16],[19,hb-9],[0,hb-2]],{seed:seed+61,fill:'#2B2B35',lw:1.6,amp:.3});
    ctx.strokeStyle=BULB;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,hb-9);ctx.lineTo(15,hb-6+Math.sin(t*3));ctx.lineTo(15,hb+5+Math.sin(t*3));ctx.stroke();break;
  case 'gear':{stem(10);const p=[];for(let k=0;k<16;k++){const a=k/16*Math.PI*2+t*1.2,r=k%2?6:9.5;p.push([Math.cos(a)*r,hb-20+Math.sin(a)*r]);}sk(p,{seed:seed+62,fill:'#B7C0C8',lw:1.6,amp:.2});dot(0,hb-20,2.6,INK);break;}
  case 'orbit':stem(10);dot(0,hb-19,5,BULB);ctx.save();ctx.translate(0,hb-19);ctx.rotate(t*1.5);ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(0,0,13,4.5,0,0,7);ctx.stroke();
    dot(13*Math.cos(t*4),4.5*Math.sin(t*4),2.4,'#9FE0FF');ctx.restore();break;
  case 'heart':stem(10);heartPath(0,hb-19+Math.sin(t*4)*1.2,8);ctx.fillStyle='#E5537A';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.stroke();break;
  case 'propeller':{ctx.beginPath();ctx.arc(0,hb+3,12,Math.PI,2*Math.PI);ctx.closePath();ctx.fillStyle='#E4572E';ctx.fill();ctx.strokeStyle=INK;ctx.lineWidth=1.8;ctx.stroke();
    sk(ln(0,hb-9,0,hb-15),{closed:false,seed:seed+67,lw:2,passes:1,amp:.2});const sp=Math.abs(Math.cos(t*14));
    ctx.fillStyle=BULB;ctx.beginPath();ctx.ellipse(-7*sp,hb-16,8*sp+1.5,2.6,0,0,7);ctx.fill();ctx.fillStyle='#3F7FD6';ctx.beginPath();ctx.ellipse(7*sp,hb-16,8*sp+1.5,2.6,0,0,7);ctx.fill();dot(0,hb-16,2,INK);break;}
  case 'flag':stem(22);sk(rr(0,hb-22,17,11,1),{seed:seed+63,fill:'#2E9E5B',lw:1.5,amp:.2});ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(4,hb-17);ctx.lineTo(7,hb-14);ctx.lineTo(13,hb-20);ctx.stroke();break;
  }
}
function drawChar(c,x,fy,o){
  const {pose='idle',mood='normal',walking=false,sw=0,dir=1,gx=0,t=0}=o;
  const W2=c.w/2,H=c.h,top=-16-H,kx=c.w/80,ky=H/70,seed=c.name.length*37+c.w;
  ctx.save();ctx.translate(x,fy);ctx.scale(dir,1);
  ctx.save();ctx.globalAlpha*=.25;ctx.fillStyle=INK;ctx.beginPath();ctx.ellipse(0,2,W2*.75,4,0,0,7);ctx.fill();ctx.restore();
  const lx=Math.min(13,W2*.35);
  sk(ln(-lx,-18,-lx+sw,-5),{closed:false,seed:seed+1,lw:4,stroke:c.dark,amp:.4,passes:1});
  sk(ln(lx,-18,lx-sw,-5),{closed:false,seed:seed+2,lw:4,stroke:c.dark,amp:.4,passes:1});
  sk(ell(-lx-1+sw,-4,10,5),{seed:seed+3,fill:c.dark,lw:1.8,amp:.4});sk(ell(lx+1-sw,-4,10,5),{seed:seed+4,fill:c.dark,lw:1.8,amp:.4});
  sk(rr(-W2,top,c.w,H,c.r),{seed:seed+5,fill:c.body,lw:2.4});
  ctx.save();ctx.fillStyle='rgba(255,255,255,.18)';ctx.beginPath();ctx.ellipse(-W2*.45,top+H*.8,W2*.25,6,-.5,0,7);ctx.fill();ctx.restore();
  drawHead(c,W2,top,t,seed);
  const scW=c.visor?c.w*.8:Math.min(56,c.w*.7),scH=c.visor?18:Math.min(34,H*.48),scY=top+9,ey=scY+scH*.42;
  sk(rr(-scW/2,scY,scW,scH,c.visor?7:12),{seed:seed+14,fill:SCREEN,lw:2});
  const ex=c.visor?[-scW*.2,scW*.2]:[-11,11];
  ctx.strokeStyle='#fff';ctx.fillStyle='#fff';ctx.lineWidth=3;ctx.lineCap='round';
  if(c.visor){
    const eh=mood==='happy'?2:mood==='alert'?7:mood==='tired'?2:(t%3.7<.12?1:5);
    ex.forEach(e=>{ctx.fillRect(e-7+gx*dir,ey-eh/2+1,14,eh);});
    ctx.strokeStyle=INK;ctx.lineWidth=2.4;ctx.beginPath();
    if(mood==='happy')ctx.arc(0,scY+scH+8,7,.15*Math.PI,.85*Math.PI);else if(mood==='alert')ctx.arc(0,scY+scH+12,4,0,7);else{ctx.moveTo(-6,scY+scH+12);ctx.lineTo(6,scY+scH+12);}ctx.stroke();
  } else {
    const my=scY+scH*.78;
    if(mood==='happy'){ex.forEach(e=>{ctx.beginPath();ctx.arc(e,ey+3,5,Math.PI*1.1,Math.PI*1.9);ctx.stroke();});ctx.beginPath();ctx.arc(0,my-5,6,.15*Math.PI,.85*Math.PI);ctx.stroke();}
    else if(mood==='calm'){ex.forEach(e=>{ctx.beginPath();ctx.arc(e,ey-2,5,.15*Math.PI,.85*Math.PI);ctx.stroke();});ctx.beginPath();ctx.arc(0,my-6,4,.2*Math.PI,.8*Math.PI);ctx.stroke();}
    else if(mood==='tired'){ex.forEach(e=>{ctx.beginPath();ctx.ellipse(e,ey+2,4.5,2.6,0,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(e-7,ey-2);ctx.lineTo(e+7,ey-2);ctx.stroke();});ctx.beginPath();ctx.moveTo(-5,my);ctx.lineTo(5,my-1);ctx.stroke();}
    else if(mood==='alert'){ex.forEach(e=>{dot(e,ey,6.5,'#fff');dot(e+gx*dir,ey,2.6,SCREEN);});ctx.beginPath();ctx.arc(0,my,3.5,0,7);ctx.stroke();}
    else if(mood==='puzzled'){ctx.beginPath();ctx.ellipse(ex[0]+gx*dir,ey,3.6,6,0,0,7);ctx.fill();ctx.beginPath();ctx.ellipse(ex[1]+gx*dir,ey+1,2.6,3,0,0,7);ctx.fill();
      ctx.beginPath();ctx.moveTo(-6,my);ctx.quadraticCurveTo(-2,my-4,1,my);ctx.quadraticCurveTo(4,my+4,7,my);ctx.stroke();}
    else{const bl=(t%3.7)<.12?1:6;ex.forEach(e=>{ctx.beginPath();ctx.ellipse(e+gx*dir,ey,3.6,bl,0,0,7);ctx.fill();});ctx.beginPath();ctx.arc(0,my-6,5,.2*Math.PI,.8*Math.PI);ctx.stroke();}
    if(c.glasses){ctx.strokeStyle='#E9E4FF';ctx.lineWidth=1.6;ex.forEach(e=>{ctx.beginPath();ctx.arc(e,ey,9,0,7);ctx.stroke();});ctx.beginPath();ctx.moveTo(ex[0]+9,ey);ctx.lineTo(ex[1]-9,ey);ctx.stroke();}
    if(c.mustache){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(0,my-9);ctx.quadraticCurveTo(-9,my-13,-13,my-6);ctx.quadraticCurveTo(-6,my-8,0,my-6);ctx.quadraticCurveTo(6,my-8,13,my-6);ctx.quadraticCurveTo(9,my-13,0,my-9);ctx.fill();}
  }
  if(c.tie){const y0=scY+scH+18;sk([[-4,y0],[4,y0],[6,y0+22],[0,y0+28],[-6,y0+22]],{seed:seed+64,fill:'#2E5E9E',lw:1.6,amp:.2});}
  if(c.bowtie){const y0=scY+scH+9;sk([[0,y0],[-11,y0-6],[-11,y0+6]],{seed:seed+65,fill:RED,lw:1.6,amp:.2});sk([[0,y0],[11,y0-6],[11,y0+6]],{seed:seed+66,fill:RED,lw:1.6,amp:.2});dot(0,y0,2.6,RED);}
  if(c.badge){const by=top+H*.62;sk(rr(-18,by,36,16,3),{seed:seed+15,fill:PAPERW,lw:1.4,amp:.4});txt(c.badge,0,by+8.5,{size:9,font:MONO,color:c.dark});}
  if(pose==='type'){sk(rr(-27,-42,54,20,3),{seed:seed+16,fill:'#3A4260',lw:1.8,amp:.4});ctx.fillStyle='#9FB0FF';ctx.fillRect(-20,-37,26,2.5);ctx.fillRect(-20,-31,34,2.5);
    sk(rr(-33,-23,66,7,3),{seed:seed+17,fill:'#2B3246',lw:1.8,amp:.4});}
  const tap=Math.sin(t*30)*3,wave=Math.sin(t*10)*6,sh=-16-H*.43;
  const P=o.hands||{idle:[[-48,-28+Math.sin(t*2)],[48,-28-Math.sin(t*2)]],carry:[[-22,-106],[22,-106]],type:[[-14,-30+tap],[14,-30-tap]],
    mag:[[-48,-28],[58,-64]],throw:[[-46,-62],[32,-112]],point:[[-48,-28],[66,-58]],talk:[[-48,-28],[52,-48+Math.sin(t*6)*5]],
    wave:[[-48,-28],[40,-112+wave]],cheer:[[-44,-108+wave],[44,-108-wave]],celebrate:[[-44,-110+wave],[44,-110-wave]],
    hold:[[-48,-28],[50,-50]],phone:[[-48,-28],[30,-70]]}[pose]||[[-48,-28],[48,-28]];
  let hands=P.map(([hx,hy])=>[hx*kx,-16+(hy+16)*ky]);
  if(walking&&pose==='idle'&&!o.hands)hands=[[-(W2+6)+sw*.6,-26*ky],[(W2+6)-sw*.6,-26*ky]];
  [[-(W2-4),sh],[W2-4,sh]].forEach((s0,i)=>{const h=hands[i];sk(ln(s0[0],s0[1],h[0],h[1]),{closed:false,seed:seed+20+i,lw:5,stroke:c.dark,amp:.5,passes:1});
    sk(ell(h[0],h[1],5.5,5.5,10),{seed:seed+22+i,fill:c.dark,lw:1.6,amp:.3});});
  if(pose==='mag'){const h=hands[1];sk(ln(h[0],h[1],h[0]+12,h[1]+10),{closed:false,seed:seed+24,lw:4,stroke:'#7A5230',passes:1,amp:.3});
    ctx.fillStyle='rgba(200,230,255,.5)';ctx.beginPath();ctx.arc(h[0]+26,h[1]+20,17,0,7);ctx.fill();sk(ell(h[0]+26,h[1]+20,17,17,20),{seed:seed+25,lw:3.5,stroke:'#7A5230',amp:.5});}
  if(pose==='phone'){const h=hands[1];sk(rr(h[0]-6,h[1]-16,12,30,5),{seed:seed+26,fill:'#3B3140',lw:1.8,amp:.3});}
  if(mood==='tired'){const d=(t*25)%16;ctx.fillStyle='#7EC8F0';ctx.beginPath();ctx.moveTo(W2+4,top-2+d);ctx.quadraticCurveTo(W2+10,top+8+d,W2+4,top+12+d);ctx.quadraticCurveTo(W2-2,top+8+d,W2+4,top-2+d);ctx.fill();}
  ctx.restore();
  const bx=x+W2-4,byy=fy+top-44;
  if(mood==='alert'){sk(rr(bx,byy,26,30,8),{seed:seed+26,fill:RED,lw:2});txt('!',bx+13,byy+16,{size:24,color:'#fff'});}
  if(mood==='puzzled'){sk(rr(bx,byy,26,30,8),{seed:seed+27,fill:BLUE,lw:2});txt('?',bx+13,byy+16,{size:22,color:'#fff'});}
  if(pose==='celebrate'||pose==='cheer'){for(let k=0;k<7;k++){const a=k/7*Math.PI*2+t*1.5,r=78+Math.sin(t*5+k)*10;
    ctx.save();ctx.translate(x+Math.cos(a)*r,fy-60+Math.sin(a)*r*.7);ctx.rotate(t*3+k);ctx.fillStyle=[BULB,RING,TEAL,BLUE][k%4];ctx.fillRect(-4,-2,8,4);ctx.restore();}}
  return {headY:fy+top-24,hands:hands.map(([hx,hy])=>[x+hx*dir,fy+hy])};
}

/* ---------- small icons (station tops, panel titles) ---------- */
function icon(name,x,y,s=1,seed=300){
  ctx.save();ctx.translate(x,y);ctx.scale(s,s);
  const L={closed:false,lw:2,passes:1,amp:.3,seed};
  switch(name){
  case 'cal':sk(rr(-13,-11,26,24,3),{seed,fill:PAPERW,lw:1.8,amp:.3});ctx.fillStyle=RED;ctx.fillRect(-12,-10,24,6);
    for(let r=0;r<2;r++)for(let c=0;c<3;c++)dot(-7+c*7,1+r*6,1.6,INK);break;
  case 'mail':sk(rr(-14,-9,28,19,2),{seed,fill:PAPERW,lw:1.8,amp:.3});sk([[-13,-8],[0,2],[13,-8]],L);break;
  case 'sheet':sk(rr(-12,-13,24,26,2),{seed,fill:'#E3F1E6',lw:1.8,amp:.3});ctx.strokeStyle=GREEN;ctx.lineWidth=1.3;
    for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(-11,-13+k*6.5);ctx.lineTo(11,-13+k*6.5);ctx.stroke();}ctx.beginPath();ctx.moveTo(-3,-12);ctx.lineTo(-3,12);ctx.stroke();break;
  case 'chat':sk(rr(-13,-11,26,18,6),{seed,fill:'#EFE7FA',lw:1.8,amp:.3});sk([[-6,7],[-9,13],[0,7]],{seed,fill:'#EFE7FA',lw:1.6,amp:.2,closed:false});
    [-6,0,6].forEach(d=>dot(d,-2,2,'#6B4FA0'));break;
  case 'db':sk(rr(-11,-10,22,22,2),{seed,fill:'#DCE6F4',lw:1.6,amp:.3,stroke:null});sk(ell(0,-10,11,4,14),{seed,fill:'#DCE6F4',lw:1.6,amp:.2});
    sk(ln(-11,-10,-11,12),L);sk(ln(11,-10,11,12),L);ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.ellipse(0,1,11,4,0,0,Math.PI);ctx.stroke();ctx.beginPath();ctx.ellipse(0,12,11,4,0,0,Math.PI);ctx.stroke();break;
  case 'ai':{const p=[];for(let k=0;k<8;k++){const a=k/8*Math.PI*2-Math.PI/2,r=k%2?4:13;p.push([Math.cos(a)*r,Math.sin(a)*r]);}sk(p,{seed,fill:BULB,lw:1.8,amp:.2});
    const q=[];for(let k=0;k<8;k++){const a=k/8*Math.PI*2-Math.PI/2,r=k%2?2:6;q.push([10+Math.cos(a)*r,-9+Math.sin(a)*r]);}sk(q,{seed:seed+1,fill:BULB,lw:1.4,amp:.2});break;}
  case 'phone':sk(rr(-8,-13,16,26,4),{seed,fill:'#3B3140',lw:1.8,amp:.3});ctx.fillStyle='#9FE0FF';ctx.fillRect(-5,-9,10,13);dot(0,8,1.8,'#fff');break;
  case 'book':sk([[-13,-9],[0,-6],[0,12],[-13,9]],{seed,fill:'#E9D9B4',lw:1.6,amp:.2});sk([[13,-9],[0,-6],[0,12],[13,9]],{seed:seed+1,fill:'#F3E6C6',lw:1.6,amp:.2});break;
  case 'form':sk(rr(-11,-12,22,26,2),{seed,fill:PAPERW,lw:1.8,amp:.3});sk(rr(-5,-15,10,5,2),{seed:seed+1,fill:'#8C6A44',lw:1.4,amp:.2});
    ctx.strokeStyle='rgba(43,38,33,.6)';ctx.lineWidth=1.4;for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(-7,-4+k*6);ctx.lineTo(7,-4+k*6);ctx.stroke();}break;
  case 'folder':sk([[-14,-8],[-5,-8],[-2,-4],[14,-4],[14,11],[-14,11]],{seed,fill:'#F0C35A',lw:1.8,amp:.3});break;
  case 'money':sk(ell(0,0,12,12,16),{seed,fill:'#CFE8C8',lw:1.8,amp:.3});txt('$',0,1,{size:17,font:MONO,color:GREEN});break;
  case 'search':sk(ell(-3,-3,8,8,14),{seed,fill:'rgba(200,230,255,.6)',lw:2,amp:.3});sk(ln(3,3,11,11),{...L,lw:3});break;
  case 'score':ctx.strokeStyle=INK;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,6,12,Math.PI,2*Math.PI);ctx.stroke();
    ctx.strokeStyle=TEAL;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,6,9,Math.PI*1.45,Math.PI*1.95);ctx.stroke();sk(ln(0,6,7,-3),{...L,lw:2.4});dot(0,6,2.4,INK);break;
  case 'clock':sk(ell(0,0,12,12,16),{seed,fill:PAPERW,lw:1.8,amp:.3});sk(ln(0,0,0,-8),L);sk(ln(0,0,6,2),L);break;
  case 'bell':sk([[-9,6],[-7,-4],[0,-10],[7,-4],[9,6]],{seed,fill:BULB,lw:1.8,amp:.2});sk(ln(-11,6,11,6),L);dot(0,9,2.4,INK);break;
  case 'check':sk(ell(0,0,12,12,16),{seed,fill:'rgba(43,140,130,.2)',stroke:TEAL,lw:2,amp:.3});ctx.strokeStyle=TEAL;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-6,0);ctx.lineTo(-1,5);ctx.lineTo(7,-5);ctx.stroke();break;
  case 'user':sk(ell(0,-5,6,6,12),{seed,fill:'#E6D3C0',lw:1.6,amp:.2});sk([[-11,12],[-8,3],[8,3],[11,12]],{seed:seed+1,fill:'#E6D3C0',lw:1.6,amp:.2});break;
  case 'deal':sk(rr(-13,-6,26,18,3),{seed,fill:'#B88A5A',lw:1.8,amp:.3});sk(rr(-5,-11,10,6,2),{seed:seed+1,lw:1.6,amp:.2});break;
  case 'rules':sk(rr(-11,-13,22,26,2),{seed,fill:PAPERW,lw:1.8,amp:.3});[-6,0,6].forEach((d,i)=>{dot(-6,d,1.8,INK);sk(ln(-2,d,8,d),{...L,seed:seed+i,lw:1.4});});break;
  case 'stop':{const p=[];for(let k=0;k<8;k++){const a=k/8*Math.PI*2+Math.PI/8;p.push([Math.cos(a)*12,Math.sin(a)*12]);}sk(p,{seed,fill:RED,lw:1.8,amp:.2});break;}
  case 'key':sk(rr(-13,-8,26,16,3),{seed,fill:'#7FB2E8',lw:1.8,amp:.3});ctx.fillStyle=INK;ctx.fillRect(-12,-3,24,3);break;
  case 'hook':[[0,-8],[-8,6],[8,6]].forEach(([a,b],i)=>sk(ell(a,b,4.5,4.5,10),{seed:seed+i,fill:'#F3C6D3',lw:1.8,amp:.2}));
    ctx.strokeStyle='#C2456F';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(-6,3);ctx.moveTo(-4,6);ctx.lineTo(4,6);ctx.moveTo(6,3);ctx.lineTo(1,-4);ctx.stroke();break;
  case 'code':txt('{ }',0,1,{size:19,font:MONO,weight:600,color:AMBER});break;
  case 'if':ctx.strokeStyle=TEAL;ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-2,0);ctx.lineTo(9,-9);ctx.moveTo(-2,0);ctx.lineTo(9,9);
    ctx.moveTo(4,-9);ctx.lineTo(9,-9);ctx.lineTo(9,-4);ctx.moveTo(4,9);ctx.lineTo(9,9);ctx.lineTo(9,4);ctx.stroke();break;
  case 'set':sk(rr(-11,-9,20,20,3),{seed,fill:'#E6EDFB',lw:1.8,amp:.3,stroke:BLUE});sk(ln(-3,5,10,-9),{closed:false,seed:seed+1,lw:2.6,passes:1,amp:.2,stroke:BLUE});break;
  case 'filter':ctx.strokeStyle=BLUE;ctx.lineWidth=2.6;ctx.lineCap='round';[[-11,11,-6],[-7,7,0],[-3,3,6]].forEach(([a,b,yy])=>{ctx.beginPath();ctx.moveTo(a,yy);ctx.lineTo(b,yy);ctx.stroke();});break;
  case 'alert':sk([[0,-12],[13,10],[-13,10]],{seed,fill:'#FBE3DE',lw:2,amp:.2,stroke:RED});txt('!',0,3,{size:15,weight:600,font:MONO,color:RED});break;
  case 'robot':sk(rr(-12,-8,24,17,5),{seed,fill:'#ECE8E2',lw:1.8,amp:.3});dot(-5,0,2.6,INK);dot(5,0,2.6,INK);sk(ln(0,-8,0,-13),{closed:false,seed:seed+1,lw:1.8,passes:1,amp:.2});dot(0,-14,2.4,INK);
    sk(ln(-15,-1,-12,-1),{closed:false,seed:seed+2,lw:2,passes:1,amp:.1});sk(ln(12,-1,15,-1),{closed:false,seed:seed+3,lw:2,passes:1,amp:.1});break;
  case 'pdf':sk([[-9,-12],[4,-12],[10,-6],[10,12],[-9,12]],{seed,fill:PAPERW,lw:1.8,amp:.3});sk([[-4,1],[5,1]],{closed:false,seed:seed+1,lw:2,passes:1,amp:.1});
    sk([[2,-3],[6,1],[2,5]],{closed:false,seed:seed+2,lw:2,passes:1,amp:.1});break;
  case 'drive':sk([[-4,-11],[4,-11],[13,6],[-13,6]],{seed,fill:'#FFFFFF',lw:1.4,amp:.2,stroke:null});
    sk([[-4,-11],[4,-11],[-5,6],[-13,6]],{seed,fill:'#2E9E5B',lw:1.4,amp:.2});sk([[4,-11],[13,6],[9,11],[0,-4]],{seed:seed+1,fill:BULB,lw:1.4,amp:.2});sk([[-9,11],[9,11],[13,6],[-5,6]],{seed:seed+2,fill:BLUE,lw:1.4,amp:.2});break;
  case 'globe':sk(ell(0,0,12,12,18),{seed,fill:'#E6EDFB',lw:1.8,amp:.3,stroke:BLUE});ctx.strokeStyle=BLUE;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(0,0,5,12,0,0,7);ctx.moveTo(-12,0);ctx.lineTo(12,0);ctx.stroke();break;
  case 'loop':ctx.strokeStyle=TEAL;ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(0,0,9,.3,Math.PI*1.2);ctx.stroke();ctx.beginPath();ctx.arc(0,0,9,Math.PI*1.3,Math.PI*2.2);ctx.stroke();
    sk([[6,-10],[10,-6],[5,-4]],{closed:false,seed,lw:2,passes:1,amp:.1,stroke:TEAL});break;
  case 'list':sk(rr(-12,-11,9,22,2),{seed,fill:'#E6EDFB',lw:1.6,amp:.2,stroke:BLUE});[-6,0,6].forEach((d,i)=>sk(ln(1,d,12,d),{closed:false,seed:seed+i,lw:2,passes:1,amp:.1,stroke:BLUE}));break;
  case 'agent':sk(rr(-13,-9,26,18,4),{seed,fill:SCREEN,lw:1.8,amp:.3});ctx.strokeStyle='#9FE0FF';ctx.lineWidth=1.6;ctx.beginPath();
    for(let k=0;k<=12;k++){const xx=-10+k*20/12,yy=Math.sin(k*1.4+A*8)*4;k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();break;
  }
  ctx.restore();
}

/* ---------- small items (things that fly, flow and get carried) ---------- */
function paperLines(n,x0,x1,y0,dy){ctx.strokeStyle='rgba(43,38,33,.5)';ctx.lineWidth=1.3;for(let k=0;k<n;k++){ctx.beginPath();ctx.moveTo(x0,y0+k*dy);ctx.lineTo(x1-(k%2)*8,y0+k*dy);ctx.stroke();}}
function item(type,x,y,s=1,a=1,seed=1,label){
  if(s<=0||a<=0)return;
  ctx.save();ctx.globalAlpha*=a;ctx.translate(x,y);ctx.scale(s,s);
  switch(type){
  case 'doc':sk(rr(-20,-26,40,52,3),{seed,fill:PAPERW,lw:1.8,amp:.6});paperLines(4,-13,13,-14,8);break;
  case 'invoice':sk(rr(-21,-27,42,54,3),{seed,fill:PAPERW,lw:1.8,amp:.6});txt('$',-11,-15,{size:15,font:MONO,color:AMBER});
    paperLines(3,-13,13,-2,8);ctx.fillStyle=AMBER;ctx.fillRect(-14,18,16,3);break;
  case 'email':sk(rr(-25,-16,50,32,3),{seed,fill:PAPERW,lw:1.8,amp:.6});sk([[-24,-15],[0,3],[24,-15]],{seed:seed+2,closed:false,lw:1.8,passes:1,amp:.4});break;
  case 'cv':sk(rr(-20,-26,40,52,3),{seed,fill:PAPERW,lw:1.8,amp:.6});sk(ell(-8,-14,6,6,12),{seed:seed+1,fill:'#E6D3C0',lw:1.4,amp:.3});
    paperLines(2,0,14,-17,6);paperLines(3,-13,13,0,8);break;
  case 'card':sk(rr(-30,-21,60,42,4),{seed,fill:PAPERW,lw:1.8,amp:.6});sk(ell(-16,-6,6,6,12),{seed:seed+1,fill:'#E6D3C0',lw:1.4,amp:.3});
    sk([[-25,12],[-22,3],[-10,3],[-7,12]],{seed:seed+2,fill:'#E6D3C0',lw:1.4,amp:.2});paperLines(3,-1,24,-9,8);break;
  case 'coin':sk(ell(0,0,14,14,16),{seed,fill:BULB,lw:1.8,amp:.4});sk(ell(0,0,9,9,14),{seed:seed+1,lw:1.3,amp:.3,passes:1});break;
  case 'event':sk(rr(-34,-14,68,28,6),{seed,fill:'#CDE9E5',stroke:TEAL,lw:2,amp:.5});break;
  case 'key':sk(rr(-24,-15,48,30,5),{seed,fill:'#7FB2E8',lw:1.8,amp:.5});ctx.fillStyle=INK;ctx.fillRect(-23,-6,46,5);sk(ell(-12,7,4,4,10),{seed:seed+1,fill:PAPERW,lw:1.2,amp:.2});break;
  case 'folder':sk([[-26,-16],[-10,-16],[-6,-10],[26,-10],[26,18],[-26,18]],{seed,fill:'#F0C35A',lw:1.8,amp:.5});break;
  case 'msg':sk(rr(-28,-17,56,30,9),{seed,fill:'#EFE7FA',lw:1.8,amp:.5});sk([[-12,12],[-17,22],[-2,12]],{seed:seed+1,fill:'#EFE7FA',lw:1.6,amp:.3,closed:false});
    [-10,0,10].forEach(d=>dot(d,-2,2.4,'#6B4FA0'));break;
  case 'bill':sk(rr(-22,-27,44,54,3),{seed,fill:'#E5F2E2',lw:1.8,amp:.6});txt('$',0,-12,{size:18,font:MONO,color:GREEN});paperLines(3,-14,14,2,8);break;
  case 'scroll':sk(rr(-30,-12,60,24,4),{seed,fill:PAPERW,lw:1.8,amp:.6});sk(ell(-30,0,6,13,12),{seed:seed+2,fill:'#E4D2A8',lw:1.6,amp:.4});sk(ell(30,0,6,13,12),{seed:seed+3,fill:'#E4D2A8',lw:1.6,amp:.4});break;
  case 'q':sk(rr(-20,-26,40,52,3),{seed,fill:PAPERW,lw:1.8,amp:.6});txt('?',0,0,{size:34,color:BLUE});break;
  case 'row':hatch(-38,-10,76,20,BLUE,seed);break;
  case 'rowok':hatch(-38,-10,76,20,TEAL,seed);break;
  case 'check':sk(ell(0,0,16,16,16),{seed,fill:'rgba(43,140,130,.22)',stroke:TEAL,lw:2.6,amp:.4});ctx.strokeStyle=TEAL;ctx.lineWidth=4;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-7,1);ctx.lineTo(-2,7);ctx.lineTo(8,-7);ctx.stroke();break;
  case 'cross':sk(ell(0,0,16,16,16),{seed,fill:'rgba(200,69,47,.18)',stroke:RED,lw:2.6,amp:.4});ctx.strokeStyle=RED;ctx.lineWidth=4;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(-6,-6);ctx.lineTo(6,6);ctx.moveTo(6,-6);ctx.lineTo(-6,6);ctx.stroke();break;
  case 'form':sk(rr(-21,-27,42,54,3),{seed,fill:PAPERW,lw:1.8,amp:.6});sk(rr(-8,-31,16,7,2),{seed:seed+1,fill:'#8C6A44',lw:1.4,amp:.3});paperLines(4,-14,14,-12,9);break;
  case 'dot':dot(0,0,6,TEAL);break;
  }
  if(label){const ly=({email:26,card:31,coin:24,event:0,msg:0,key:26,folder:28,scroll:0,row:0,rowok:0,check:26,cross:26,dot:16})[type];
    const yy=ly===undefined?36:ly;
    if(type==='event'||type==='row'||type==='rowok'||type==='scroll')txt(label,0,1,{size:12,font:MONO,color:type==='event'?'#1F6A62':INK});
    else if(type==='msg')txt(label,0,-2,{size:12,font:MONO,color:'#3F2E66'});
    else tag(label,0,yy,{size:11,font:MONO,seed:seed+40});}
  ctx.restore();
}
function polyAt(pts,u){if(pts.length===1)return pts[0];let L=0;const d=[];for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);d.push(l);L+=l;}
  let r=u*L;for(let i=1;i<pts.length;i++){if(r<=d[i-1]||i===pts.length-1){const f=d[i-1]?clamp(r/d[i-1],0,1):1;return[pts[i-1][0]+(pts[i][0]-pts[i-1][0])*f,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*f];}r-=d[i-1];}return pts[pts.length-1];}
function arcPos(sx,sy,ex,ey,u,h){const cx=(sx+ex)/2,cy=Math.min(sy,ey)-h;return[(1-u)**2*sx+2*(1-u)*u*cx+u*u*ex,(1-u)**2*sy+2*(1-u)*u*cy+u*u*ey];}

/* ---------- props (the set) ---------- */
// every prop: {k, x, y, t0, t1, ...}. Pops in at t0 (ease-out-back) and leaves at t1 (fade, optional puff).
const PROP={
  crate(p,t){const w=p.w||300,h=p.h||86,x=p.x-w/2,y=(p.y||598)-h;plank(x,y,w,h*.42,p.seed||200);plank(x,y+h*.42,w,h*.3,(p.seed||200)+1,'#A06E3B');plank(x,y+h*.72,w,h*.28,(p.seed||200)+2);
    if(p.label)tag(p.label,p.x,y+h*.5,{size:p.size||18,seed:(p.seed||200)+3});},
  station(p,t){const w=p.w||124,h=p.h||70,x=p.x-w/2,y=(p.y||598)-h,sd=p.seed||210;
    const lit=inAny(t,p.lit),err=inAny(t,p.err);
    if(lit||err){ctx.save();ctx.globalAlpha*=.35+.15*Math.sin(A*5);sk(rr(x-8,y-8,w+16,h+16,12),{seed:sd+9,fill:(err?RED:TEAL)+'55',stroke:null});ctx.restore();}
    plank(x,y,w,h*.5,sd);plank(x,y+h*.5,w,h*.5,sd+1,'#A06E3B');
    sk(rr(x+8,y+7,w-16,h-14,3),{seed:sd+2,fill:PAPERW,lw:1.6,amp:.5});
    const dn=p.done!=null&&t>=p.done;
    txt(p.label,p.x,y+h*.42,{size:p.size||18,color:dn?'#1F6A62':INK});
    if(p.sub)txt(p.sub,p.x,y+h*.74,{size:11,font:MONO,color:'#6b6258'});
    if(p.icon){sk(rr(p.x-20,y-38,40,34,6),{seed:sd+3,fill:'#FFFDF6',lw:1.6,amp:.4});icon(p.icon,p.x,y-21,1,sd+4);}
    if(p.n!=null){sk(ell(x+4,y+2,12,12,14),{seed:sd+5,fill:dn?TEAL:INK,lw:1.4,amp:.3});txt(String(p.n),x+4,y+3,{size:13,font:MONO,color:'#fff'});}
    if(dn){const k=back(seg(t,p.done,p.done+.3));ctx.save();ctx.translate(x+w-2,y+2);ctx.scale(k,k);item('check',0,0,.8,1,sd+6);ctx.restore();}},
  sign(p,t){const h=p.h||150,y=p.y||598,w=p.w||150;plank(p.x-5,y-h,10,h,p.seed||220);sk(rr(p.x-w/2,y-h-20,w,38,4),{seed:(p.seed||220)+1,fill:WOOD,lw:2});
    txt(p.txt,p.x,y-h,{size:p.size||20,color:'#FCEFD8'});},
  mailbox(p,t){const y=p.y||598,x=p.x;plank(x-5,y-128,10,128,p.seed||231);sk(rr(x-45,y-168,90,46,14),{seed:(p.seed||231)+1,fill:'#C95F4A',lw:2.2});
    sk(rr(x-45,y-160,14,30,3),{seed:(p.seed||231)+2,fill:'#A84634',lw:1.6,amp:.4});
    const up=inAny(t,p.flag);sk(ln(x+38,y-150,x+38,up?y-190:y-160),{closed:false,seed:(p.seed||231)+3,lw:2.4,passes:1,amp:.3});
    sk(rr(x+38,up?y-192:y-162,16,11,2),{seed:(p.seed||231)+4,fill:BULB,lw:1.6,amp:.3});
    if(p.label)tag(p.label,x,y-94,{size:14,seed:(p.seed||231)+5,font:MONO});},
  desk(p,t){const w=p.w||170,y=p.y||598,x=p.x-w/2;plank(x,y-74,w,14,p.seed||240);plank(x+10,y-60,9,60,(p.seed||240)+1);plank(x+w-19,y-60,9,60,(p.seed||240)+2);},
  phone(p,t){const ring=inAny(t,p.ring),sh=ring?Math.sin(A*60)*2:0,x=p.x+sh,y=p.y;
    sk(rr(x-30,y-22,60,24,6),{seed:p.seed||250,fill:'#3B3140',lw:2});sk(rr(x-34,y-34,68,14,7),{seed:(p.seed||250)+1,fill:'#4E4256',lw:2});
    for(let r=0;r<2;r++)for(let c=0;c<4;c++)dot(x-15+c*10,y-14+r*7,2,'#D9D2E6');
    if(ring){ctx.strokeStyle=RED;ctx.lineWidth=2.4;[16,26].forEach((r,i)=>{ctx.globalAlpha=.5+.5*Math.max(0,Math.sin(A*12-i));
      ctx.beginPath();ctx.arc(x-38,y-30,r,Math.PI*.75,Math.PI*1.25);ctx.stroke();ctx.beginPath();ctx.arc(x+38,y-30,r,-Math.PI*.25,Math.PI*.25);ctx.stroke();});ctx.globalAlpha=1;}},
  agent(p,t){const y=p.y||598,w=p.w||130,h=p.h||92,x=p.x-w/2;plank(x,y-h,w,h*.5,p.seed||260);plank(x,y-h*.5,w,h*.5,(p.seed||260)+1,'#A06E3B');
    sk(rr(x+14,y-h+12,w-28,h*.5,8),{seed:(p.seed||260)+2,fill:SCREEN,lw:2});
    const talk=inAny(t,p.talk);ctx.strokeStyle='#9FE0FF';ctx.lineWidth=2.4;ctx.beginPath();
    for(let k=0;k<=24;k++){const xx=x+20+k*(w-40)/24,yy=y-h+12+h*.25+(talk?Math.sin(k*1.1+A*14)*Math.sin(k/24*Math.PI)*12:0);k?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);}ctx.stroke();
    sk(ln(x+w-24,y-h,x+w-14,y-h-34),{closed:false,seed:(p.seed||260)+3,lw:2.5,passes:1,amp:.3});dot(x+w-14,y-h-36,5,talk?(Math.sin(A*10)>0?RED:BULB):'#8a8070');
    if(p.label)tag(p.label,p.x,y-16,{size:15,seed:(p.seed||260)+4,font:MONO});},
  calendar(p,t){const w=p.w||200,h=p.h||150,x=p.x-w/2,y=p.y-h/2,sd=p.seed||270;
    if(p.hang){ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x+30,y);ctx.lineTo(x+30,0);ctx.moveTo(x+w-30,y);ctx.lineTo(x+w-30,0);ctx.stroke();}
    if(p.post!==false&&!p.hang){plank(p.x-5,y+h-4,10,598-(y+h)+4,sd+9);}
    sk(rr(x,y,w,h,4),{seed:sd,fill:PAPERW,lw:2});ctx.fillStyle=RED;ctx.fillRect(x+3,y+3,w-6,24);
    txt(p.title||'calendar',p.x,y+15,{size:15,color:'#fff',font:MONO});
    const cols=p.cols||5,rows=p.rows||3,cw=(w-16)/cols,ch=(h-40)/rows;
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){ctx.strokeStyle='rgba(43,38,33,.25)';ctx.lineWidth=1;ctx.strokeRect(x+8+c*cw,y+32+r*ch,cw,ch);}
    (p.cells||[]).forEach((e,i)=>{if(t<e.t||(e.t1!=null&&t>=e.t1+.3))return;const a=e.t1!=null?1-seg(t,e.t1,e.t1+.3):1;const k=back(seg(t,e.t,e.t+.3));
      const c=e.i%cols,r=Math.floor(e.i/cols),cx=x+8+c*cw+cw/2,cy=y+32+r*ch+ch/2;ctx.save();ctx.globalAlpha*=a;ctx.translate(cx,cy);ctx.scale(k,k);
      hatch(-cw/2+3,-ch/2+3,cw-6,ch-6,e.c||TEAL,sd+20+i);if(e.txt)txt(e.txt,0,0,{size:11,font:MONO});ctx.restore();});
    if(p.label)tag(p.label,p.x,y+h+16,{size:13,font:MONO,seed:sd+7});},
  panel(p,t){const w=p.w||220,h=p.h||170,x=p.x-w/2,y=p.y-h/2,sd=p.seed||280;
    if(p.hang){ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x+30,y);ctx.lineTo(x+30,0);ctx.moveTo(x+w-30,y);ctx.lineTo(x+w-30,0);ctx.stroke();}
    if(p.post){plank(p.x-w/2+18,y+h-4,9,598-(y+h)+4,sd+8);plank(p.x+w/2-27,y+h-4,9,598-(y+h)+4,sd+9);}
    if(p.wood!==false)plank(x-8,y-8,w+16,h+16,sd+1);
    sk(rr(x,y,w,h,3),{seed:sd,fill:p.fill||PAPERW,lw:1.8});
    if(p.icon)icon(p.icon,x+20,y+20,.8,sd+2);
    txt(p.title||'',x+(p.icon?38:12),y+20,{size:p.tsize||19,align:'left',color:p.tcolor||INK});
    ctx.strokeStyle='rgba(43,38,33,.25)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x+8,y+38);ctx.lineTo(x+w-8,y+38);ctx.stroke();
    const rh=p.rh||26;
    (p.rows||[]).forEach((r,i)=>{if(t<r.t)return;const u=ease(seg(t,r.t,r.t+.35));const a=r.t1!=null?1-seg(t,r.t1,r.t1+.4):1;if(a<=0)return;
      const yy=y+52+i*rh;ctx.save();ctx.globalAlpha*=u*a;ctx.translate(14*(1-u),0);
      if(r.hl)sk(rr(x+6,yy-rh/2+2,w-12,rh-4,4),{seed:sd+30+i,fill:r.hl+'2A',stroke:null});
      dot(x+16,yy,4.5,r.c||BLUE);txt(r.txt,x+28,yy+1,{size:r.size||(p.rsize||16),align:'left',font:r.mono?MONO:HAND});
      if(r.mark&&(r.markT==null||t>=r.markT))item(r.mark,x+w-22,yy,.55,1,sd+50+i);
      if(r.strike!=null&&t>=r.strike){const f=ease(seg(t,r.strike,r.strike+.3));ctx.strokeStyle=RED;ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(x+24,yy);ctx.lineTo(x+24+(w-60)*f,yy);ctx.stroke();}
      ctx.restore();});},
  shelf(p,t){const w=p.w||220,h=p.h||160,x=p.x-w/2,y=(p.y||598)-h,sd=p.seed||290,n=(p.cubbies||[]).length||3,cw=(w-12)/n;
    plank(x,y,w,12,sd);plank(x,y+h-12,w,12,sd+1);plank(x,y,10,h,sd+2);plank(x+w-10,y,10,h,sd+3);
    for(let i=1;i<n;i++)plank(x+6+i*cw-4,y+10,8,h-20,sd+4+i);
    (p.cubbies||[]).forEach((c,i)=>{const cx=x+6+i*cw+cw/2;const f=p.fill?stepVal(p.fill[i],t,0):1;
      for(let k=0;k<Math.min(5,Math.round(f*5));k++){sk(rr(cx-cw*.32,y+h-20-k*9,cw*.64,8,2),{seed:sd+20+i*7+k,fill:k%2?'#E4D2A8':PAPERW,lw:1.3,amp:.3});}
      tag(c,cx,y+30,{size:12,font:MONO,seed:sd+40+i});});
    if(p.label)tag(p.label,p.x,y-16,{size:16,seed:sd+60});},
  book(p,t){const y=p.y||598,x=p.x,sd=p.seed||300;plank(x-5,y-110,10,110,sd);sk([[x-50,y-120],[x+50,y-120],[x+40,y-104],[x-40,y-104]],{seed:sd+1,fill:WOOD,lw:2});
    if(inAny(t,p.glow)){ctx.save();ctx.globalAlpha*=.4+.2*Math.sin(A*5);dot(x,y-150,52,BULB+'88');ctx.restore();}
    sk([[x-48,y-170],[x,y-160],[x,y-118],[x-46,y-126]],{seed:sd+2,fill:'#F7EED8',lw:2,amp:.4});sk([[x+48,y-170],[x,y-160],[x,y-118],[x+46,y-126]],{seed:sd+3,fill:'#FBF4E2',lw:2,amp:.4});
    ctx.strokeStyle='rgba(43,38,33,.4)';ctx.lineWidth=1.2;for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(x-38,y-158+k*10);ctx.lineTo(x-8,y-152+k*10);ctx.moveTo(x+8,y-152+k*10);ctx.lineTo(x+38,y-158+k*10);ctx.stroke();}
    if(p.label)tag(p.label,x,y-60,{size:14,font:MONO,seed:sd+4});},
  stop(p,t){const y=p.y||598,x=p.x,h=p.h||150,sd=p.seed||310;plank(x-5,y-h,10,h,sd);const pts=[];for(let k=0;k<8;k++){const a=k/8*Math.PI*2+Math.PI/8;pts.push([x+Math.cos(a)*40,y-h-20+Math.sin(a)*40]);}
    sk(pts,{seed:sd+1,fill:RED,lw:2.4});txt(p.txt||'STOP',x,y-h-19,{size:p.size||20,color:'#fff',font:MONO,weight:600});},
  gate(p,t){const y=p.y||598,x=p.x,w=p.w||130,sd=p.seed||320;plank(x-w/2-6,y-110,12,110,sd);plank(x+w/2-6,y-110,12,110,sd+1);
    const op=ivVal(p.open,t);const ang=op?-1.2*ease(seg(t,op,op+.3)):0;
    ctx.save();ctx.translate(x-w/2,y-84);ctx.rotate(ang);sk(rr(0,-7,w,14,4),{seed:sd+2,fill:PAPERW,lw:2});
    for(let k=0;k<w;k+=24){ctx.fillStyle=RED;ctx.fillRect(k+4,-5,10,10);}ctx.restore();
    if(p.label)tag(p.label,x,y-130,{size:15,seed:sd+3,font:MONO});},
  clock(p,t){const r=p.r||34,sd=p.seed||330,v=p.val(t);if(!v)return;
    if(p.post){plank(p.x-5,p.y+r-2,10,598-(p.y+r)+2,sd+5);}
    sk(ell(p.x,p.y,r,r,24),{seed:sd,fill:PAPERW,lw:2.2});
    if(v.f!=null){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.arc(p.x,p.y,r-4,-Math.PI/2,-Math.PI/2+clamp(v.f,0,1)*Math.PI*2);ctx.closePath();ctx.fillStyle=(v.c||AMBER)+'66';ctx.fill();}
    const ang=-Math.PI/2+(v.h!=null?v.h:(v.f||0))*Math.PI*2;ctx.strokeStyle=INK;ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+Math.cos(ang)*(r-8),p.y+Math.sin(ang)*(r-8));ctx.stroke();dot(p.x,p.y,3,INK);
    if(v.txt)tag(v.txt,p.x,p.y+r+18,{size:15,font:MONO,seed:sd+3,color:v.c||INK});},
  pile(p,t){const n=Math.round(track(p.n,t)),y=p.y||598,sd=p.seed||340;for(let k=0;k<n;k++){const jx=Math.sin(k*2.3)*6;
    item(p.type||'doc',p.x+jx,y-14-k*(p.dy||9),p.s||.7,1,sd+k);} if(p.label&&n>0)tag(p.label,p.x,y-14-n*(p.dy||9)-34,{size:13,font:MONO,seed:sd+90});},
  form(p,t){const y=p.y||598,x=p.x,sd=p.seed||350,n=p.fields||4,fill=stepVal(p.fill,t,0);
    plank(x-44,y-150,8,150,sd);plank(x+36,y-150,8,150,sd+1);
    sk(rr(x-58,y-236,116,140,4),{seed:sd+2,fill:'#8C6A44',lw:2});sk(rr(x-50,y-228,100,124,3),{seed:sd+3,fill:PAPERW,lw:1.6});
    sk(rr(x-16,y-242,32,12,3),{seed:sd+4,fill:'#6B6258',lw:1.6,amp:.3});
    if(p.title)txt(p.title,x,y-214,{size:14,font:MONO});
    for(let k=0;k<n;k++){const yy=y-192+k*22;ctx.strokeStyle='rgba(43,38,33,.35)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x-40,yy+6);ctx.lineTo(x+40,yy+6);ctx.stroke();
      const errK=inAny(t,p.err)&&p.errIdx===k;
      if(k<fill){ctx.strokeStyle=BLUE;ctx.lineWidth=2;ctx.beginPath();for(let q=0;q<=10;q++){const xx=x-38+q*7.2,yy2=yy+1+Math.sin(q*1.7+k)*2.4;q?ctx.lineTo(xx,yy2):ctx.moveTo(xx,yy2);}ctx.stroke();}
      if(errK){sk(rr(x-44,yy-8,88,18,3),{seed:sd+20+k,fill:'rgba(200,69,47,.15)',stroke:RED,lw:2});}}
    if(p.label)tag(p.label,x,y-80,{size:14,font:MONO,seed:sd+5});},
  text(p,t){txt(p.txt,p.x,p.y,{size:p.size||20,color:p.color||INK,font:p.mono?MONO:HAND,align:p.align||'center'});},
  tag(p,t){tag(p.txt,p.x,p.y,{size:p.size||15,font:p.mono?MONO:HAND,seed:p.seed||360,fill:p.fill||PAPERW,color:p.color||INK});},
  item(p,t){item(p.type,p.x,p.y,p.s||1,1,p.seed||370,p.label);},
  moon(p,t){ctx.save();dot(p.x,p.y,26,'#F7E7A6');ctx.fillStyle='rgba(60,70,120,.0)';ctx.globalCompositeOperation='source-over';
    dot(p.x+12,p.y-8,22,'#2E3A66');ctx.restore();sk(ell(p.x,p.y,26,26,20),{seed:p.seed||380,lw:1.6,amp:.4,passes:1,stroke:'rgba(43,38,33,.5)'});
    [[-120,-30],[-60,20],[80,-10],[140,30],[-170,40],[200,-20]].forEach(([dx,dy],i)=>{const tw=.5+.5*Math.sin(A*3+i);ctx.globalAlpha*=1;dot(p.x+dx,p.y+dy,1.8+tw,'#FFF6D0');});},
  custom(p,t){p.draw(t,p);}
};
function drawProp(p,t){
  const t0=p.t0??-99,t1=p.t1??1e9;if(t<t0||t>=t1+.4)return;
  const k=p.t0==null||p.nopop?1:back(seg(t,t0,t0+.35)),a=t>=t1?1-seg(t,t1,t1+.4):1;
  const ax=p.ax??p.x,ay=p.ay??(p.y??598);
  ctx.save();ctx.globalAlpha*=a*(p.alpha??1);ctx.translate(ax,ay);ctx.scale(k,k);ctx.translate(-ax,-ay);PROP[p.k](p,t);ctx.restore();
}

/* ---------- moving things: links, tokens, flights, marks ---------- */
function drawLink(l,t){if(t<l.t0||(l.t1!=null&&t>=l.t1+.001))return;const u=ease(seg(t,l.t0,l.t0+.6)),pts=l.pts;
  ctx.save();ctx.setLineDash([7,6]);ctx.lineDashOffset=-A*30;ctx.strokeStyle=l.c||TEAL;ctx.lineWidth=2.4;ctx.globalAlpha*=l.a??1;ctx.beginPath();
  for(let k=0;k<=40;k++){const q=polyAt(pts,u*k/40);k?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);}ctx.stroke();ctx.restore();}
function drawToken(o,t){const end=o.keep??o.t1;if(t<o.t0||t>=end+(o.keep!=null?.3:0))return;const u=ease(seg(t,o.t0,o.t1)),q=polyAt(o.pts,u);
  const a=o.keep!=null&&t>end?1-seg(t,end,end+.3):1;item(o.type,q[0],q[1],o.s||.6,a,o.seed||400,o.label);}
function drawFlight(o,t){const t1=o.t1,keep=o.keep??t1;if(t<o.t0||t>Math.max(t1+.8,keep+.3))return;const u=seg(t,o.t0,t1);const fade=t>t1?1-seg(t,t1,t1+.8):1;
  const [sx,sy]=o.from,[ex,ey]=o.to,h=o.h??140;
  if(fade>0&&!o.notrail){ctx.save();ctx.setLineDash([6,8]);ctx.strokeStyle='rgba(60,95,175,'+(.85*fade)+')';ctx.lineWidth=2;ctx.beginPath();
    for(let k=0;k<=30;k++){const p=arcPos(sx,sy,ex,ey,u*k/30,h);k?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]);}ctx.stroke();ctx.restore();
    ctx.save();ctx.globalAlpha*=fade;dot(sx,sy,4,'rgba(60,95,175,.9)');ctx.restore();}
  if(t<t1){const p=arcPos(sx,sy,ex,ey,u,h);ctx.save();ctx.translate(p[0],p[1]);ctx.rotate((u-.5)*.5);item(o.type,0,0,o.s||.8,1,o.seed||410,o.label);ctx.restore();}
  else if(t<keep+.3){const a=t>keep?1-seg(t,keep,keep+.3):1;item(o.type,ex,ey,o.s||.8,a,o.seed||410,o.label);}}
function drawMark(m,t){const t1=(m.t1??(m.t0+1.2))+.001;if(t<m.t0||t>=t1)return;const k=back(seg(t,m.t0,m.t0+.35)),x=m.x,y=m.y,i=m.seed||0;
  if(m.k==='puff'){const u=seg(t,m.t0,t1);[[0,0],[-26,6],[24,4],[-8,-14]].forEach(([dx,dy],j)=>{ctx.save();ctx.globalAlpha*=(1-u)*.7;dot(x+dx+Math.cos(j*2)*u*30,y+dy-u*30,8+u*24,'#fff');ctx.restore();});return;}
  ctx.save();ctx.translate(x,y);ctx.scale(k,k);
  if(m.k==='flag'){sk(ln(0,24,0,-14),{closed:false,seed:700+i,lw:2.4,passes:1});sk([[0,-14],[24,-6],[0,2]],{seed:710+i,fill:RED,lw:1.8,amp:.4});}
  else if(m.k==='check')item('check',0,0,m.s||1,1,720+i);
  else if(m.k==='cross')item('cross',0,0,m.s||1,1,730+i);
  else if(m.k==='bang'){sk(rr(-14,-17,28,34,8),{seed:740+i,fill:RED,lw:2});txt('!',0,1,{size:26,color:'#fff'});}
  else if(m.k==='q'){sk(rr(-14,-17,28,34,8),{seed:750+i,fill:BLUE,lw:2});txt('?',0,1,{size:24,color:'#fff'});}
  else if(m.k==='zz'){txt('z',0,0,{size:22,color:'#6b6258'});txt('z',12,-14,{size:16,color:'#6b6258'});}
  else if(m.k==='label'){tag(m.txt,0,0,{size:m.size||15,font:m.mono?MONO:HAND,seed:760+i,fill:m.fill||PAPERW,color:m.color||INK});}
  ctx.restore();}

/* ---------- film data (filled in by the film file) ---------- */
let FILM={},BODY=[],ACTORS={},PROPS=[],LINKS=[],TOKENS=[],FLIGHTS=[],MARKS=[],STATS=null,CHAPS_B=[],RECAP={},EVENTS=[],NIGHT=[],RINGS=[];
let DRAW_BACK=null,DRAW_FRONT=null,DRAW_HUD=null;
function beats(list){let t=0;BODY=list.map(b=>{const o=Object.assign({},b,{s:t,e:t+b.d});t+=b.d;return o;});
  return (i,f=0)=>{const b=typeof i==='number'?BODY[i]:BODY.find(x=>x.id===i);if(!b)throw new Error('no beat '+i);return b.s+(b.e-b.s)*f;};}
const TYPES={
  'before-after':{kicker:'A BEFORE-AND-AFTER STORY',labels:['the job','the problem','watch for'],banner:'MORAL OF THE STORY',recap:'what happened'},
  'how-it-works':{kicker:'HOW IT WORKS',labels:['the system','the mystery','watch how'],banner:'KEY TAKEAWAY',recap:'how it works'},
  'problem-fix':{kicker:'A PROBLEM AND ITS FIX',labels:['the setup','what broke','watch the fix'],banner:'WHAT TO REMEMBER',recap:'what we learned'}};

/* ---------- workflow lanes: the build's own process map, one lane at a time ---------- */
// A lane is a hanging board with that lane's nodes, numbered and named as on the case
// study's process map. A token travels node to node; every node with a `say` gets a beat,
// the camera closes in, the narrator walks underneath, and the map's own description of
// the step shows in the board's footer.
const LANEC={yellow:'#F3E3A2',blue:'#D9DCF6',green:'#CFEBD8',pink:'#F5D3D0',purple:'#E3D8F4',gray:'#E6E2DC'};
const BOARD={x:30,y:96,w:1220,h:300},NODE_Y=BOARD.y+116;
function laneXs(n){const a=BOARD.x+80,b=BOARD.x+BOARD.w-80;if(n===1)return[(a+b)/2];
  const sp=Math.min(150,(b-a)/(n-1)),s0=(a+b)/2-sp*(n-1)/2;return [...Array(n)].map((_,i)=>s0+i*sp);}
function boardFrame(seed,title,right,col){const {x,y,w,h}=BOARD;
  ctx.strokeStyle=INK;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(x+70,y);ctx.lineTo(x+70,0);ctx.moveTo(x+w-70,y);ctx.lineTo(x+w-70,0);ctx.stroke();
  plank(x-8,y-8,w+16,h+16,seed);sk(rr(x,y,w,h,3),{seed:seed+1,fill:PAPERW,lw:1.8});
  sk(rr(x+8,y+8,w-16,40,4),{seed:seed+2,fill:col,lw:1.4,amp:.5});
  txt(title,x+22,y+29,{size:22,align:'left'});if(right)txt(right,x+w-130,y+29,{size:13,font:MONO,align:'right',color:'#6b6258'});}
function workflow(spec){
  const lanes=spec.lanes,out=[],N=lanes.length,tok=spec.token||'dot';
  if(spec.overview)out.push({id:'wf-ov',d:spec.ovD||2.6,say:spec.overview,who:spec.overviewWho,cam:[640,290,1.0]});
  lanes.forEach((L,li)=>{L.xs=laneXs(L.nodes.length);
    out.push({id:'L'+li,d:L.d||1.8,say:L.intro,who:L.who,cam:[640,300,1.0]});
    L.nodes.forEach((n,ni)=>{if(n.say)out.push({id:'N'+li+'_'+ni,d:n.d||2.0,say:n.say,who:n.who,side:n.side,
      cam:[clamp(L.xs[ni],W/2.6,W-W/2.6),300,n.z||1.3]});});});
  if(spec.running)out.push({id:'wf-run',d:spec.runD||3.0,say:spec.running,who:spec.runningWho,cam:[640,290,1.0]});
  function drawLane(L,li,t){
    boardFrame(1100+li*20,L.name,'lane '+(li+1)+' of '+N,LANEC[L.color]||LANEC.yellow);
    const xs=L.xs,tv=L.tv,ny=NODE_Y,sp=xs.length>1?xs[1]-xs[0]:200;
    for(let i=0;i<xs.length-1;i++){
      if(t>=tv[i+1]){ctx.save();ctx.setLineDash([7,6]);ctx.lineDashOffset=-A*30;ctx.strokeStyle=TEAL;ctx.lineWidth=2.8;ctx.beginPath();ctx.moveTo(xs[i]+31,ny);ctx.lineTo(xs[i+1]-31,ny);ctx.stroke();ctx.restore();}
      else sk(ln(xs[i]+31,ny,xs[i+1]-31,ny),{closed:false,seed:1130+i,lw:1.8,passes:1,amp:.4,stroke:'#8A7FD0'});}
    let act=-1;tv.forEach((v,i)=>{if(t>=v)act=i;});
    // only the latest branch reached shows its note, so neighbouring notes never collide
    let lastBr=-1;L.nodes.forEach((n,i)=>{if(n.branch&&t>=tv[i])lastBr=i;});
    L.nodes.forEach((n,i)=>{const nx=xs[i],on=i===act,dn=i<act;
      if(on){ctx.save();ctx.globalAlpha*=.38+.14*Math.sin(A*5);sk(rr(nx-40,ny-40,80,80,18),{seed:1140+i,fill:TEAL+'66',stroke:null});ctx.restore();}
      const s=on?1+.05*Math.sin(A*5):1;ctx.save();ctx.translate(nx,ny);ctx.scale(s,s);
      sk(rr(-29,-29,58,58,12),{seed:1150+i,fill:'#FFFFFF',lw:on?2.6:1.8,stroke:on?TEAL:INK});icon(n.icon,0,0,1.3,1160+i*7);ctx.restore();
      if(n.n){sk(ell(nx-28,ny-29,12,12,14),{seed:1170+i,fill:dn||on?TEAL:'#5B4BC4',lw:1.2,amp:.3});txt(String(n.n),nx-28,ny-28,{size:12,font:MONO,weight:600,color:'#fff'});}
      if(dn)item('check',nx+28,ny-28,.48,1,1180+i);
      wrapW(n.name,16,sp-8).slice(0,2).forEach((l,j)=>txt(l,nx,ny+48+j*18,{size:16,color:on?'#1F6A62':INK}));
      if(n.branch&&i===lastBr){const u=ease(seg(t,tv[i],tv[i]+.3));ctx.save();ctx.globalAlpha*=u;
        ctx.setLineDash([4,4]);ctx.strokeStyle=n.bc||RED;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(nx,ny+82);ctx.lineTo(nx,ny+90);ctx.stroke();ctx.setLineDash([]);
        tag(n.branch,nx,ny+100,{size:12,font:MONO,color:n.bc||RED,seed:1190+i});ctx.restore();}});
    if(L.token!==false&&t>=tv[0]&&t<tv[tv.length-1]+.5){let k=0;while(k<tv.length-1&&t>=tv[k+1])k++;
      const u=k<tv.length-1?ease(seg(t,tv[k],tv[k+1])):1,px=xs[k]+((xs[Math.min(k+1,xs.length-1)])-xs[k])*u,a=1-seg(t,tv[tv.length-1]+.2,tv[tv.length-1]+.5);
      item(L.token||tok,px,ny-50,.42,a,1195,null);}
    // footer: the map's own description of the latest numbered step reached
    let d=null;L.nodes.forEach((n,i)=>{if(n.desc&&t>=tv[i])d=n;});
    const fy=BOARD.y+BOARD.h-56,fx=BOARD.x+14,fw=BOARD.w-28;
    if(d||L.foot){const di=d?L.nodes.indexOf(d):0,u=ease(seg(t,tv[di],tv[di]+.3)),col=(LANEC[L.color]||LANEC.yellow);
      sk(rr(fx,fy,fw,46,4),{seed:1199,fill:col+'88',lw:1.2,amp:.4});
      // the text sits under the step it describes, so a zoomed-in camera still sees all of it
      const line=d?(d.title||d.name)+' — '+d.desc:L.foot,maxW=820;let size=18,lines=wrapW(line,size,maxW);if(lines.length>1){size=15;lines=wrapW(line,size,maxW);}
      lines=lines.slice(0,2);ctx.font=size+'px '+HAND;const tw=Math.max(...lines.map(l=>ctx.measureText(l).width)),bw=tw+(d&&d.n?34:0);
      const cx=clamp(d?xs[di]:fx+fw/2,fx+bw/2+16,fx+fw-bw/2-16),x0=cx-bw/2;
      ctx.save();ctx.globalAlpha*=u;let tx=x0;
      if(d&&d.n){sk(ell(x0+11,fy+23,12,12,14),{seed:1198,fill:TEAL,lw:1.2,amp:.3});txt(String(d.n),x0+11,fy+24,{size:12,font:MONO,weight:600,color:'#fff'});tx=x0+34;}
      lines.forEach((l,j)=>txt(l,tx,fy+23+(j-(lines.length-1)/2)*17,{size,align:'left'}));ctx.restore();}}
  function drawMap(t,t0,run){
    boardFrame(1300,spec.mapTitle||'the whole build',lanes.length+' lanes · '+lanes.reduce((a,L)=>a+L.nodes.filter(n=>n.n).length,0)+' numbered steps',LANEC.gray);
    const top=BOARD.y+56,lh=(BOARD.h-64)/N;
    lanes.forEach((L,li)=>{const y=top+li*lh,st=1.6/N,hl=run?1:ease(seg(t,t0+.25+li*st,t0+.55+li*st));
      ctx.save();ctx.globalAlpha*=.35+.65*hl;sk(rr(BOARD.x+12,y+3,BOARD.w-24,lh-6,4),{seed:1310+li,fill:LANEC[L.color]||LANEC.yellow,lw:1.2,amp:.4});
      {let fs=15;ctx.font=fs+'px '+MONO;while(fs>10&&ctx.measureText(L.name).width>250){fs--;ctx.font=fs+'px '+MONO;}txt(L.name,BOARD.x+26,y+lh/2,{size:fs,align:'left',font:MONO});}
      const n=L.nodes.length,a=BOARD.x+290,b=BOARD.x+BOARD.w-50,sp=Math.min(110,(b-a)/Math.max(1,n-1));
      for(let i=0;i<n-1;i++)sk(ln(a+i*sp+12,y+lh/2,a+(i+1)*sp-12,y+lh/2),{closed:false,seed:1320+i,lw:1.4,passes:1,amp:.3,stroke:'#8A7FD0'});
      L.nodes.forEach((nd,i)=>{const nx=a+i*sp;sk(rr(nx-12,y+lh/2-12,24,24,6),{seed:1330+i,fill:'#fff',lw:1.4,amp:.3});icon(nd.icon,nx,y+lh/2,.6,1340+i);
        if(nd.n){dot(nx-12,y+lh/2-12,7,'#5B4BC4');txt(String(nd.n),nx-12,y+lh/2-11,{size:9,font:MONO,weight:600,color:'#fff'});}});
      if(run){const u=((t-t0)*.55+li*.17)%1;item('dot',a+u*sp*(n-1),y+lh/2-16,.8,1,1350+li);}
      ctx.restore();});}
  return {beats:out,build(T){
    const ids=BODY.map(b=>b.id),endOf=id=>BODY.find(b=>b.id===id).e;
    lanes.forEach((L,li)=>{
      const tv=L.nodes.map((n,ni)=>n.say?T('N'+li+'_'+ni,.5):null);
      const laneBeats=ids.filter(id=>id==='L'+li||(id&&id.startsWith('N'+li+'_')));
      L.t0=T('L'+li);L.t1=endOf(laneBeats[laneBeats.length-1]);
      if(tv[0]==null)tv[0]=T('L'+li,.55);
      for(let i=1;i<tv.length;i++){if(tv[i]!=null)continue;let j=i;while(j<tv.length&&tv[j]==null)j++;
        if(j<tv.length){const a=tv[i-1],b=tv[j];for(let k=i;k<j;k++)tv[k]=a+(b-a)*(k-i+1)/(j-i+1);}
        else{const a=tv[i-1],st=Math.min(.3,(L.t1-a-.1)/(j-i+1));for(let k=i;k<j;k++)tv[k]=a+st*(k-i+1);}
        i=j;}
      L.tv=tv;
      PROPS.push({k:'custom',x:640,y:BOARD.y,t0:L.t0,t1:L.t1,draw:t=>drawLane(L,li,t)});
      CHAPS_B.push({t:L.t0,ring:'lane '+(li+1),chip:L.chip||L.name,title:L.chapter||('lane '+(li+1)),mood:L.mood||'solution'});});
    if(spec.overview){const t0=T('wf-ov');PROPS.push({k:'custom',x:640,y:BOARD.y,t0,t1:T('L0'),draw:t=>drawMap(t,t0,false)});
      if(spec.ovChapter)CHAPS_B.push({t:t0,...spec.ovChapter});}
    if(spec.running){const t0=T('wf-run');PROPS.push({k:'custom',x:640,y:BOARD.y,t0,t1:endOf('wf-run')+.2,draw:t=>drawMap(t,t0,true)});
      if(spec.runChapter)CHAPS_B.push({t:t0,...spec.runChapter});}
    CHAPS_B.sort((a,b)=>a.t-b.t);
    // the narrator walks to stand under each node as it is explained, and points up at it
    const who=spec.narrator||FILM.protag||'dennice',a=ACTORS[who];if(!a.poses)a.poses=[];
    let cur=track(a.x,T(spec.overview?'wf-ov':'L0'));const xs=[];
    lanes.forEach((L,li)=>L.nodes.forEach((n,ni)=>{if(!n.say)return;const id='N'+li+'_'+ni,x=clamp(L.xs[ni]+(n.dx||0),spec.minX||70,spec.maxX||1210);
      a.x.push([T(id,0),cur],[T(id,.3),x]);cur=x;a.poses.push([T(id,.3),T(id,1),n.pose||'point']);}));
    a.x.sort((p,q)=>p[0]-q[0]);
    return {laneEnd:L=>L.t1};
  }};
}
