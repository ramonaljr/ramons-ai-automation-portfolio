/* Order Stock Check — how it works, lane by lane. Cast: Dennice (the shop owner), Samantha (a customer). */
FILM={type:'how-it-works',protag:'dennice',
  title:'Order Stock Check',
  sub:'A hand-drawn explainer of the Order Stock Check case study. Dennice plays the shop owner and Samantha plays a customer.',
  aria:'Animated film: orders were confirmed before anyone checked the shelf. The Make build is shown lane by lane as on its process map: every 15 minutes it finds up to 10 orders marked New and looks up each SKU, a Router compares the quantity with the stock, orders with enough stock are reserved, confirmed and emailed, stock that falls below its reorder level alerts operations in Slack, and short orders are put on hold with the customer told why.',
  cardTitle:'How every order is checked against the shelf',
  intro:['Every new order should be checked against the shelf before it is promised.',
         'Orders were confirmed blind, items sold out, and customers heard nothing.',
         'One Router sends each order down the right path.']};

const WF=workflow({token:'form',maxX:960,
  overview:'The whole build: five lanes, fourteen steps.',
  ovChapter:{ring:'the build',chip:'The build',title:'the whole build',mood:'setup'},
  running:'Every order checked before anyone promises it.',
  runChapter:{ring:'running',chip:'Running',title:'the whole line, running',mood:'finale'},
  lanes:[
    {name:'Find new orders',color:'yellow',chapter:'lane 1 · find new orders',intro:'Lane one: find the new orders.',nodes:[
      {n:1,name:'Every 15 Minutes',icon:'clock',say:'Every 15 minutes, it checks the order sheet.',desc:'Runs on its own, every 15 minutes.'},
      {n:2,name:'Search Orders Marked New',icon:'search',say:'Only orders marked New, up to 10 a run.',desc:'Searches the order sheet for orders marked New, up to 10 per run.'},
      {n:3,name:'Look Up Stock For The SKU',icon:'sheet',say:'Each product is looked up by its SKU.',desc:'Looks up each product by its SKU in the inventory sheet.'}]},
    {name:'Route by stock',color:'blue',chapter:'lane 2 · route by stock',intro:'Lane two: one Router, every order.',nodes:[
      {n:4,name:'Router Checks Each Order',icon:'if',say:'It compares the quantity ordered with the stock.',desc:'A Make Router compares the quantity ordered with the stock on hand.'},
      {n:5,name:'Enough Stock?',icon:'check',branch:'yes → confirm',bc:TEAL,say:'Enough stock? It goes on to be confirmed.',desc:'Enough stock sends the order on to be confirmed.'},
      {n:6,name:'Not Enough Stock?',icon:'alert',branch:'no → hold',say:'Not enough? It is held, never partly filled.',desc:'Not enough stock puts the order on hold. Orders are never partly filled.'}]},
    {name:'Confirm the order',color:'green',chapter:'lane 3 · confirm the order',intro:'Lane three: enough stock.',nodes:[
      {n:7,name:'Reserve Stock',icon:'sheet',say:'Mug: 2 ordered, 40 in stock. 38 left.',desc:'Takes the quantity ordered off the inventory sheet.'},
      {n:8,name:'Mark Order Confirmed',icon:'check',say:'Marked Confirmed, with what was reserved and left.',desc:'Marks the order Confirmed, noting what was reserved and how much is left.'},
      {n:9,name:'Email Order Confirmation',icon:'mail',say:'The customer gets a confirmation email.',desc:'Emails the customer a confirmation.'}]},
    {name:'Flag low stock',color:'purple',chapter:'lane 4 · flag low stock',intro:'Lane four: running low.',nodes:[
      {n:10,name:'Below Reorder Level?',icon:'filter',say:'Tote: 12 in stock, 3 ordered, 9 left. Reorder level 10.',d:2.4,
        desc:'Checks whether the order leaves stock below its reorder level.'},
      {n:11,name:'Alert Operations In Slack',icon:'chat',say:'Operations hears in Slack. The order still goes through.',
        desc:'Alerts operations with the product, the stock left and the reorder level.'}]},
    {name:'Hold short orders',color:'pink',chapter:'lane 5 · hold short orders',intro:'Lane five: not enough stock.',nodes:[
      {n:12,name:'Put Order On Hold',icon:'stop',say:'Candle: 1 ordered, 0 in stock. On hold.',desc:'Marks the order On hold, with the quantity ordered and available.'},
      {n:13,name:'Email Customer About The Delay',icon:'mail',who:'samantha',z:1.1,say:'I got an email saying why. No guessing.',
        desc:'Tells the customer about the delay, with no promised date.'},
      {n:14,name:'Alert Operations In Slack',icon:'chat',say:'Operations follows up within one business day.',
        desc:'Alerts operations to follow up within one business day.'}]}]});

const T=beats([
  {id:'hi',d:1.6,say:"I'm Dennice. I sell mugs, tote bags and candles.",cam:[640,430,1.0]},
  {id:'blind',d:2.0,say:'Orders got confirmed before anyone checked the shelf.',cam:[360,440,1.15]},
  {id:'soldout',d:2.0,say:'Items sold out, and nobody saw it coming.',cam:[420,440,1.15]},
  {id:'silent',d:2.0,who:'samantha',say:'My order never came, and nobody told me why.',cam:[820,440,1.15]},
  ...WF.beats,
  {id:'stats',d:3.0,say:'Every order checked, and everyone told.',cam:[640,330,1.0],side:true}]);

CHAPS_B=[{t:0,ring:'the problem',chip:'The problem',title:'orders promised blind',mood:'problem'}];
const GO=T('wf-ov');

// the shelf: three stock counters over lanes 3 to 5, changing as each order is handled
const SHELF=[
  {lane:'L2',vals:[[-99,'mug 40'],[T('N2_0',.5),'mug 38']]},
  {lane:'L3',vals:[[-99,'tote 12'],[T('N3_0',.5),'tote 9']]},
  {lane:'L4',vals:[[-99,'candle 0']]}];
DRAW_HUD=t=>{if(t<T('L2')||t>=T('wf-run'))return;const a=ease(seg(t,T('L2'),T('L2')+.4))*(1-seg(t,T('wf-run')-.3,T('wf-run')));
  ctx.save();ctx.globalAlpha*=a;
  SHELF.forEach((p,k)=>{const x=520+k*120,y=52,v=stepVal(p.vals,t,''),on=t>=T(p.lane)&&t<T(['L3','L4','wf-run'][k]),
      low=k===1&&v==='tote 9',out=k===2;
    const col=out||low?(out?RED:AMBER):TEAL;
    sk(rr(x-52,y-18,104,36,6),{seed:980+k,fill:on?(out?'#F6D9D3':low?'#F7DDB0':'#CDE9E5'):'rgba(252,249,241,.95)',stroke:on?col:'rgba(43,38,33,.55)',lw:on?2.6:1.8});
    txt(v,x,y+1,{size:15,font:MONO,weight:600,color:on?(out?'#8E2F1F':low?'#8A5A12':'#1F6A62'):'#6b6258'});});
  ctx.restore();};

PROPS=[
  {k:'pile',x:330,type:'email',n:[[-99,0],[T('blind',.1),0],[T('blind',.8),4]],s:.6,dy:10,label:'confirmed',t1:GO},
  {k:'item',type:'cross',x:520,y:560,s:.9,label:'sold out',t0:T('soldout',.4),t1:GO}];
MARKS=[{k:'bang',x:520,y:490,t0:T('soldout',.6),t1:GO},{k:'q',x:1110,y:470,t0:T('silent',.5),t1:GO}];

ACTORS={
  dennice:{x:[[0,160]],poses:[[T('blind',.1),T('blind',.8),'type'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('soldout',.4),T('silent',1),'tired'],[T('wf-run'),T('stats',1)+9,'happy']]},
  samantha:{x:[[0,1060]],face:[[-99,-1]],vis:[[T('silent'),T('wf-ov',.4)],[T('L4'),T('stats',1)+9]],
    poses:[[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('silent',.3),T('silent',1)+.5,'puzzled'],[T('N4_1',.5),T('N4_1',1)+.5,'calm'],[T('wf-run'),T('stats',1)+9,'happy']]}};

WF.build(T);
{const a=ACTORS.dennice.x,x0=track(a,T('stats',.02));a.push([T('stats',.05),x0],[T('stats',.35),160]);}
CHAPS_B.push({t:T('stats'),ring:'result',chip:'Result',title:'the result',mood:'finale'});

STATS={t0:T('stats',.05),t1:T('stats',1)+.3,title:'every order',stats:[
  {v:'15 min',l:'between order checks',c:TEAL,size:44},{v:'3',l:'stock outcomes',c:BLUE},{v:'10',l:'orders per run',c:TEAL}]};

RECAP={opener:"Let's recap how it works.",points:[
  {c:BLUE,h:'Find new orders',x:'Every 15 minutes, up to 10 orders marked New, each product looked up by its SKU.'},
  {c:TEAL,h:'Route by stock',x:'A Router compares the quantity ordered with the stock on hand.'},
  {c:TEAL,h:'Confirm and flag',x:'Enough stock: reserved, confirmed and emailed. Below the reorder level: a Slack alert.'},
  {c:AMBER,h:'Hold short orders',x:'Not enough stock: on hold, the customer told why, operations alerted.'}],
  ending:'No order is promised until the shelf says yes, and when it says no, the customer and the team both hear about it.'};
