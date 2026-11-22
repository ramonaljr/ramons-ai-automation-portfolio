/* Gmail Attachment Filing — before and after, lane by lane. Cast: Karan (the bookkeeper), Leo (a client). */
FILM={type:'how-it-works',protag:'karan',
  title:'Gmail Attachment Filing',
  sub:'A hand-drawn explainer of the Gmail Attachment Filing case study. Karan plays the bookkeeper and Leo plays a client.',
  aria:'Animated film: client attachments used to be saved by hand under names like scan001.pdf. The Make build is shown lane by lane as on its process map: every 15 minutes it finds emails labelled To File and keeps only real attachments, Gemini reads each file and gives it a short, descriptive name, the file is saved to Google Drive and logged in Google Sheets, the sender gets one receipt listing every file, and a failed Gemini or Drive step is retried up to 3 times, 15 minutes apart.',
  cardTitle:'How every attachment gets named, filed and logged',
  intro:['Clients email their receipts, statements and scans.',
         'Files were saved by hand, under names that say nothing.',
         'Label the email To File, and the filing does itself.']};

const WF=workflow({token:'form',maxX:1000,
  overview:'The whole build: five lanes, one scenario.',
  ovChapter:{ring:'the build',chip:'The build',title:'the whole build',mood:'setup'},
  running:'Every labelled email runs these lanes.',
  runChapter:{ring:'running',chip:'Running',title:'the whole line, running',mood:'finale'},
  lanes:[
    {name:'Find new attachments',color:'yellow',chapter:'lane 1 · find attachments',intro:'Lane one: find the new attachments.',nodes:[
      {n:1,name:'Every 15 Minutes',icon:'clock',say:'Every 15 minutes, it checks the inbox.',desc:'Runs on its own, every 15 minutes.'},
      {n:2,name:'Watch Emails Labelled To File',icon:'mail',say:'I label an email To File. That is all I do.',desc:'Finds emails labelled To File that have attachments, up to 10 per run.'},
      {n:3,name:'List Attachments',icon:'list',say:'Each attachment on the email is listed.',desc:'Lists every attachment on each email.'},
      {n:4,name:'Keep Real Attachments',icon:'filter',branch:'logos, Office files → skipped',bc:AMBER,d:2.4,say:'Signature logos, Office files and empty parts are skipped.',
        desc:'No Office documents, no empty parts, and nothing 20 KB or smaller, such as signature logos.'}]},
    {name:'Name it with AI',color:'blue',chapter:'lane 2 · name it',intro:'Lane two: a name that says what it is.',nodes:[
      {n:5,name:'Upload File To Gemini',icon:'ai',say:'Each file is uploaded to Gemini.',desc:'Uploads the file to Gemini.'},
      {n:6,name:'Gemini Names The File',icon:'robot',say:'Gemini reads it and gives it a short, clear name.',d:2.4,
        desc:'Returns a short, descriptive name, keeping the original extension.'}]},
    {name:'File and log',color:'green',chapter:'lane 3 · file and log',intro:'Lane three: file it, and write it down.',nodes:[
      {n:7,name:'Upload To Drive Folder',icon:'drive',say:'It is saved to the client documents folder in Drive.',desc:'Saves the file to the client documents folder in Google Drive.'},
      {n:8,name:'Add Row To Sheets Log',icon:'sheet',say:'A log row: date, both names, file type and link.',d:2.4,
        desc:'Adds the date, original name, new name, file type and link to the Google Sheets log.'}]},
    {name:'Confirm once',color:'purple',chapter:'lane 4 · confirm once',intro:'Lane four: one receipt per email.',nodes:[
      {n:9,name:'Gather New File Names',icon:'list',say:'The new names from that email are gathered into one list.',desc:'Gathers every new name from the email into one list.'},
      {n:10,name:'Any Files Saved?',icon:'if',branch:'none saved → no receipt',bc:AMBER,say:'Nothing saved? Then no empty receipt goes out.',desc:'A receipt is sent only when at least one file was saved.'},
      {n:11,name:'Send Receipt To Sender',icon:'mail',who:'leo',say:'One receipt: each file as its new name, sent as the old one.',d:2.6,
        desc:'One receipt to the sender, listing each file as its new name, sent as the old one.'}]},
    {name:'If something breaks',color:'pink',chapter:'lane 5 · if it breaks',intro:'Lane five: when Gemini or Drive fails.',
      foot:'A failed step is retried before it stops.',nodes:[
      {n:12,name:'Gemini Or Drive Step Fails',icon:'alert',say:'Sometimes Gemini or Drive fails.',desc:'A Gemini or Drive step fails.'},
      {n:13,name:'Wait 15 Minutes',icon:'clock',say:'It waits 15 minutes.',desc:'Waits 15 minutes between tries.'},
      {n:14,name:'Retry Up To 3 Times',icon:'loop',say:'Then tries again, up to 3 times, before it stops.',desc:'Retries the step up to 3 times before it stops.'}]}]});

const T=beats([
  {id:'hi',d:1.6,say:"I'm Karan. Clients email me receipts, statements and scans.",cam:[640,430,1.0]},
  {id:'byhand',d:2.0,say:'I saved every attachment by hand, under names like scan001.pdf.',cam:[360,440,1.15]},
  {id:'silent',d:2.0,who:'leo',say:'I never knew if my documents arrived.',cam:[820,440,1.15]},
  ...WF.beats,
  {id:'stats',d:3.0,say:'Label it once. It is named, filed and logged.',cam:[640,330,1.0],side:true}]);

CHAPS_B=[{t:0,ring:'the problem',chip:'The problem',title:'filing by hand',mood:'problem'}];
const GO=T('wf-ov');

// The file's name, before and after Gemini reads it.
const NAME=[[-99,'scan001.pdf'],[T('N1_1',.5),'Office Supplies Receipt.pdf']];
DRAW_HUD=t=>{if(t<T('L1')||t>=T('wf-run'))return;const a=ease(seg(t,T('L1'),T('L1')+.4))*(1-seg(t,T('wf-run')-.3,T('wf-run')));
  const v=stepVal(NAME,t,''),named=v!=='scan001.pdf';ctx.save();ctx.globalAlpha*=a;
  sk(rr(440,34,400,40,8),{seed:982,fill:named?'#CDE9E5':'rgba(252,249,241,.95)',stroke:named?TEAL:'rgba(43,38,33,.55)',lw:2.2});
  txt(v,640,55,{size:16,font:MONO,weight:600,color:named?'#1F6A62':'#6b6258'});ctx.restore();};

PROPS=[
  {k:'pile',x:330,type:'folder',n:[[-99,0],[T('byhand',.1),0],[T('byhand',.8),5]],s:.6,dy:10,label:'scan001.pdf …',t1:GO}];
MARKS=[{k:'q',x:1110,y:470,t0:T('silent',.5),t1:GO}];

ACTORS={
  karan:{x:[[0,160]],poses:[[T('byhand',.1),T('byhand',.8),'type'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('byhand',.5),T('silent',1),'tired'],[T('wf-run'),T('stats',1)+9,'happy']]},
  leo:{x:[[0,1060]],face:[[-99,-1]],vis:[[T('silent'),T('wf-ov',.4)],[T('L3'),T('stats',1)+9]],
    poses:[[T('N3_2',.4),T('N3_2',1),'cheer'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('silent',.3),T('silent',1)+.5,'puzzled'],[T('N3_2',.5),T('stats',1)+9,'happy']]}};

WF.build(T);
{const a=ACTORS.karan.x,x0=track(a,T('stats',.02));a.push([T('stats',.05),x0],[T('stats',.35),160]);}
CHAPS_B.push({t:T('stats'),ring:'result',chip:'Result',title:'the result',mood:'finale'});

STATS={t0:T('stats',.05),t1:T('stats',1)+.3,title:'every file',stats:[
  {v:'15 min',l:'between inbox checks',c:TEAL,size:44},{v:'5',l:'details logged per file',c:BLUE,size:44},{v:'1',l:'receipt per email',c:TEAL}]};

RECAP={opener:"Let's recap how it works.",points:[
  {c:BLUE,h:'Find new attachments',x:'Every 15 minutes, emails labelled To File, and only real attachments go on.'},
  {c:TEAL,h:'Name it with AI',x:'Gemini reads each file and gives it a short, descriptive name, keeping the extension.'},
  {c:TEAL,h:'File, log and confirm',x:'Saved to Drive, logged in Sheets, and one receipt to the sender.'},
  {c:RED,h:'If something breaks',x:'A failed Gemini or Drive step is retried up to 3 times, 15 minutes apart.'}],
  ending:'Label it once. It is named, filed and logged.'};
