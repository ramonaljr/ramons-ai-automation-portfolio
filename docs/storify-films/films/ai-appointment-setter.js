/* AI Appointment Setter — before and after, then the build lane by lane. Cast: Dennice (front desk), Leo (a caller). */
FILM={type:'before-after',protag:'dennice',
  title:'AI Appointment Setter',
  sub:'A hand-drawn explainer of the AI Appointment Setter case study. Dennice plays the front desk and Leo plays a caller.',
  aria:'Animated film: calls after hours go unanswered and bookings are typed by hand, so the calendar and records drift apart. Then a VAPI voice agent answers every call and uses five n8n flows, shown lane by lane as on the process map: get slots, book slots, update slots, cancel slots and call results, keeping Google Calendar and Airtable in step, 24/7.',
  cardTitle:'The booking line, before and after an AI agent',
  intro:['Customers book, move and cancel appointments by phone.',
         'Calls after hours or at busy times go unanswered.',
         'Every lane of the build that now answers every call.']};

const WF=workflow({token:'dot',maxX:1100,
  overview:'The whole build: six lanes, fifteen steps.',
  ovChapter:{ring:'the build',chip:'The build',title:'after · the whole build',mood:'turn'},
  running:'Day or night, every call runs through these lanes.',
  runChapter:{ring:'running',chip:'Running',title:'after · always on',mood:'finale'},
  lanes:[
    {name:'On the call',color:'gray',chapter:'lane 1 · on the call',intro:'It starts on the call itself.',nodes:[
      {n:1,name:'VAPI voice agent',icon:'agent',say:'The voice agent answers, then picks the right tool.',
        desc:'Answers the call, works out what the caller wants and uses the right tool below.'}]},
    {name:'Get slots',color:'yellow',chapter:'lane 2 · get slots',intro:'Lane two: is that time free?',nodes:[
      {n:2,name:'GetSlots',icon:'hook',who:'leo',say:'Do you have a time free this week?',desc:'When a caller asks for a time, the agent asks n8n whether it is free.'},
      {n:3,name:'Check availability',icon:'cal',say:'It looks up that exact time in Google Calendar.',desc:'Looks up the requested time in Google Calendar.'},
      {n:4,name:'Check if available?',icon:'if',branch:'taken → open ranges',say:'Taken? It works out open time ranges to offer.',
        desc:'If free, it says so at once. If not, it works out open time ranges to offer instead.'},
      {name:'Get all events',icon:'cal'},{name:'Free time ranges',icon:'code'},{name:'Respond to Vapi',icon:'hook'}]},
    {name:'Book slots',color:'blue',chapter:'lane 3 · book slots',intro:'Lane three: booking it.',nodes:[
      {n:5,name:'BookSlots',icon:'hook',who:'leo',say:'Great. Book me in, please.',desc:'Receives the caller’s name, contact details and chosen time.'},
      {name:'Input arguments',icon:'code'},
      {n:6,name:'Details provided?',icon:'if',branch:'missing → ask again',say:'Something missing? A clear error, so the agent asks again.',
        desc:'If anything is missing, a clear error goes back so the agent asks again.'},
      {n:7,name:'Convert time to CST',icon:'code',say:'The time is converted to the business time zone.',
        desc:'Converts the time to the business time zone (America/Chicago) before booking.'},
      {n:8,name:'Create an event',icon:'cal',say:'Then the event is booked in Google Calendar.',desc:'Books the appointment in Google Calendar, with a friendly message if it fails.'},
      {name:'Success response',icon:'set'},{name:'Respond to Vapi',icon:'hook'},{name:'Booking confirmed?',icon:'filter'},
      {n:9,name:'Log book details',icon:'db',say:'Once it is confirmed, the booking is saved to Airtable.',desc:'Once the booking is confirmed, it is saved to Airtable.'}]},
    {name:'Update slots',color:'green',chapter:'lane 4 · update slots',intro:'Actually, can I move it?',who:'leo',nodes:[
      {name:'UpdateSlots',icon:'hook'},{name:'Input arguments',icon:'code'},{name:'Details provided?',icon:'if'},
      {n:10,name:'Find original appt.',title:'UpdateSlots: find appointment',icon:'db',say:'This lane finds the original booking in Airtable.',
        desc:'To reschedule, finds the caller’s original booking in Airtable.'},
      {n:11,name:'Update an event',icon:'cal',say:'It moves the event, and updates the record to match.',desc:'Moves the event in Google Calendar and updates the Airtable record to match.'},
      {name:'Update record',icon:'db'},{name:'Respond to VAPI',icon:'hook'}]},
    {name:'Cancel slots',color:'pink',chapter:'lane 5 · cancel slots',intro:'Lane five: cancelling.',nodes:[
      {name:'CancelSlots',icon:'hook'},{name:'Parse CancelSlot',icon:'code'},{name:'Details provided?',icon:'if'},
      {n:12,name:'Find appointment',title:'CancelSlots: find appointment',icon:'db',say:'It finds the booking the caller wants removed.',desc:'To cancel, finds the booking the caller wants to remove.'},
      {n:13,name:'Delete an event',icon:'cal',say:'Deletes the event, and marks the record cancelled.',desc:'Removes the event from the calendar and marks the record as cancelled.'},
      {name:'Update record to cancel',icon:'db'},
      {n:14,name:'Respond to VAPI',icon:'hook',say:'Every tool replies, so the agent confirms on the line.',desc:'Every tool replies to the agent, so it confirms the result while the caller is on the line.'}]},
    {name:'Call results',color:'yellow',chapter:'lane 6 · call results',intro:'Lane six: after every call.',nodes:[
      {n:15,name:'call_results',icon:'hook',say:'The call record is created or updated in Airtable.',desc:'At the end of each call, the call record is created or updated in Airtable.'},
      {name:'All input arguments',icon:'set'},{name:'Create or update record',icon:'db'}]}]});

const T=beats([
  {id:'hello',d:1.4,say:"Hi! I'm Dennice. I run the front desk.",cam:[300,450,1.15]},
  {id:'calls',d:2.0,say:'Every appointment comes in by phone.',cam:[640,400,1.0]},
  {id:'type',d:2.0,say:'I read out free times, then type the booking in.',cam:[420,380,1.15]},
  {id:'drift',d:1.8,say:"But the records don't always match the calendar.",cam:[780,330,1.15]},
  {id:'move',d:2.0,say:'Every reschedule means editing both. By hand. Again.',cam:[460,380,1.15]},
  {id:'night',d:1.8,say:'Hello? Is anyone there?',who:'leo',cam:[700,400,1.0]},
  {id:'hangup',d:1.6,say:"No answer. I won't leave a voicemail.",who:'leo',cam:[700,400,1.0]},
  {id:'agent',d:1.8,say:'So the phone line got a voice agent.',cam:[360,450,1.15]},
  ...WF.beats,
  {id:'result',d:3.2,say:'Open at any hour, and every change lands in both.',cam:[640,330,1.0],side:true},
  {id:'leo',d:1.6,say:'Booked and moved, without waiting for anyone.',who:'leo',cam:[640,360,1.0]}]);

CHAPS_B=[{t:0,ring:'before',chip:'Before',title:'before · the phone desk',mood:'problem'},
  {t:T('agent'),ring:'turning point',chip:'Turning point',title:'turning point · an agent',mood:'turn'}];

const GO=T('wf-ov'),CAL={x:640,y:285,w:230,h:160};
NIGHT=[[T('night'),T('agent',.15)]];
RINGS=[[T('calls',.05),T('calls',.45)],[T('night',.2),T('hangup',.3)]];

PROPS=[
  {k:'moon',x:1150,y:200,t0:T('night'),t1:T('agent',.1),quiet:true,nopop:true},
  {k:'calendar',...CAL,hang:true,title:'Google Calendar',t1:GO,cells:[
    {t:-99,i:0},{t:-99,i:4},{t:-99,i:9},{t:T('type',.6),i:6,t1:T('move',.35)},{t:T('drift',.1),i:2},{t:T('move',.45),i:8}]},
  {k:'panel',x:965,y:290,w:250,h:170,hang:true,title:'Airtable',icon:'db',t1:GO,rows:[
    {t:-99,txt:'booking',c:TEAL},{t:T('type',.85),txt:'booking (typed in)',c:TEAL},{t:T('move',.8),txt:'reschedule… later',c:AMBER}]},
  {k:'desk',x:150,w:180},
  {k:'phone',x:150,y:524,ring:RINGS},
  {k:'agent',x:440,label:'voice agent',t0:T('agent',.35),talk:[[GO,T('result')]]}];

LINKS=[
  {pts:[[1162,520],[700,420],[185,488]],t0:T('calls',.05),t1:T('type',.3),c:BLUE},
  {pts:[[1162,520],[700,420],[185,488]],t0:T('night',.15),t1:T('hangup',.6),c:BLUE},
  {pts:[[185,500],[300,470],[378,530]],t0:T('agent',.5)}];

MARKS=[
  {k:'flag',x:1065,y:235,t0:T('drift',.5),t1:T('move',.2)},
  {k:'label',txt:'missed call',color:RED,x:150,y:440,t0:T('hangup',.3),t1:T('agent',.2),mono:true}];

ACTORS={
  dennice:{x:[[0,290],[T('night',.05),290],[T('night',.6),-90],[T('agent',.05),-90],[T('agent',.5),290]],
    poses:[[T('calls',.5),T('type',.2),'phone'],[T('type',.2),T('type',.95),'type'],[T('move',.1),T('move',.9),'type'],[T('result',.6),T('result',1),'celebrate']],
    moods:[[T('drift',.3),T('drift',1),'puzzled'],[T('move'),T('move',1),'tired'],[T('result'),T('leo',1)+9,'happy']]},
  leo:{x:[[0,1190]],face:[[-99,-1]],
    vis:[[T('calls'),T('type',.4)],[T('night',.05),T('agent',.4)],[T('L1'),T('result',.3)],[T('leo'),T('leo',1)+9]],
    poses:[[T('calls'),T('type',.4),'phone'],[T('night'),T('hangup',.7),'phone'],[T('L1'),T('result'),'phone'],[T('leo',.3),T('leo',1)+9,'celebrate']],
    moods:[[T('hangup'),T('hangup',1),'puzzled'],[T('leo'),T('leo',1)+9,'happy']]}};

WF.build(T);
{const a=ACTORS.dennice.x,x0=track(a,T('result',.02));a.push([T('result',.05),x0],[T('result',.4),190]);}
CHAPS_B.push({t:T('result'),ring:'result',chip:'Result',title:'the result',mood:'finale'});

STATS={t0:T('result',.05),t1:T('leo',.95),title:'the result',stats:[
  {v:'24/7',l:'booking line open',c:TEAL},{v:'4',l:'caller requests handled',c:BLUE},{v:'2',l:'systems kept in step',c:TEAL}]};

RECAP={opener:"Let's recap what happened.",points:[
  {c:AMBER,h:'Before · the phone desk',x:'Missed calls after hours, bookings typed by hand, calendar and records out of step.'},
  {c:TEAL,h:'Turning point · a voice agent',x:'A VAPI voice agent answers and picks the right n8n flow while the caller is on the line.'},
  {c:TEAL,h:'After · six lanes, fifteen steps',x:'Get, book, update and cancel slots, then call results: Google Calendar and Airtable change together.'}],
  ending:'A phone line that never sleeps, and a calendar that never disagrees with the records.'};
