/* AI Unpaid Invoice Reminders — problem and fix, then the build lane by lane. Cast: Dennice (collections), Isa (a customer who disputes). */
FILM={type:'problem-fix',protag:'dennice',
  title:'AI Unpaid Invoice Reminders',
  sub:'A hand-drawn explainer of the AI Unpaid Invoice Reminders case study. Dennice plays collections and Isa plays a customer.',
  aria:'Animated film: reminders for unpaid invoices went out too often or not at all, a customer who disputed an invoice kept getting chased, and replies sat unread. The fix is shown lane by lane as on the process map: a daily check at 8:00 with data from QuickBooks, Pipedrive and Postgres and policy rules, AI-written reminders with one row per invoice, AI-read replies, and a dispute that stops all reminders until a person clears it.',
  cardTitle:'Chasing unpaid invoices, and the fix',
  intro:['Overdue invoices need a reminder, and replies need an answer.',
         'Customers who had disputed or promised a date kept getting chased.',
         'Every lane of the fix, from the 8:00 check to the reply.']};

const WF=workflow({token:'invoice',maxX:1000,
  overview:'The fix: five lanes, fifteen steps.',
  ovChapter:{ring:'fix',chip:'The fix',title:'fix · the whole build',mood:'turn'},
  running:'Every morning, every invoice, every reply.',
  runChapter:{ring:'running',chip:'Running',title:'fix · running daily',mood:'solution'},
  lanes:[
    {name:'Daily check 8:00',color:'yellow',chapter:'fix · daily check',intro:'Lane one: the 8:00 check.',nodes:[
      {n:1,name:'Every Day At 8:00',icon:'clock',say:'The collections run starts every morning at 8:00.',desc:'The collections run starts every morning.'},
      {n:2,name:'QuickBooks Invoices',title:'QuickBooks – Outstanding Invoices',icon:'money',say:'QuickBooks gives every unpaid invoice, the amount owed and the billing email.',desc:'Pulls every unpaid invoice, the amount owed and billing email.'},
      {n:3,name:'Pipedrive Context',title:'Pipedrive – Customer Context',icon:'deal',say:'Pipedrive adds the account owner and open deals, once per run.',desc:'Adds the account owner and open deals, once per run rather than per invoice.'},
      {n:4,name:'Load Collection State',icon:'db',say:'Past reminders, promises and disputes load for each invoice.',desc:'Loads past reminders, promises and disputes for every invoice.'},
      {n:5,name:'Decide Who To Remind',title:'Decide Who To Remind Today',icon:'code',branch:'disputed · promised → skip',say:'Policy rules decide who gets reminded. Not AI.',
        desc:'Policy rules, not AI: never a disputed invoice, a wrong contact or before a promised date.'},
      {name:'Route By Action',icon:'if'}]},
    {name:'Write & send',color:'blue',chapter:'fix · write and send',intro:'Lane two: write it, send it.',nodes:[
      {n:6,name:'Alert Owner (30+ days)',title:'Alert Owner Before Final Notice',icon:'chat',say:'At 30+ days late, the account owner hears first.',
        desc:'At 30+ days late, the account owner hears first, with a Pipedrive task. Sent only once.'},
      {name:'Log Final Notice',icon:'deal'},
      {n:7,name:'AI Writes Reminder',title:'AI Writes Reminder Email',icon:'robot',say:'AI writes it. Firmer when later, but never threats.',
        desc:'Firmer the later it is, but no invented fees, accusations or legal threats.'},
      {n:8,name:'Gmail – Send Reminder',icon:'mail',say:'The subject line is built by rules, so it is always right.',desc:'The subject line is built by rules, so the invoice number is always right.'},
      {n:9,name:'Save Contact Made',icon:'db',say:'One row per invoice, so nothing double-sends.',desc:'One row per invoice, enforced by the database, so nothing double-sends.'},
      {name:'Update Dashboard',icon:'db'}]},
    {name:'Read customer replies',color:'green',chapter:'fix · read replies',intro:'Lane three: every reply gets read.',nodes:[
      {n:10,name:'New Customer Reply',icon:'mail',who:'isa',say:'I disputed this invoice. Please stop.',desc:'Customer replies arrive in Gmail.'},
      {name:'Clean Up Reply',icon:'set'},
      {n:11,name:'Classify Reply Intent',icon:'robot',say:'AI sorts the reply: dispute, promise, paid, or a question.',
        desc:'AI reads the reply: dispute, promise to pay, paid, wants a copy, wrong contact or a question.'},
      {name:'Find Invoice In State',icon:'db'},{name:'Invoice Found?',icon:'if'},
      {n:12,name:'Route By Reply Type',icon:'if',say:'Each kind of reply sets the next step and date.',desc:'Each kind of reply sets the right next step and next reminder date.'}]},
    {name:'Act on the reply',color:'purple',chapter:'fix · act on the reply',intro:'Lane four: act on what they said.',nodes:[
      {n:13,name:'STOP – Dispute',title:'STOP REMINDERS (Dispute)',icon:'stop',branch:'until a person clears it',say:'A dispute stops every reminder until a person clears it.',
        desc:'A dispute stops reminders until a person clears it, with a task, alert and saved emails.'},
      {name:'Dispute Activity',icon:'deal'},{name:'Dispute Alert',icon:'chat'},{name:'Save Dispute Emails',icon:'drive'},
      {n:14,name:'Save Promised Date',icon:'db',say:'A promise moves the next reminder to the day after.',desc:'A promise moves the next reminder to the day after; “already paid” is checked in QuickBooks.'},
      {n:15,name:'Log Reply',icon:'db',say:'Every reply is logged, and the dashboard updated.',desc:'Every reply is logged and the Airtable dashboard updated.'},
      {name:'Update Dashboard',icon:'db'}]},
    {name:'If something breaks',color:'pink',chapter:'if something breaks',d:2.6,intro:'If anything fails, Slack hears about it.',
      foot:'Failures go to Slack and an error log; tomorrow’s run picks up without double-sending.',nodes:[
      {name:'When Workflow Fails',icon:'alert'},{name:'Build Error Summary',icon:'set'},{name:'Slack – Workflow Failed',icon:'chat'},{name:'Save To Error Log',icon:'db'}]}]});

const T=beats([
  {id:'hi',d:1.4,say:"I'm Dennice. I chase overdue invoices.",cam:[260,450,1.15]},
  {id:'uneven',d:2.0,say:'Some invoices got reminders daily. Others got none.',cam:[400,440,1.15]},
  {id:'dispute',d:1.8,say:'I disputed this invoice. Please stop.',who:'isa',cam:[760,420,1.0]},
  {id:'anyway',d:1.8,say:'Another reminder arrived anyway!',who:'isa',cam:[900,430,1.1]},
  {id:'unread',d:2.0,say:'Replies sat unread while the next reminder went out.',cam:[300,440,1.15]},
  {id:'cause',d:2.0,say:'No rules for who to chase, and nobody reading replies.',cam:[400,430,1.1]},
  ...WF.beats,
  {id:'quiet',d:1.8,say:'No more reminders since I disputed. Good.',who:'isa',cam:[1000,440,1.1]},
  {id:'stats',d:3.0,say:'Chased by policy, and every reply acted on.',cam:[640,330,1.0],side:true}]);

CHAPS_B=[{t:0,ring:'symptom',chip:'Symptom',title:'symptom · chased anyway',mood:'problem'},
  {t:T('cause'),ring:'cause',chip:'Cause',title:'cause · no rules',mood:'problem'}];

const GO=T('wf-ov'),MB=[1090,440],ISA=[1165,470];
PROPS=[
  {k:'mailbox',x:1090,label:'inbox',flag:[[T('anyway',.5),T('unread')],[T('N1_3'),T('N1_3',1)]]},
  {k:'item',type:'invoice',x:380,y:560,s:.9,label:'INVOICE A',t0:T('uneven',.05),t1:GO},
  {k:'pile',x:440,y:598,type:'email',n:[[-99,0],[T('uneven',.1),0],[T('uneven',.6),5]],s:.55,dy:10,t1:GO},
  {k:'item',type:'invoice',x:600,y:560,s:.9,label:'INVOICE B',t0:T('uneven',.4),t1:GO},
  {k:'pile',x:255,y:598,type:'msg',n:[[-99,0],[T('dispute',.66),0],[T('dispute',.7),1],[T('unread',.2),1],[T('unread',.8),4]],s:.6,dy:16,label:'unread',t1:GO},
  {k:'stop',x:990,h:130,t0:T('N3_0',.5),t1:T('stats',.1)}];

FLIGHTS=[
  {type:'msg',from:ISA,to:[255,540],t0:T('dispute',.3),t1:T('dispute',.7),s:.7,label:'dispute'},
  {type:'email',from:[190,480],to:MB,t0:T('anyway',.1),t1:T('anyway',.45),s:.6},
  {type:'msg',from:ISA,to:[255,520],t0:T('unread',.15),t1:T('unread',.4),s:.6,soft:true},
  {type:'email',from:[190,480],to:MB,t0:T('unread',.5),t1:T('unread',.85),s:.6},
  {type:'msg',from:ISA,to:[laneXs(6)[0],NODE_Y],t0:T('N2_0',.3),t1:T('N2_0',.7),s:.6,label:'dispute',h:60}];
MARKS=[
  {k:'label',txt:'no reminders',color:AMBER,x:600,y:500,t0:T('uneven',.6),t1:GO,mono:true,quiet:true},
  {k:'bang',x:1090,y:370,t0:T('anyway',.5),t1:T('unread')},
  {k:'q',x:640,y:300,t0:T('cause',.3),t1:GO}];

ACTORS={
  dennice:{x:[[0,150]],
    poses:[[T('uneven',.1),T('uneven',.6),'type'],[T('anyway',.05),T('anyway',.4),'type'],[T('unread',.45),T('unread',.85),'type'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('anyway',.6),T('anyway',1),'alert'],[T('unread'),T('unread',1),'tired'],[T('cause'),T('cause',1),'puzzled'],[T('stats'),T('stats',1)+9,'happy']]},
  isa:{x:[[0,1190]],face:[[-99,-1]],
    poses:[[T('dispute',.1),T('dispute',.6),'talk'],[T('N2_0',.1),T('N2_0',.5),'throw']],
    moods:[[T('dispute'),T('dispute',1),'puzzled'],[T('anyway',.5),T('unread',1),'alert'],[T('N2_0'),T('N2_0',1),'puzzled'],[T('quiet'),T('stats',1)+9,'calm']]}};

WF.build(T);
{const a=ACTORS.dennice.x,x0=track(a,T('quiet',.02));a.push([T('quiet',.05),x0],[T('quiet',.4),150]);}
CHAPS_B.push({t:T('quiet'),ring:'confirmed',chip:'Confirmed',title:'confirmed · it stopped',mood:'finale'});

STATS={t0:T('stats',.05),t1:T('stats',1)+.3,title:'every overdue invoice',stats:[
  {v:'0',l:'reminders during a dispute',c:TEAL},{v:'1',l:'row per invoice, enforced',c:BLUE},{v:'7',l:'reply types understood',c:TEAL}]};

RECAP={opener:"Let's recap what we learned.",points:[
  {c:RED,h:'The symptom',x:'Reminders too often or not at all, disputed customers still chased, and replies left unread.'},
  {c:AMBER,h:'The cause',x:'No fixed rules for who to remind, and nobody reading the replies.'},
  {c:TEAL,h:'The fix',x:'An 8:00 check with QuickBooks, Pipedrive and Postgres; rules decide, AI writes and reads every reply.'},
  {c:TEAL,h:'Confirmed',x:'A dispute stops all reminders until a person clears it, and one row per invoice stops double sends.'}],
  ending:'Rules decide who gets chased, and a dispute stops the chase until a person steps in.'};
