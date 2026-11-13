/* AI WhatsApp Customer Support Agent — how it works, lane by lane. Cast: Dennice (the store owner), Leo (a customer). */
FILM={type:'how-it-works',protag:'dennice',
  title:'AI WhatsApp Customer Support Agent',
  sub:'A hand-drawn explainer of the AI WhatsApp Customer Support Agent case study. Dennice plays the store owner and Leo plays a customer.',
  aria:'Animated film: an online outdoor store answered every support message by hand, and nothing came back at night or at weekends. The n8n build is shown lane by lane as on its process map: a customer messages on WhatsApp, photos are saved to Google Drive, an OpenAI agent answers from the store policies document and the order and stock records in Airtable after the order number and email match, refunds start a team request that is checked and routed, upset customers are handed to the team, a person approves or rejects each refund in a Slack form and the customer is emailed the decision, a handover becomes a live chat from a Slack thread, and every conversation is logged with a daily summary at 5 PM.',
  cardTitle:'How every WhatsApp message is answered',
  intro:['A small outdoor store answers its customers’ questions.',
         'Every message was answered by hand, and nothing came back at night.',
         'The agent answers on WhatsApp from store data, and money goes to a person.']};

const WF=workflow({token:'msg',maxX:1000,
  overview:'The whole build: five lanes, one WhatsApp chat.',
  ovChapter:{ring:'the build',chip:'The build',title:'the whole build',mood:'setup'},
  running:'Every message runs these lanes, at any hour.',
  runChapter:{ring:'running',chip:'Running',title:'the whole line, running',mood:'finale'},
  lanes:[
    {name:'Customer messages on WhatsApp',color:'yellow',chapter:'lane 1 · on WhatsApp',intro:'Lane one: a customer messages on WhatsApp.',nodes:[
      {n:1,name:'WhatsApp Message In',icon:'chat',who:'leo',z:1.1,say:'I messaged the store on WhatsApp.',
        desc:'Each phone number gets its own conversation, so the bot remembers the last few messages.'},
      {name:'New Message?',icon:'if'},
      {name:'Merge Burst',icon:'set',say:'Several quick messages get one reply.',desc:'A message WhatsApp delivers twice is answered once, and several quick messages in a row get one reply.'},
      {name:'Save Photo To Drive',icon:'drive',say:'A photo of a damaged item is saved to Google Drive.',desc:'Photos are saved to Google Drive, and the link goes into the case.'},
      {name:'Prepare Message',icon:'set'}]},
    {name:'Agent answers from store data',color:'blue',chapter:'lane 2 · agent answers',intro:'Lane two: the agent answers.',nodes:[
      {n:2,name:'Support Agent (OpenAI)',icon:'robot',say:'An OpenAI agent reads the message and picks its tools.',
        desc:'An OpenAI model reads the store’s own data.'},
      {n:3,name:'Look Up Order',icon:'db',say:'It shares nothing about an order until the number and email match.',d:2.4,
        desc:'Order details are only shared when the order number and email match.'},
      {n:4,name:'Check Product Stock',icon:'db',say:'Stock is looked up in Airtable too.',desc:'Looks up orders and stock in Airtable.'},
      {n:5,name:'Search Store Policies',icon:'search',say:'Shipping, returns, products: only what the policies say.',d:2.4,
        desc:'Searches the store policies document for anything about shipping, returns or products.'},
      {name:'Check Reply',icon:'check'},
      {n:6,name:'Reply On WhatsApp',icon:'chat',who:'leo',z:1.1,say:'The answer came back on WhatsApp.',desc:'Replies are kept to a few sentences.'}]},
    {name:'Refunds and handovers',color:'purple',chapter:'lane 3 · refunds, handovers',intro:'Lane three: money and upset customers.',nodes:[
      {n:7,name:'Team Request In',icon:'hook',who:'leo',z:1.1,say:'My pot arrived dented. I asked for a refund.',
        desc:'The agent starts a team request instead of promising it.'},
      {n:8,name:'Verify Order',icon:'db',say:'The workflow checks the order is real.',desc:'The workflow checks the order is real.'},
      {name:'Apply Rules',icon:'rules'},
      {n:9,name:'Route The Request',icon:'if',branch:'upset → handover',bc:AMBER,say:'Money goes to Slack for approval. Upset customers go to the team.',d:2.6,
        desc:'Money requests go to Slack for approval, and upset customers or unusual questions go to the team as a handover.'},
      {n:10,name:'Post Handover To Slack',icon:'chat',say:'A handover is posted in Slack, with the customer’s WhatsApp name.',d:2.4,
        desc:'Upset customers, safety problems, legal threats and questions the policies do not cover go to the team, who take over the chat from a Slack thread while the bot stays quiet.'},
      {name:'Log Case',icon:'db'}]},
    {name:'A person decides or takes over',color:'green',chapter:'lane 4 · a person takes over',intro:'Lane four: a person decides, or takes over the chat.',nodes:[
      {n:11,name:'Ask Team To Approve',icon:'check',say:'I pick Approve or Reject in a Slack form, and can add a note.',d:2.6,
        desc:'The team picks Approve or Reject in a Slack form, and can add a note.'},
      {name:'Compose Customer Email',icon:'mail'},
      {name:'Record Decision',icon:'db'},
      {n:12,name:'Email Customer',icon:'mail',who:'leo',z:1.1,say:'The decision came by email.',desc:'The customer is emailed the decision.'},
      {n:13,name:'Team Reply In Thread',icon:'chat',say:'For a handover, I chat with the customer from the Slack thread.',d:2.6,
        desc:'The customer’s WhatsApp messages appear in the case’s Slack thread.'},
      {name:'Send Team Reply',icon:'chat',say:'Each reply goes back to WhatsApp, and gets a tick once delivered.',d:2.4,
        desc:'Each reply typed there goes back to WhatsApp and gets a ✅ once delivered.'},
      {name:'Close Case',icon:'db',say:'Typing close hands the customer back to the bot.',desc:'Typing close hands the customer back to the bot.'}]},
    {name:'Logs and daily summary',color:'pink',chapter:'lane 5 · logs, summary',intro:'Lane five: the record.',nodes:[
      {n:14,name:'Log Conversation',icon:'db',say:'Every conversation is saved in Airtable.',desc:'Every conversation is saved in Airtable.'},
      {n:15,name:'Alert Team: Agent Error',icon:'alert',say:'If something errors, the team hears in Slack.',desc:'Errors alert the team in Slack.'},
      {name:'Every Day At 17:00',icon:'clock'},
      {n:16,name:'Post Daily Summary',icon:'chat',say:'At 5 PM, the day’s cases are posted.',desc:'A summary of the day’s cases is posted at 5 PM.'},
      {name:'Reload Policy Doc',icon:'drive'}]}]});

const T=beats([
  {id:'hi',d:1.6,say:"I'm Dennice. I sell tents, packs, boots and camp gear online.",cam:[640,430,1.0]},
  {id:'inbox',d:2.0,say:'Support was one inbox, answered by hand.',cam:[360,440,1.15]},
  {id:'same',d:2.0,say:'The same few questions took most of the day.',cam:[420,440,1.15]},
  {id:'night',d:2.0,who:'leo',say:'I asked at the weekend, and nothing came back.',cam:[820,440,1.15]},
  ...WF.beats,
  {id:'stats',d:3.0,say:'Answers at any hour, and money stays with a person.',cam:[640,330,1.0],side:true}]);

CHAPS_B=[{t:0,ring:'the problem',chip:'The problem',title:'one inbox, by hand',mood:'problem'}];
const GO=T('wf-ov');

// Leo's case: what he is asking while each lane runs.
const CASE=[[-99,''],[T('L0'),'where is my order?'],[T('L2'),'refund: dented pot'],[T('L4'),'']];
DRAW_HUD=t=>{if(t<T('L0')||t>=T('L4'))return;const a=ease(seg(t,T('L0'),T('L0')+.4))*(1-seg(t,T('L4')-.3,T('L4')));
  const v=stepVal(CASE,t,'');if(!v)return;ctx.save();ctx.globalAlpha*=a;
  sk(rr(470,34,340,40,8),{seed:981,fill:'rgba(252,249,241,.95)',stroke:TEAL,lw:2.2});
  txt('Leo asks: '+v,640,55,{size:16,font:MONO,weight:600,color:'#1F6A62'});ctx.restore();};

PROPS=[
  {k:'pile',x:330,type:'msg',n:[[-99,0],[T('inbox',.1),0],[T('inbox',.8),5]],s:.6,dy:10,label:'one inbox',t1:GO}];
MARKS=[{k:'zz',x:330,y:470,t0:T('same',.6),t1:GO},{k:'q',x:1110,y:470,t0:T('night',.5),t1:GO}];

ACTORS={
  dennice:{x:[[0,160]],poses:[[T('inbox',.1),T('inbox',.8),'type'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('same',.4),T('night',1),'tired'],[T('wf-run'),T('stats',1)+9,'happy']]},
  leo:{x:[[0,1060]],face:[[-99,-1]],vis:[[T('night'),T('wf-ov',.4)],[T('L0'),T('stats',1)+9]],
    poses:[[T('N3_3',.4),T('N3_3',1),'cheer'],[T('stats',.4),T('stats',1),'celebrate']],
    moods:[[T('night',.3),T('night',1)+.5,'puzzled'],[T('N1_5',.5),T('N1_5',1)+.5,'happy'],
      [T('N2_0',.3),T('N2_0',1)+.5,'puzzled'],[T('N3_3',.3),T('stats',1)+9,'happy']]}};

WF.build(T);
{const a=ACTORS.dennice.x,x0=track(a,T('stats',.02));a.push([T('stats',.05),x0],[T('stats',.35),160]);}
CHAPS_B.push({t:T('stats'),ring:'result',chip:'Result',title:'the result',mood:'finale'});

STATS={t0:T('stats',.05),t1:T('stats',1)+.3,title:'every message',stats:[
  {v:'24/7',l:'customers answered',c:TEAL,size:44},{v:'30',l:'test questions',c:BLUE},{v:'0',l:'refunds promised by the bot',c:AMBER}]};

RECAP={opener:"Let's recap how it works.",points:[
  {c:BLUE,h:'Answers from store data',x:'Only the policies document and the Airtable records, and nothing about an order until the number and email match.'},
  {c:AMBER,h:'Money goes to a person',x:'Refunds start a team request: the order is checked, and the team approves or rejects in Slack.'},
  {c:TEAL,h:'The customer hears back',x:'The decision is emailed, and an upset customer is handed to a person, who chats with them from a Slack thread.'},
  {c:BLUE,h:'A record of every case',x:'Every conversation saved in Airtable, errors alerted in Slack, and a summary at 5 PM.'}],
  ending:'The bot answers what it can check, and leaves every promise about money to a person.'};
