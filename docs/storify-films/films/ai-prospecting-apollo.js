/* AI Prospecting with Apollo — problem and fix, then the build lane by lane. Cast: Dennice (sales rep). */
FILM={type:'problem-fix',protag:'dennice',
  title:'AI Prospecting with Apollo',
  sub:'A hand-drawn explainer of the AI Prospecting with Apollo case study. Dennice plays the sales rep.',
  aria:'Animated film: prospecting by hand meant hours of searching, credits spent on poor fits and people contacted twice. The fix is shown lane by lane as on the process map: find and score with Apollo and fixed rules, research and queue with AI drafts grounded in the company website, and approved prospects into Pipedrive every 15 minutes, with nothing sent automatically.',
  cardTitle:'Prospecting by hand, and the one-form fix',
  intro:['Every first email meant searching, checking and writing by hand.',
         'Credits went on poor fits, and people were contacted twice.',
         'Every lane of the fix, from one form to an approved deal.']};

const WF=workflow({token:'card',maxX:1030,
  overview:'The fix: four lanes, fifteen steps.',
  ovChapter:{ring:'fix',chip:'The fix',title:'fix · the whole build',mood:'turn'},
  running:'One form in. Researched, scored prospects out.',
  runChapter:{ring:'running',chip:'Running',title:'confirmed · running',mood:'finale'},
  lanes:[
    {name:'Find & score',color:'yellow',chapter:'fix · find and score',intro:'Lane one: find people worth emailing.',nodes:[
      {n:1,name:'Prospecting Request Form',icon:'form',say:'I set job titles, places, company size, industry and offer.',desc:'The sales team sets job titles, locations, company size, industry and the offer.'},
      {name:'Clean Up Request',icon:'set'},
      {n:2,name:'Apollo – Search People',icon:'globe',say:'Apollo finds matching decision-makers. No credits used.',desc:'Finds matching decision-makers in Apollo. This search uses no credits.'},
      {n:3,name:'Load Known Prospects',icon:'sheet',branch:'already in sheet → skipped',say:'Anyone already in the sheet is skipped. Nobody twice.',
        desc:'Anyone already in the Google Sheet is skipped, so nobody is contacted twice.'},
      {n:4,name:'Shortlist New Prospects',icon:'code',say:'New people are ranked, owners and founders first.',desc:'Ranks new people by title, owners and founders first, and keeps the top few.'},
      {name:'Anything To Enrich?',icon:'if'},
      {n:5,name:'Apollo – Enrich Contacts',icon:'globe',say:'Only the top few are enriched. Never personal emails.',desc:'Adds work email, company size, industry and website. Never personal emails or phones.'},
      {n:6,name:'Flatten & Score Leads',icon:'code',say:'Fixed rules score each one out of 100. No AI.',desc:'Scores each prospect out of 100 by fixed rules, with the reasons listed. No AI.'}]},
    {name:'Research & queue',color:'blue',chapter:'fix · research, queue',intro:'Lane two: research, then a queue.',nodes:[
      {n:7,name:'Fetch Company Website',icon:'globe',say:"It reads the company's own website.",desc:'Reads the company’s own website. A site that is down never stops the run.'},
      {name:'Prepare Website Text',icon:'code'},
      {n:8,name:'AI Researches & Drafts Email',icon:'robot',say:'AI writes a summary and a first email, website facts only.',
        desc:'Writes a company summary and a short first email using only facts from the website.'},
      {n:9,name:'Set Final Status',icon:'code',branch:'under 60 → held back',bc:AMBER,say:'60+ with a verified email goes to review.',
        desc:'A score of 60+ with a verified email goes to review; the rest are held back.'},
      {n:10,name:'Save To Prospects Sheet',icon:'sheet',say:'Every prospect lands in the sheet, for us to approve.',desc:'Every prospect lands in the Google Sheet, where the team approves or rejects.'},
      {name:'Build Review Digest',icon:'code'},
      {n:11,name:'Slack – Review Digest',icon:'chat',say:'One Slack summary per run, not one per prospect.',desc:'One Slack summary per run, not one message per prospect.'}]},
    {name:'Approved → Pipedrive',color:'green',chapter:'confirmed · Pipedrive',intro:'Lane three: I approve. Then Pipedrive.',mood:'finale',nodes:[
      {n:12,name:'Every 15 Minutes',icon:'clock',say:'Every 15 minutes, it checks for prospects we approved.',desc:'Checks the sheet for prospects the team has approved.'},
      {name:'Find Approved Prospects',icon:'sheet'},{name:'Loop Over Prospects',icon:'loop'},
      {n:13,name:'Find or Create Org',title:'Find or Create in Pipedrive',icon:'deal',say:'Company and person are found first, created only if missing.',
        desc:'Looks up the company and person first and creates them only if missing.'},
      {name:'Find or Create Person',icon:'deal'},
      {n:14,name:'Create Deal',title:'Create Deal & Pin Note',icon:'deal',say:'A deal opens, with the score, research and email pinned.',desc:'Opens a deal with the score, research and suggested email pinned to it.'},
      {name:'Pin Research & Email',icon:'deal'},
      {n:15,name:'Mark As In CRM',icon:'sheet',say:"The row is marked, so it's never added twice.",desc:'Marks the row so it is never added twice. Nothing is emailed automatically.'}]},
    {name:'If something breaks',color:'pink',chapter:'if something breaks',d:2.6,intro:'If anything fails, Slack hears which step.',
      foot:'If anything fails, Slack hears which step failed, with a link to the run.',nodes:[
      {name:'When Workflow Fails',icon:'alert'},{name:'Build Error Summary',icon:'set'},{name:'Slack – Workflow Failed',icon:'chat'}]}]});

const T=beats([
  {id:'hi',d:1.4,say:"I'm Dennice. I find new people to sell to.",cam:[260,450,1.15]},
  {id:'search',d:2.2,say:'Finding decision-makers meant hours of searching by hand.',cam:[330,440,1.15]},
  {id:'credits',d:2.0,say:'Credits went on contacts who were a poor fit.',cam:[480,440,1.15]},
  {id:'twice',d:2.0,say:'And the same person was easy to email twice.',cam:[560,430,1.05]},
  {id:'generic',d:1.8,say:'A researched first email for everyone? Not realistic.',cam:[330,440,1.15]},
  {id:'cause',d:2.2,say:'Every step was by hand, and nothing checked the sheet first.',cam:[400,430,1.1]},
  ...WF.beats,
  {id:'stats',d:3.0,say:'Nothing is ever sent without a person.',cam:[640,330,1.0],side:true}]);

CHAPS_B=[{t:0,ring:'symptom',chip:'Symptom',title:'symptom · by hand',mood:'problem'},
  {t:T('cause'),ring:'cause',chip:'Cause',title:'cause · no checks',mood:'problem'}];

const GO=T('wf-ov');
PROPS=[
  {k:'clock',x:360,y:255,r:30,post:true,t0:T('search',.1),t1:GO,puff:true,val:t=>({f:seg(t,T('search',.1),T('generic',1)),c:AMBER,txt:'hours'})},
  {k:'pile',x:470,type:'card',n:[[-99,0],[T('search',.2),0],[T('search',.95),5]],s:.85,dy:16,t1:GO},
  {k:'pile',x:620,type:'coin',n:[[-99,6],[T('credits',.2),6],[T('credits',.9),2]],s:.8,dy:8,label:'Apollo credits',t1:GO},
  {k:'item',type:'card',x:800,y:520,s:.9,label:'same person',t0:T('twice',.05),t1:GO},
  {k:'pile',x:250,type:'q',n:[[-99,0],[T('generic',.1),0],[T('generic',.7),4]],s:.6,dy:12,label:'blank drafts',t1:GO},
  {k:'shelf',x:1110,w:130,h:120,label:'Pipedrive',cubbies:['deals'],fill:[[[-99,0],[T('N2_5',.6),.6]]],t0:T('L2')}];

FLIGHTS=[
  ...[0,1,2].map(i=>({type:'coin',from:[620,520-i*8],to:[470,500-i*10],t0:T('credits',.2+i*.22),t1:T('credits',.45+i*.22),s:.6,h:90,soft:true})),
  {type:'email',from:[190,480],to:[800,505],t0:T('twice',.15),t1:T('twice',.45),s:.6},
  {type:'email',from:[190,480],to:[790,495],t0:T('twice',.5),t1:T('twice',.8),s:.6}];
MARKS=[
  ...[0,1,2].map(i=>({k:'cross',x:500,y:470-i*16,t0:T('credits',.5+i*.18),t1:T('twice',.2),s:.6,quiet:i>0})),
  {k:'label',txt:'poor fit',color:RED,x:470,y:400,t0:T('credits',.7),t1:T('twice',.2),mono:true,quiet:true},
  {k:'flag',x:840,y:480,t0:T('twice',.82),t1:GO},
  {k:'label',txt:'contacted twice',color:RED,x:800,y:430,t0:T('twice',.85),t1:GO,mono:true,quiet:true},
  {k:'q',x:640,y:300,t0:T('cause',.5),t1:GO}];

ACTORS={
  dennice:{x:[[0,150]],
    poses:[[T('search',.1),T('search',.95),'type'],[T('generic',.1),T('generic',.6),'type'],[T('cause',.2),T('cause',1),'point'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('credits',.5),T('credits',1),'alert'],[T('twice',.8),T('twice',1),'alert'],[T('generic'),T('generic',1),'tired'],[T('cause'),T('cause',1),'puzzled'],
      [T('wf-run'),T('stats',1)+9,'happy']]}};

WF.build(T);
{const a=ACTORS.dennice.x,x0=track(a,T('stats',.02));a.push([T('stats',.05),x0],[T('stats',.35),150]);}
CHAPS_B.push({t:T('stats'),ring:'confirmed',chip:'Confirmed',title:'confirmed · reviewed',mood:'finale'});

STATS={t0:T('stats',.05),t1:T('stats',1)+.3,title:'the review queue',stats:[
  {v:'0',l:'emails sent without review',c:TEAL},{v:'60+',l:'score needed for review',c:BLUE},{v:'15 min',l:'approved to Pipedrive',c:TEAL}]};

RECAP={opener:"Let's recap what we learned.",points:[
  {c:RED,h:'The symptom',x:'Hours of searching by hand, credits spent on poor fits, and the same people contacted twice.'},
  {c:AMBER,h:'The cause',x:'Every step was manual, and nothing checked the prospects sheet before credits were spent.'},
  {c:TEAL,h:'The fix',x:'One form: Apollo search, known prospects skipped, scored by rules, AI research from the website only.'},
  {c:TEAL,h:'Confirmed',x:'A person approves every prospect, and approved ones reach Pipedrive every 15 minutes.'}],
  ending:'The machine does the digging, and a person still decides who hears from us.'};
