/* New Employee Onboarding — how it works, lane by lane. Cast: Myk (HR), Unix (she, the new hire). */
FILM={type:'how-it-works',protag:'myk',
  title:'New Employee Onboarding',
  sub:'A hand-drawn explainer of the New Employee Onboarding case study. Myk plays HR and Unix plays a new hire.',
  aria:'Animated film: every new hire meant the same setup by hand. The n8n build is shown lane by lane as on its process map: form and plan, set everything up, document upload, a daily check at 8:00 with check-ins on day -7, 0, 3, 7 and 30 and at most one email a day, and a chat assistant for the HR team that answers only from company policy.',
  cardTitle:'How one form carries a new hire through 30 days',
  intro:['Every new hire needs folders, records, orientation, access and a welcome.',
         'Documents get chased by hand, and key cards get forgotten.',
         'Every lane, from one form to day 30.']};

const WF=workflow({token:'form',maxX:1080,
  overview:'The whole build: five lanes, fifteen steps.',
  ovChapter:{ring:'the build',chip:'The build',title:'the whole build',mood:'setup'},
  running:'Every new hire, set up and followed up the same way.',
  runChapter:{ring:'running',chip:'Running',title:'the whole line, running',mood:'finale'},
  lanes:[
    {name:'Form & plan',color:'yellow',chapter:'lane 1 · form and plan',intro:'Lane one: one form, one plan.',nodes:[
      {n:1,name:'New Hire Intake Form',icon:'form',say:'I enter the new hire, role, shift manager and start date.',desc:'HR enters the new hire, role, shift manager and start date.'},
      {name:'Clean Up Details',icon:'set'},
      {n:2,name:'Details Complete?',icon:'if',branch:'missing → stop, alert HR',say:'Anything missing stops it, and alerts HR.',desc:'Anything missing stops onboarding and alerts HR, so nobody is half set up.'},
      {n:3,name:'Generate Plan',title:'Generate Onboarding Plan',icon:'code',say:'It builds the task and document list for that role.',desc:'Builds the task and document list for that hotel role, all in one place.'},
      {name:'One Row Per Task',icon:'list'},
      {n:4,name:'Save Tasks & Docs',title:'Save Tasks & Documents',icon:'db',say:'Each task and document gets its own Airtable row.',desc:'Each task and document gets its own Airtable row, so each can be tracked.'}]},
    {name:'Set everything up',color:'blue',chapter:'lane 2 · set up',intro:'Lane two: set everything up.',nodes:[
      {n:5,name:'Create Drive Folder',title:'Create Onboarding Folder',icon:'drive',say:'A private Google Drive folder for the new hire.',desc:'A private Google Drive folder for the new hire.'},
      {name:'Employee Record',icon:'db'},
      {n:6,name:'Book Orientation',title:'Book Day 1 Orientation',icon:'cal',say:'Day 1 orientation goes into Google Calendar.',desc:'Puts the first-day orientation in Google Calendar.'},
      {n:7,name:'Notify IT And Manager',icon:'chat',say:'IT and the shift manager hear in Slack: access, key card.',desc:'Tells IT and the shift manager in Slack, for system access and a key card.'},
      {n:8,name:'Send Welcome Email',icon:'mail',who:'unix',say:'I got a welcome email!',desc:'A welcome email to the new hire, then a log entry.'},
      {name:'Log Started',icon:'sheet'}]},
    {name:'Document upload',color:'green',chapter:'lane 3 · documents',intro:'Lane three: documents come in.',nodes:[
      {n:9,name:'Document Upload Form',icon:'form',who:'unix',say:'I upload each document through a simple form.',desc:'The new hire uploads each requested document through a simple form.'},
      {name:'Save To Drive',icon:'drive'},
      {n:10,name:'Mark Received',title:'Mark Document Received',icon:'db',say:'Saved, and marked received. That reminder ends.',desc:'Saves the file to Drive and marks it received, which ends that reminder.'},
      {name:'Notify HR',icon:'chat'}]},
    {name:'Daily check 8:00',color:'purple',chapter:'lane 4 · daily check',intro:'Lane four: every morning at 8:00.',nodes:[
      {n:11,name:'Every Day At 8:00',icon:'clock',say:'It checks everyone still onboarding, every morning.',desc:'Checks everyone still onboarding, every morning.'},
      {name:'Find Onboarding',icon:'db'},{name:'Missing Documents',icon:'db'},
      {n:12,name:'Decide Today’s Action',title:'Decide Action For Today',icon:'code',d:2.8,say:'At most one email a day: check-ins, else reminders.',
        desc:'At most one email a day: check-ins on day −7, 0, 3, 7 and 30, else reminders.'},
      {name:'Route By Action',icon:'if'},{name:'Email New Hire',icon:'mail'},
      {n:13,name:'Remind IT',icon:'chat',say:'IT is chased for her access and key card.',desc:'Chases overdue access and key cards. Missing documents never hold this up.'},
      {n:14,name:'Mark Complete',title:'Mark Onboarding Complete',icon:'db',say:'Day 30, everything in: onboarding closes.',desc:'After 30 days, all documents in and IT confirmed, onboarding closes.'}]},
    {name:'HR assistant',color:'gray',chapter:'lane 5 · HR assistant',intro:'Lane five: answers on tap.',nodes:[
      {name:'HR Assistant Chat',icon:'chat',who:'myk',say:'What does our policy say about overtime?'},
      {n:15,name:'HR Assistant (AI)',icon:'robot',say:"It answers only from our HR policy, and says when it can't.",desc:'A chat assistant for the HR team that answers only from HR policy, and says when it cannot.'},
      {name:'Search HR Policies',icon:'db'}]}]});

const T=beats([
  {id:'hi',d:1.6,say:"I'm Myk, from HR. Unix starts with us soon.",cam:[640,430,1.0]},
  {id:'byhand',d:2.0,say:'Every hire meant folders, records and emails, by hand.',cam:[360,440,1.15]},
  {id:'chase',d:2.0,say:'Documents chased one email at a time. Key cards forgotten.',cam:[360,440,1.15]},
  ...WF.beats,
  {id:'stats',d:3.0,say:'Set up from one form, followed up for 30 days.',cam:[640,330,1.0],side:true}]);

CHAPS_B=[{t:0,ring:'overview',chip:'Overview',title:'the system',mood:'problem'}];
const GO=T('wf-ov');
const DAYS=['day −7','day 0','day 3','day 7','day 30'];
const dayAt=t=>stepVal([[T('N3_3',.2),0],[T('N3_3',.4),1],[T('N3_3',.6),2],[T('N3_3',.8),3],[T('N3_7',.4),4]],t,-1);
DRAW_HUD=t=>{if(t<T('L3')||t>=T('L4'))return;const a=ease(seg(t,T('L3'),T('L3')+.4))*(1-seg(t,T('L4')-.3,T('L4')));const i=dayAt(t);ctx.save();ctx.globalAlpha*=a;
  DAYS.forEach((d,k)=>{const x=430+k*84,y=52;const on=k===i,past=k<i;
    sk(rr(x-38,y-18,76,36,6),{seed:970+k,fill:on?'#F7DDB0':past?'#CDE9E5':'rgba(252,249,241,.95)',stroke:on?AMBER:past?TEAL:'rgba(43,38,33,.55)',lw:on?2.6:1.8});
    txt(d,x,y+1,{size:15,font:MONO,weight:600,color:on?'#8A5A12':past?'#1F6A62':'#6b6258'});});ctx.restore();};

PROPS=[
  {k:'pile',x:330,type:'folder',n:[[-99,0],[T('byhand',.1),0],[T('byhand',.8),4]],s:.7,dy:14,label:'by hand',t1:GO},
  {k:'pile',x:470,type:'email',n:[[-99,0],[T('chase',.1),0],[T('chase',.8),5]],s:.6,dy:10,label:'chasing',t1:GO},
  {k:'item',type:'key',x:600,y:560,s:.9,label:'forgotten',t0:T('chase',.5),t1:GO}];
MARKS=[{k:'q',x:600,y:490,t0:T('chase',.6),t1:GO}];

ACTORS={
  myk:{x:[[0,160]],poses:[[T('byhand',.1),T('byhand',.8),'type'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('byhand',.5),T('chase',1),'tired'],[T('wf-run'),T('stats',1)+9,'happy']]},
  unix:{x:[[0,1180]],face:[[-99,-1]],
    poses:[[T('N1_4',.6),T('N1_4',1),'cheer'],[T('N2_0',.2),T('N2_0',.6),'throw'],[T('N4_0',.2),T('N4_0',.6),'throw'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('N1_4',.5),T('N1_4',1)+.5,'happy'],[T('N4_0'),T('N4_0',1),'puzzled'],[T('N4_1',.6),T('N4_1',1)+.5,'happy'],[T('wf-run'),T('stats',1)+9,'happy']]}};

WF.build(T);
{const a=ACTORS.myk.x,x0=track(a,T('stats',.02));a.push([T('stats',.05),x0],[T('stats',.35),160]);}
CHAPS_B.push({t:T('stats'),ring:'day 30',chip:'Day 30',title:'the first month',mood:'finale'});

STATS={t0:T('stats',.05),t1:T('stats',1)+.3,title:'the first month',stats:[
  {v:'30',l:'days followed up',c:TEAL},{v:'5',l:'check-in milestones',c:BLUE},{v:'1',l:'email a day, at most',c:TEAL}]};

RECAP={opener:"Let's recap how it works.",points:[
  {c:BLUE,h:'Form & plan',x:'HR fills in one form. Missing details stop it; otherwise a plan is built and every task gets its own row.'},
  {c:TEAL,h:'Set up and documents',x:'Drive folder, record, Day 1 orientation, Slack to IT, a welcome email, and uploads marked received.'},
  {c:TEAL,h:'Daily check 8:00',x:'Check-ins on day −7, 0, 3, 7 and 30, at most one email a day, IT chased, closed at day 30.'},
  {c:TEAL,h:'HR assistant',x:'Answers only from company HR policy, and says when the policy does not cover it.'}],
  ending:'One form sets everything up, and the first 30 days follow themselves up.'};
