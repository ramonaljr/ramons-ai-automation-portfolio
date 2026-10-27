/* Lead Scoring & Follow-Up — how it works, lane by lane, with a 15-minute countdown. Cast: Dennice (sales rep), Jeson (a business owner), Karan (sales manager). */
FILM={type:'how-it-works',protag:'dennice',
  title:'Lead Scoring & Follow-Up',
  sub:'A hand-drawn explainer of the Lead Scoring & Follow-Up case study. Dennice plays a sales rep, Jeson a business owner and Karan the sales manager.',
  aria:'Animated film: website leads used to wait in an inbox. The n8n build is shown lane by lane as on its process map: receive and reply in under a second, read, score out of 100 by fixed rules and assign the least-recently-assigned rep with a 15-minute deadline counted in working hours, a 15-minute follow-up check every 5 minutes that hands overdue leads to the sales manager, and an error lane for when something breaks.',
  cardTitle:'How every lead gets a person within 15 working minutes',
  intro:['Businesses ask about rooftop solar through the website form.',
         'Good leads go cold in an inbox, and some are never called back.',
         'Every lane, from the form to a rep, within 15 working minutes.']};

const WF=workflow({token:'form',minX:210,maxX:1100,
  overview:'The whole build: four lanes, fifteen steps.',
  ovChapter:{ring:'the build',chip:'The build',title:'the whole build',mood:'setup'},
  running:'Every lead runs these lanes. None slip away.',
  runChapter:{ring:'running',chip:'Running',title:'the whole line, running',mood:'finale'},
  lanes:[
    {name:'Receive & reply fast',color:'yellow',chapter:'lane 1 · reply fast',intro:'Lane one: answer at once.',nodes:[
      {n:1,name:'New Lead From Website Form',icon:'hook',who:'jeson',say:'I asked about solar for our building.',desc:'The website form sends each enquiry straight in.'},
      {name:'Clean Up Form Data',icon:'set'},
      {n:2,name:'Name & Email Valid?',icon:'if',branch:'invalid → error, still logged',bc:AMBER,say:'Missing details get a clear error. Invalid forms are still logged.',
        desc:'Missing details get a clear error back, and invalid forms are still logged.'},
      {n:3,name:'Reply To Form – Received',icon:'hook',who:'jeson',say:'A "received" reply, in under a second!',desc:'The visitor gets a “received” reply in under a second, before any AI runs.'},
      {n:4,name:'Find Existing Lead',icon:'db',say:'It spots existing customers and repeats from the last 24 hours.',desc:'Spots existing customers and repeat enquiries from the last 24 hours.'}]},
    {name:'Read, score & assign',color:'blue',chapter:'lane 2 · score, assign',intro:'Lane two: read it, score it, assign it.',nodes:[
      {n:5,name:'AI Reads Enquiry',icon:'robot',say:'AI reads what they want and how urgent. It never guesses.',desc:'Reads what they want, urgency, budget hints and any solar details they state. Never guesses.'},
      {n:6,name:'Score And Tier Lead',icon:'code',say:'Fixed rules score it out of 100, with the reasons.',desc:'Fixed rules score the lead out of 100: electricity use, ownership, roof, urgency.'},
      {n:7,name:'Route By Lead Type',icon:'if',branch:'low priority, duplicates → logged',bc:AMBER,say:'Large, small or existing customers get a rep.',
        desc:'Large, small or existing customers get a rep; low priority and duplicates are only logged.'},
      {n:8,name:'Assign Rep',icon:'db',say:'The rep assigned least recently gets it. Leads rotate fairly.',desc:'Picks the rep for that lead type assigned least recently, so leads rotate fairly.'},
      {n:9,name:'Save Lead To Airtable',icon:'db',say:"It's saved with a 15-minute deadline, in working hours.",desc:'Saves the lead with a 15-minute deadline in working hours.'},
      {n:10,name:'AI Writes Reply Email',icon:'robot',say:'A short reply in their terms. No prices, savings or sizes.',desc:'A short reply in the lead’s own terms. No prices, savings or system sizes.'},
      {n:11,name:'Email Reply To Lead',icon:'mail',who:'jeson',say:'Then a personal reply, with my rep to answer.',desc:'Sent with the rep as reply-to, or a safe standard reply if the AI fails.'},
      {n:12,name:'Alert Rep In Slack',icon:'chat',say:"I'm tagged in Slack with the score. The clock starts.",desc:'Tags the rep with the score, reasons and site details, and starts the clock.'},
      {name:'Save To Lead Log',icon:'sheet'}]},
    {name:'15-minute follow-up check',color:'green',chapter:'lane 3 · 15 min check',intro:'Lane three: nobody gets forgotten.',who:'karan',nodes:[
      {n:13,name:'Every 5 Minutes',icon:'clock',who:'karan',say:'Every 5 minutes, it checks for leads nobody followed up.',desc:'Checks for leads that nobody has followed up yet.'},
      {name:'Lookup Sales Manager',icon:'db'},
      {n:14,name:'Find Overdue Leads',icon:'db',who:'karan',say:'It finds leads with no rep, or no contact by their deadline.',desc:'Finds leads with no rep, or not contacted by their deadline.'},
      {n:15,name:'Reassign To Manager',icon:'db',who:'karan',say:'Those come to me, with a Slack alert and a log.',desc:'Hands them to the sales manager, alerts Slack and logs the escalation.'},
      {name:'Alert – Not Followed Up',icon:'chat'},{name:'Save To Escalation Log',icon:'sheet'}]},
    {name:'If something breaks',color:'pink',chapter:'lane 4 · if it breaks',d:2.6,intro:'If anything fails, Slack hears about it.',
      foot:'Failures go to Slack and an error log.',nodes:[
      {name:'When Workflow Fails',icon:'alert'},{name:'Build Error Summary',icon:'set'},{name:'Alert – Workflow Failed',icon:'chat'},{name:'Save To Error Log',icon:'sheet'}]}]});

const T=beats([
  {id:'hi',d:1.4,say:"I'm Dennice. I sell rooftop solar to businesses.",cam:[980,450,1.15]},
  {id:'cold',d:2.0,say:'Good leads used to wait in an inbox and go cold.',cam:[900,450,1.1]},
  ...WF.beats,
  {id:'stats',d:3.0,say:'No lead slips away quietly anymore.',cam:[640,330,1.0]}]);

CHAPS_B=[{t:0,ring:'overview',chip:'Overview',title:'the system',mood:'problem'}];
const GO=T('wf-ov');
const T0=T('N1_4',.5),T1=T('N2_3',.5);
FILM.ticks=[[T0,T1]];
DRAW_HUD=t=>{if(t<T0||t>=T('L3'))return;const a=ease(seg(t,T0,T0+.3))*(1-seg(t,T('L3')-.3,T('L3')));
  const left=15*(1-seg(t,T0,T1)),m=Math.floor(left),sec=Math.floor((left-m)*60),c=left<=0?RED:left<3?AMBER:TEAL;ctx.save();ctx.globalAlpha*=a;
  sk(rr(520,30,240,48,10),{seed:975,fill:'rgba(252,249,241,.95)',stroke:c,lw:2.4});
  ctx.beginPath();ctx.moveTo(552,54);ctx.arc(552,54,15,-Math.PI/2,-Math.PI/2+(left/15)*Math.PI*2);ctx.closePath();ctx.fillStyle=c+'88';ctx.fill();sk(ell(552,54,15,15,16),{seed:976,lw:1.8,amp:.3});
  txt(left<=0?'0:00 · reassigned':m+':'+String(sec).padStart(2,'0')+' to follow up',580,55,{size:16,font:MONO,weight:600,align:'left',color:c});ctx.restore();};

PROPS=[
  {k:'sign',x:150,h:185,w:150,txt:'website form',size:18},
  {k:'pile',x:820,type:'form',n:[[-99,0],[T('cold',.1),0],[T('cold',.7),5]],s:.6,dy:12,label:'inbox',t1:GO}];
MARKS=[{k:'zz',x:860,y:470,t0:T('cold',.5),t1:GO}];

ACTORS={
  dennice:{x:[[0,1050]],face:[[-99,-1]],poses:[[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('cold'),T('cold',1),'tired'],[T('wf-run'),T('stats',1)+9,'happy']]},
  jeson:{x:[[0,100]],
    poses:[[T('N0_0',.25),T('N0_0',.6),'throw'],[T('N0_3',.4),T('N0_3',1),'cheer']],
    moods:[[T('N0_3',.3),T('N0_3',1)+.6,'happy'],[T('N1_6',.4),T('stats',1)+9,'happy']]},
  karan:{x:[[0,1190]],face:[[-99,-1]],
    poses:[[T('N2_0',.2),T('N2_2',.9),'mag'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('stats'),T('stats',1)+9,'happy']]}};

WF.build(T);
{const a=ACTORS.dennice.x,x0=track(a,T('stats',.02));a.push([T('stats',.05),x0],[T('stats',.35),1050]);}
CHAPS_B.push({t:T('stats'),ring:'result',chip:'Result',title:'the result',mood:'finale'});

STATS={t0:T('stats',.05),t1:T('stats',1)+.3,title:'every lead',stats:[
  {v:'< 1 sec',l:'reply to the form',c:TEAL,size:44},{v:'15 min',l:'deadline, in working hours',c:AMBER,size:44},{v:'100',l:'point rule-based score',c:BLUE}]};

RECAP={opener:"Let's recap how it works.",points:[
  {c:BLUE,h:'Receive & reply fast',x:'Checked, answered in under a second, and matched against existing customers and repeat enquiries.'},
  {c:TEAL,h:'Read, score & assign',x:'AI reads it, fixed rules score it out of 100, the least-recently-assigned rep gets it, and Slack tags them.'},
  {c:AMBER,h:'15-minute follow-up check',x:'Every 5 minutes, any lead past its working-hours deadline goes to the sales manager.'},
  {c:RED,h:'If something breaks',x:'Failures go to Slack and an error log.'}],
  ending:'No lead waits in an inbox. Within 15 working minutes someone owns it, or the manager does.'};
