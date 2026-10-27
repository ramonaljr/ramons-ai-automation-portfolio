/* AI Invoice Processing & Approval — how it works, lane by lane. Cast: Dennice (accounts payable), Karan (budget owner). */
FILM={type:'how-it-works',protag:'dennice',
  title:'AI Invoice Processing',
  sub:'A hand-drawn explainer of the AI Invoice Processing & Approval case study. Dennice plays accounts payable and Karan plays the budget owner.',
  aria:'Animated film: construction invoices arrive by email. The n8n build is shown lane by lane as on its process map: receive and de-duplicate, read and check against the purchase order and delivery record with fixed rules, approve in Slack and post to QuickBooks after retention, with every outcome logged, and an error lane for when something breaks.',
  cardTitle:"How an invoice gets checked before it's paid",
  intro:['Construction invoices arrive by email, with POs and delivery records behind them.',
         'Progress payments make it easy to pay twice, or to pay too much.',
         'Every lane an invoice passes through before anyone pays it.']};

const WF=workflow({token:'invoice',maxX:990,
  overview:'The whole build: four lanes, fifteen steps.',
  ovChapter:{ring:'the build',chip:'The build',title:'the whole build',mood:'setup'},
  running:'Now every invoice runs down these lanes.',
  runChapter:{ring:'running',chip:'Running',title:'the whole line, running',mood:'finale'},
  lanes:[
    {name:'Receive & de-duplicate',color:'yellow',chapter:'lane 1 · receive',intro:'Lane one: pick it up, once.',nodes:[
      {n:1,name:'New Invoice Email',icon:'mail',say:'Every 5 minutes, unread emails with a PDF are picked up.',desc:'Every 5 minutes, picks up unread emails with a PDF attached.'},
      {name:'Find PDF Attachment',icon:'code'},{name:'Has PDF Attachment?',icon:'if'},
      {n:2,name:'Extract PDF Text',icon:'pdf',say:'The text is pulled out of the PDF.',desc:'Pulls the text out of the PDF. Emails without one are ignored.'},
      {n:3,name:'Text Extracted?',icon:'if',branch:'scanned image → team',say:'A scan with no readable text goes to the team.',
        desc:'A scanned image with no readable text goes to the team instead of the AI.'},
      {name:'Create Invoice ID',icon:'set'},
      {n:4,name:'Search Invoice Log',icon:'sheet',say:'Already processed? Skipped, before any AI cost.',desc:'Skips any email and file already processed, before any AI cost.'},
      {name:'Seen This Invoice Before?',icon:'if'}]},
    {name:'Read & check',color:'blue',chapter:'lane 2 · read and check',intro:'Lane two: read it, then check it.',nodes:[
      {n:5,name:'AI Reads Invoice',icon:'robot',say:'AI pulls out the vendor, PO, billing and retention.',desc:'Pulls out vendor, PO and job numbers, billing figures, retention and lien waiver.'},
      {n:6,name:'AI Sure Of The Details?',icon:'if',branch:'below 80% → a person checks',pose:'mag',say:'Below 80% confidence, I confirm the details in Slack.',
        desc:'Below 80% confidence, a person confirms the details in Slack first.'},
      {name:'Ask Team To Check Details',icon:'chat'},
      {n:7,name:'Search Log By Invoice Number',icon:'sheet',say:'A second check catches the same invoice, re-sent.',desc:'Catches the same invoice re-sent in a new email.'},
      {n:8,name:'Find Purchase Order',title:'Find PO & Delivery Record',icon:'db',say:'It finds the purchase order and the delivery record.',desc:'Looks up the purchase order and delivery record in Airtable.'},
      {name:'Find Delivery Record',icon:'db'},
      {n:9,name:'Check Invoice & Flag Issues',icon:'code',say:'Fixed rules check the numbers and flag any issues.',
        desc:'Fixed rules: amounts within 2%, billing adds up, retention held, lien waiver attached.'}]},
    {name:'Approve & post',color:'green',chapter:'lane 3 · approve, post',intro:'Lane three: a person approves.',nodes:[
      {name:'Any Issues Found?',icon:'if'},
      {n:10,name:'Approve in Slack',icon:'chat',who:'karan',say:'Clean ones come to me in Slack. I approve.',desc:'Issues go to AP, clean invoices to the budget owner. Waits up to 2 days.'},
      {n:11,name:'Approved?',icon:'if',branch:'rejected → logged, not posted',say:'Rejected invoices are logged, and never posted.',desc:'Rejected invoices are logged and never posted.'},
      {n:12,name:'Find QuickBooks Vendor',icon:'money',branch:'no vendor → held',bc:AMBER,say:'Vendor not in QuickBooks? The bill is held.',
        desc:'If the vendor is not in QuickBooks, the bill is held and the team alerted.'},
      {name:'Vendor In QuickBooks?',icon:'if'},
      {n:13,name:'Add Bill To QuickBooks',icon:'money',say:'The bill posts after retention, to the right account.',desc:'Posts the amount to pay after retention, to the right expense account.'},
      {n:14,name:'Save To Invoice Log',icon:'sheet',say:'Every invoice is logged: posted, rejected or held.',desc:'Every invoice is logged: posted, rejected or vendor missing.'},
      {n:15,name:'Mark Email As Read',icon:'mail',say:'Every path ends here, with the email marked read.',desc:'Every path ends here, so the inbox shows only what still needs attention.'}]},
    {name:'If something breaks',color:'pink',chapter:'lane 4 · if it breaks',d:2.6,intro:'If anything fails, Slack hears about it.',
      foot:'Failures go to Slack and an error log, with the invoice flagged for manual entry.',nodes:[
      {name:'When Workflow Fails',icon:'alert'},{name:'Build Error Summary',icon:'set'},{name:'Alert – Workflow Failed',icon:'chat'},{name:'Log Error To Sheet',icon:'sheet'}]}]});

const T=beats([
  {id:'hi',d:1.4,say:"I'm Dennice. I pay the construction invoices.",cam:[260,450,1.15]},
  {id:'risk',d:1.8,say:'Progress payments make paying twice, or too much, easy.',cam:[330,450,1.15]},
  ...WF.beats,
  {id:'stats',d:3.0,say:'Matched, checked twice, and every invoice logged.',cam:[640,330,1.0],side:true}]);

CHAPS_B=[{t:0,ring:'overview',chip:'Overview',title:'the system',mood:'setup'}];
const GO=T('wf-ov');
PROPS=[
  {k:'mailbox',x:62,label:'Gmail',flag:[[GO,T('stats')]]},
  {k:'pile',x:300,y:598,type:'invoice',n:[[-99,0],[T('risk',.05),0],[T('risk',.5),5],[GO,5],[GO+.4,0]],s:.7,dy:10},
  {k:'shelf',x:1060,w:120,h:120,label:'QuickBooks',cubbies:['bills'],fill:[[[-99,.2],[T('N2_5',.6),.6]]],t0:T('L2')}];
MARKS=[
  {k:'flag',x:325,y:520,t0:T('risk',.55),t1:GO},
  {k:'label',txt:'same work, billed twice?',color:RED,x:470,y:545,t0:T('risk',.6),t1:GO,quiet:true}];

ACTORS={
  dennice:{x:[[0,150]],poses:[[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('risk',.3),T('risk',1),'puzzled'],[T('wf-run'),T('stats',1)+9,'happy']]},
  karan:{x:[[0,1360],[T('L2',-.2),1360],[T('L2',.3),1200]],face:[[-99,-1]],
    poses:[[T('N2_1',.3),T('N2_1',.9),'type'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('wf-run'),T('stats',1)+9,'happy']]}};

WF.build(T);
{const a=ACTORS.dennice.x,x0=track(a,T('stats',.02));a.push([T('stats',.05),x0],[T('stats',.35),150]);}
CHAPS_B.push({t:T('stats'),ring:'result',chip:'Result',title:'every invoice',mood:'finale'});

STATS={t0:T('stats',.05),t1:T('stats',1)+.3,title:'every invoice',stats:[
  {v:'3-way',l:'invoice, PO and delivery match',c:TEAL},{v:'2',l:'duplicate checks',c:BLUE},{v:'100%',l:'invoices logged',c:TEAL}]};

RECAP={opener:"Let's recap how it works.",points:[
  {c:BLUE,h:'Receive & de-duplicate',x:'Every 5 minutes, invoice PDFs come in, scans go to the team, and repeats are skipped before any AI cost.'},
  {c:TEAL,h:'Read & check',x:'AI reads the figures, a person checks anything under 80%, and fixed rules match the PO and delivery record.'},
  {c:TEAL,h:'Approve & post',x:'A person approves in Slack; QuickBooks gets the bill after retention, and every outcome is logged.'},
  {c:RED,h:'If something breaks',x:'Failures go to Slack and an error log, with the invoice flagged for manual entry.'}],
  ending:"Every bill is checked against the paperwork, and a person says yes before it's paid."};
