/* Client Pipeline Emails — how it works, lane by lane. Cast: Dennice (the agency owner), Jeson (a client). */
FILM={type:'how-it-works',protag:'dennice',
  title:'Client Pipeline Emails',
  sub:'A hand-drawn explainer of the Client Pipeline Emails case study. Dennice plays the agency owner and Jeson plays a client.',
  aria:'Animated film: moving a client card on a pipeline board used to do nothing by itself. The Zapier build is shown lane by lane as on its process map: an Airtable stage change goes on only for a stage not yet handled, the stage is claimed so it runs once, and Paths sends the lead down its route. Ready to Start gets a Drive folder and a content task, No Response and Quoted get a follow-up and one nudge after two days, Approved and Paid and Closed get AI-written welcome and thank-you emails, and a failed step waits 15 minutes, tries once more, then sends an alert email.',
  cardTitle:'How every stage on the board sets off its own next step',
  intro:['Every client moves across a pipeline board, stage by stage.',
         'Folders, follow-ups and thank-yous depended on someone remembering.',
         'Move the card, and the next step happens on its own, once.']};

const WF=workflow({token:'card',maxX:1040,
  overview:'The whole build: five lanes, one Zap.',
  ovChapter:{ring:'the build',chip:'The build',title:'the whole build',mood:'setup'},
  running:'Every card that moves runs these lanes, once.',
  runChapter:{ring:'running',chip:'Running',title:'the whole line, running',mood:'finale'},
  lanes:[
    {name:'Catch the stage change',color:'yellow',chapter:'lane 1 · catch the change',intro:'Lane one: a card moves.',nodes:[
      {n:1,name:'New or Updated Record',icon:'db',say:'I move a card, and Airtable starts the Zap.',desc:'Airtable triggers the Zap when a lead’s stage changes.'},
      {n:2,name:'Stage Not Yet Handled?',icon:'filter',branch:'handled → stop',bc:AMBER,say:'Only the five stages with an automation, and only once.',
        desc:'Goes on only for the five stages with an automation, not already in Handled Stages.'},
      {name:'Set Greeting And Owner',icon:'code'},
      {n:3,name:'Claim The Stage',icon:'db',say:'The stage is claimed before anything is sent, so it never runs twice.',desc:'Adds the stage to Handled Stages before anything is sent.'},
      {n:4,name:'Split Into Paths By Stage',icon:'if',say:'Paths sends each lead down the route for its stage.',desc:'Paths sends the lead down the route for its stage.'},
      {n:5,name:'Email Missing → Log It',icon:'if',branch:'no email → logged, skipped',bc:AMBER,say:'No email address? It is logged and skipped, never guessed.',
        desc:'A lead with no email address is logged and skipped until someone fills it in.'}]},
    {name:'Ready to Start',color:'green',chapter:'lane 2 · ready to start',intro:'Lane two: Ready to Start.',nodes:[
      {n:6,name:'Create Client Drive Folder',icon:'drive',say:'A Google Drive folder is made for the client.',desc:'Creates a Google Drive folder for the client.'},
      {n:7,name:'Create Social Media Content Task',icon:'db',say:'A Social Media Content task is added in Airtable.',desc:'Adds a Social Media Content task in Airtable.'},
      {n:8,name:'Save Folder Link And Log',icon:'db',say:'The folder link is saved on the lead, and logged.',desc:'Saves the folder link on the lead and writes it to the Pipeline Log.'}]},
    {name:'No Response & Quoted follow-ups',color:'blue',chapter:'lane 3 · follow-ups',intro:'Lane three: quiet leads and open quotes.',nodes:[
      {n:9,name:'Send Follow-Up Email',icon:'mail',who:'jeson',say:'My quote sat open, and a follow-up arrived.',desc:'A follow-up email goes out from Gmail and is logged.'},
      {name:'Log Follow-Up',icon:'db'},
      {n:10,name:'Wait 2 Days',icon:'clock',say:'Then it waits two days.',desc:'Waits 2 days before checking again.'},
      {n:11,name:'Recheck Lead Stage',icon:'db',say:'It looks the lead up on the board again.',desc:'Looks the lead up again in Airtable.'},
      {n:12,name:'Still The Same Stage?',icon:'if',branch:'moved on → no nudge',bc:TEAL,say:'If the lead has moved on, no nudge is sent.',
        desc:'Only a lead still at the same stage gets a nudge.'},
      {n:13,name:'Send Nudge Email',icon:'mail',who:'jeson',say:'Still waiting, I got one nudge. Then no more.',desc:'A second nudge is sent and logged.'},
      {name:'Log Second Follow-Up',icon:'db'}]},
    {name:'Approved, Paid and Closed',color:'purple',chapter:'lane 4 · welcome, thank-you',intro:'Lane four: a welcome and a thank-you.',nodes:[
      {n:14,name:'AI Writes Welcome Email',icon:'robot',say:'AI writes the welcome: the kickoff call, the shared folder.',d:2.4,
        desc:'Covers the kickoff call and the shared project folder, in under 150 words.'},
      {n:15,name:'Send Welcome Email',icon:'mail',who:'jeson',say:'I approved, and a welcome came, signed by Dennice.',desc:'Sent from Gmail, signed by the lead’s owner.'},
      {n:16,name:'AI Writes Thank-You Email',icon:'robot',say:'Paid and closed? AI writes a thank-you that fits the work.',d:2.4,
        desc:'Suited to consulting, a build or support, in under 170 words.'},
      {n:17,name:'Send Thank-You Email',icon:'mail',who:'jeson',say:'A thank-you, and an ask for a referral or a short review.',desc:'Asks for a referral or a short review.'},
      {name:'Log Each Email',icon:'db'}]},
    {name:'If something breaks',color:'pink',chapter:'lane 5 · if it breaks',intro:'Lane five: when a step fails.',
      foot:'A failed step gets a second try, then an alert.',nodes:[
      {n:18,name:'Folder Or Email Step Fails',icon:'alert',say:'Each folder and email step has its own error handler.',desc:'Each folder and email step has its own error handler.'},
      {n:19,name:'Wait 15 Minutes',icon:'clock',say:'The folder, nudges, welcome and thank-you wait 15 minutes.',d:2.4,
        desc:'The folder, the nudges and the welcome and thank-you emails wait 15 minutes.'},
      {n:20,name:'Retry Once',icon:'loop',say:'Then they try once more.',desc:'Then the step is tried once more.'},
      {n:21,name:'Log It As Sent On Retry',icon:'db',say:'If it worked, the log says it went on the retry.',desc:'A send that worked on the second try is logged that way.'},
      {n:22,name:'Still Failing → Alert Email',icon:'mail',say:'Still failing? An alert email names the client and stage.',d:2.4,
        desc:'If the retry fails, or a first follow-up fails, an alert email names the client and stage.'}]}]});

const T=beats([
  {id:'hi',d:1.6,say:"I'm Dennice. I run a small agency: consulting, builds and support.",cam:[640,430,1.0]},
  {id:'board',d:2.0,say:'Every client sits on a board. Moving a card did nothing.',cam:[360,440,1.15]},
  {id:'cold',d:2.0,who:'jeson',say:'My quote went quiet, and nobody followed up.',cam:[820,440,1.15]},
  ...WF.beats,
  {id:'stats',d:3.0,say:'Every stage sets off its own next step.',cam:[640,330,1.0],side:true}]);

CHAPS_B=[{t:0,ring:'the problem',chip:'The problem',title:'next steps nobody took',mood:'problem'}];
const GO=T('wf-ov');

// Jeson's card on the board: the stage it sits at while each lane runs.
const STAGE=[[-99,''],[T('L1'),'Ready to Start'],[T('L2'),'Quoted'],[T('L3'),'Approved'],[T('N3_2'),'Paid and Closed'],[T('L4'),'']];
DRAW_HUD=t=>{if(t<T('L1')||t>=T('L4'))return;const a=ease(seg(t,T('L1'),T('L1')+.4))*(1-seg(t,T('L4')-.3,T('L4')));
  const v=stepVal(STAGE,t,'');if(!v)return;ctx.save();ctx.globalAlpha*=a;
  sk(rr(470,34,340,40,8),{seed:981,fill:'rgba(252,249,241,.95)',stroke:TEAL,lw:2.2});
  txt('card at: '+v,640,55,{size:16,font:MONO,weight:600,color:'#1F6A62'});ctx.restore();};

PROPS=[
  {k:'pile',x:330,type:'card',n:[[-99,0],[T('board',.1),0],[T('board',.8),5]],s:.6,dy:10,label:'pipeline board',t1:GO}];
MARKS=[{k:'zz',x:330,y:470,t0:T('board',.6),t1:GO},{k:'q',x:1110,y:470,t0:T('cold',.5),t1:GO}];

ACTORS={
  dennice:{x:[[0,160]],poses:[[T('board',.1),T('board',.8),'type'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('board',.5),T('cold',1),'tired'],[T('wf-run'),T('stats',1)+9,'happy']]},
  jeson:{x:[[0,1060]],face:[[-99,-1]],vis:[[T('cold'),T('wf-ov',.4)],[T('L2'),T('stats',1)+9]],
    poses:[[T('N3_3',.4),T('N3_3',1),'cheer'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('cold',.3),T('cold',1)+.5,'puzzled'],[T('N2_0',.5),T('stats',1)+9,'happy']]}};

WF.build(T);
{const a=ACTORS.dennice.x,x0=track(a,T('stats',.02));a.push([T('stats',.05),x0],[T('stats',.35),160]);}
CHAPS_B.push({t:T('stats'),ring:'result',chip:'Result',title:'the result',mood:'finale'});

STATS={t0:T('stats',.05),t1:T('stats',1)+.3,title:'every stage',stats:[
  {v:'5',l:'pipeline stages automated',c:BLUE,size:44},{v:'2 days',l:'wait before each nudge',c:AMBER,size:44},{v:'1',l:'run per stage, per lead',c:TEAL}]};

RECAP={opener:"Let's recap how it works.",points:[
  {c:BLUE,h:'Catch the stage change',x:'Only a stage not yet handled goes on, and it is claimed before anything is sent, so it runs once.'},
  {c:TEAL,h:'Folders and follow-ups',x:'Ready to Start gets a folder and a task. Quiet leads and open quotes get a follow-up, then one nudge after 2 days.'},
  {c:TEAL,h:'Welcome and thank-you',x:'AI writes them, Gmail sends them, and every email is written to the lead log.'},
  {c:RED,h:'If something breaks',x:'A failed step waits 15 minutes and tries once more, then an alert email.'}],
  ending:'Move the card. The follow-up takes care of itself.'};
