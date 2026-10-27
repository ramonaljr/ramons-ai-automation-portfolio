/* HR Evaluation & Job Posting Assistant — before and after, then the build lane by lane. Cast: Myk (hiring team), Samantha (an applicant), Carlos (the interviewer). */
FILM={type:'before-after',protag:'myk',
  title:'HR Evaluation Assistant',
  sub:'A hand-drawn explainer of the HR Evaluation and Job Posting Assistant case study. Myk plays the hiring team, Samantha an applicant and Carlos the interviewer.',
  aria:'Animated film: hiring ran on inboxes and spreadsheets, with CVs read by hand, slow replies, generic emails, scheduling back-and-forth and unprepared interviewers. The n8n build is shown lane by lane as on its process map: receive and filter applicants with an AI agent reading each CV against the real job posting, a questionnaire for potential hires, a personalised interview email, booking the interview, and screening questions for the interviewer.',
  cardTitle:'Hiring, before and after five AI steps',
  intro:['Every application means reading a CV against the job post.',
         'Strong applicants wait days, and interviewers walk in unprepared.',
         'Every lane, from application form to prepared interview.']};

const WF=workflow({token:'cv',maxX:960,
  overview:'The whole build: five lanes, fifteen steps.',
  ovChapter:{ring:'the build',chip:'The build',title:'after · the whole build',mood:'turn'},
  running:'Every applicant runs through these lanes.',
  runChapter:{ring:'running',chip:'Running',title:'after · running',mood:'finale'},
  lanes:[
    {name:'Receive and filter applicants',color:'yellow',chapter:'lane 1 · receive, filter',intro:'Lane one: receive and filter.',nodes:[
      {n:1,name:'On form submission',icon:'form',who:'samantha',say:'I filled in the form and uploaded my CV.',desc:'The applicant fills in the application form and uploads their CV.'},
      {n:2,name:'Upload CV to Google Drive',icon:'drive',say:'Every CV is filed in Google Drive, all in one place.',desc:'The CV is filed in a Google Drive folder, so every application is kept in one place.'},
      {name:'Edit Fields',icon:'set'},
      {n:3,name:'Airtable Job Applicants',icon:'db',say:'The answers are tidied, and an Airtable record made.',desc:'The answers are tidied and a new applicant record is created in Airtable.'},
      {name:'Download file',icon:'drive'},
      {n:4,name:'Extract from File',title:'Download & Extract from File',icon:'pdf',say:"The CV's text is pulled out of the PDF for the AI.",
        desc:'The CV is downloaded and its text pulled out of the PDF, ready for the AI to read.'},
      {n:5,name:'AI Agent',title:'AI Agent (Groq)',icon:'robot',say:'AI reads it against the real job posting.',desc:'Reads the CV against the matching job posting in Airtable and returns a clear verdict.'},
      {n:6,name:'If',title:'If: shortlist or decline',icon:'if',branch:'not a fit → declined',bc:AMBER,say:'Then it routes: potential hire, or not a fit.',
        desc:'Routes the applicant as a potential hire or as not a fit for this role.'},
      {n:7,name:'Potential Hire / Rejected',icon:'db',say:'Either way, the outcome is on file.',desc:'The outcome is written to the applicant record, so every decision is on file.'}]},
    {name:'Questionnaire for potential hires',color:'green',chapter:'lane 2 · questionnaire',intro:'Lane two: questions for this role.',nodes:[
      {n:8,name:'Generate Questionnaire',icon:'robot',say:'AI writes questions for this role, from the job details.',desc:'AI (OpenAI) writes questions for this role, using the job details in Airtable.'},
      {n:9,name:'Questionnaire',icon:'form',who:'samantha',say:'They appeared on the next page. I answered straight away.',
        desc:'Appears as the next page of the same form, so the applicant answers straight away.'},
      {n:10,name:'Save Questionnaire Answers',icon:'db',say:'The answers are saved to Samantha’s record.',desc:'The answers are saved to the applicant record in Airtable.'}]},
    {name:'Personalised interview email',color:'blue',chapter:'lane 3 · the invite',intro:'Lane three: a personal invite.',nodes:[
      {n:11,name:'Personalized Email',icon:'robot',say:'AI writes a personal invite from Samantha’s record and the job.',desc:'AI (Groq) writes a personal interview invite from the applicant record and job posting.'},
      {n:12,name:'Send a message',title:'Send a message (Gmail)',icon:'mail',say:'It goes out from Gmail. No templates, no copy and paste.',desc:'The invite goes out from Gmail. No templates, no copy and paste.'}]},
    {name:'Book the interview',color:'purple',chapter:'lane 4 · book it',intro:'Lane four: book the interview.',nodes:[
      {n:13,name:'Book Meeting',icon:'cal',say:'An AI step books the interview in Google Calendar.',desc:'An AI step creates the interview in Google Calendar.'},
      {n:14,name:'Update Interview Schedule',icon:'db',say:'The date and time go on Samantha’s record.',desc:'The interview date and time are recorded on the applicant record.'}]},
    {name:'Screening questions',color:'yellow',chapter:'lane 5 · screening Qs',intro:'Lane five: help for the interviewer.',nodes:[
      {n:15,name:'Screening Questions',icon:'robot',who:'carlos',say:'And I get questions prepared from Samantha’s CV and answers.',
        desc:'AI (OpenAI) prepares interview questions from the CV and answers, saved for the interviewer.'},
      {name:'Update record',icon:'db'}]}]});

const T=beats([
  {id:'hi',d:1.4,say:"I'm Myk. I help hire for every open role.",cam:[300,450,1.15]},
  {id:'cvs',d:2.0,say:'Every application meant reading a CV against the post.',cam:[300,440,1.15]},
  {id:'wait',d:1.6,say:'I applied days ago. Still no reply.',who:'samantha',cam:[960,440,1.1]},
  {id:'generic',d:1.8,say:'Shortlisted people got the same email, whatever the role.',cam:[640,420,1.0]},
  {id:'sched',d:2.0,say:'Booking one interview took several emails back and forth.',cam:[640,420,1.0]},
  {id:'unprep',d:1.6,say:'I walked in without questions for this applicant.',who:'carlos',cam:[900,440,1.1]},
  {id:'scattered',d:1.8,say:'CVs, answers and decisions lived in different places.',cam:[520,430,1.1]},
  {id:'turn',d:1.8,say:'So we built one workflow, with five AI steps.',cam:[400,440,1.1]},
  ...WF.beats,
  {id:'result',d:3.0,say:'Screened the moment they apply, every decision on record.',cam:[640,330,1.0],side:true},
  {id:'ready',d:1.6,say:'Now every interview starts prepared.',who:'carlos',cam:[700,380,1.0]}]);

CHAPS_B=[{t:0,ring:'before',chip:'Before',title:'before · the inbox',mood:'problem'},
  {t:T('turn'),ring:'turning point',chip:'Turning point',title:'turning point',mood:'turn'}];

const SAM=[1165,490],MYK=[190,480],GO=T('wf-ov');
PROPS=[
  {k:'pile',x:290,type:'cv',n:[[-99,0],[T('cvs',.1),0],[T('cvs',.8),6]],s:.7,dy:12,label:'CVs',t1:T('turn',.3),puff:true},
  {k:'item',type:'email',x:450,y:560,s:.9,label:'inbox',t0:T('scattered',.05),t1:T('turn',.3)},
  {k:'item',type:'folder',x:580,y:560,s:.9,label:'Drive',t0:T('scattered',.2),t1:T('turn',.3)},
  {k:'item',type:'doc',x:710,y:555,s:.9,label:'spreadsheet',t0:T('scattered',.35),t1:T('turn',.3)}];
FLIGHTS=[
  {type:'email',from:MYK,to:SAM,t0:T('generic',.2),t1:T('generic',.6),s:.6,label:'same email',keep:T('generic',1)},
  ...[0,1,2,3].map(i=>({type:'email',from:i%2?SAM:MYK,to:i%2?MYK:SAM,t0:T('sched',.1+i*.21),t1:T('sched',.28+i*.21),s:.5,h:100,soft:true}))];
MARKS=[
  {k:'q',x:450,y:500,t0:T('scattered',.4),t1:T('turn',.3),quiet:true},{k:'q',x:580,y:500,t0:T('scattered',.5),t1:T('turn',.3)},{k:'q',x:710,y:495,t0:T('scattered',.6),t1:T('turn',.3),quiet:true},
  {k:'label',txt:'days later…',color:AMBER,x:1100,y:330,t0:T('wait',.3),t1:T('generic',.3),mono:true}];

ACTORS={
  myk:{x:[[0,150]],
    poses:[[T('cvs',.1),T('cvs',.9),'mag'],[T('sched',.05),T('sched',.95),'type'],[T('result',.4),T('ready',1),'celebrate']],
    moods:[[T('cvs',.5),T('sched',1),'tired'],[T('scattered'),T('scattered',1),'puzzled'],[T('result'),T('ready',1)+9,'happy']]},
  samantha:{x:[[0,1185]],face:[[-99,-1]],
    poses:[[T('N0_0',.2),T('N0_0',.6),'throw'],[T('N2_1',.6),T('N2_1',1),'cheer']],
    moods:[[T('wait'),T('generic',1),'puzzled'],[T('sched'),T('sched',1),'tired'],[T('N1_1'),T('ready',1)+9,'happy']]},
  carlos:{x:[[0,1065]],face:[[-99,-1]],vis:[[T('unprep',-.3),T('ready',1)+9]],
    moods:[[T('unprep'),T('unprep',1),'puzzled'],[T('N4_0',.5),T('ready',1)+9,'happy']]}};

WF.build(T);
{const a=ACTORS.myk.x,x0=track(a,T('result',.02));a.push([T('result',.05),x0],[T('result',.35),150]);}
CHAPS_B.push({t:T('result'),ring:'result',chip:'Result',title:'the result',mood:'finale'});

STATS={t0:T('result',.05),t1:T('ready',.95),title:'every applicant',stats:[
  {v:'5',l:'hiring stages automated',c:TEAL},{v:'100%',l:'applicants screened and recorded',c:BLUE},{v:'0',l:'invites written by hand',c:TEAL}]};

RECAP={opener:"Let's recap what happened.",points:[
  {c:AMBER,h:'Before · inbox and spreadsheet',x:'CVs read by hand, slow replies, generic emails, scheduling back-and-forth, unprepared interviews.'},
  {c:TEAL,h:'Turning point · five AI steps',x:'One n8n workflow takes an applicant from the application form to a booked interview.'},
  {c:TEAL,h:'After · five lanes, fifteen steps',x:'Screened against the real job, recorded either way, asked role questions, invited, booked and prepared for.'}],
  ending:'Every applicant gets an answer fast, and every interviewer walks in ready.'};
