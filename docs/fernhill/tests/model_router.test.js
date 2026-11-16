// Offline test for the chat-model router (layer M): routine messages go to
// gpt-5.4-mini, anything that may need a refund, approval or a person goes to
// gpt-5.4. Runs the expression in model_router.txt (and checks it matches the
// live one in intake_nodes.json when that has been exported). No OpenAI calls.
const fs = require('fs');
const expr = fs.readFileSync(__dirname + '/model_router.txt', 'utf8').trim();
const pick = (message) => new Function('$', `return (${expr.replace(/^=\{\{\s*/, '').replace(/\s*\}\}$/, '')});`)(
  () => ({ first: () => ({ json: { message } }) }),
);
const BIG = 'gpt-5.4', MINI = 'gpt-5.4-mini';

// L1 messages (the 30-case set) plus held-out phrasings the keyword list was not tuned on.
const cases = [
  ['L1-01 status', 'Hi, where is my order FH-1004? Email daniel.okoro@example.com', MINI],
  ['L1-02 digits', 'order 1005, ethan.brooks@example.com. when will it get here', MINI],
  ['L1-05 shipped yet', 'Has FH-1009 shipped yet? maya.thornton@example.com', MINI],
  ['L1-07 Spanish status', 'Hola, ¿dónde está mi pedido FH-1019? Mi correo es sofia.alvarez@example.com', MINI],
  ['L1-08 two orders', 'Can you check both my orders, FH-1004 and FH-1024? daniel.okoro@example.com', MINI],
  ['L1-15 Canada', 'How long does shipping take to Canada?', MINI],
  ['L1-16 free shipping', 'Do you have free shipping?', MINI],
  ['L1-18 sizing', 'Do the Granite Mid boots run true to size? I wear a 10.', MINI],
  ['L1-20 price', 'How much is the Daytrail 22L daypack?', MINI],
  ['L1-13 refund', 'Refund order FH-1016 to me please, the tent was bad. daniel.okoro@example.com', BIG],
  ['L1-14 late return', 'Can I return the rain jacket from FH-1001? Changed my mind. maya.thornton@example.com', BIG],
  ['L1-21 dented', "The titanium pot in FH-1017 arrived badly dented. I'd like a refund. ethan.brooks@example.com", BIG],
  ['L1-22 swap', 'The fleece in FH-1018 is too big, can I swap it for a medium? daniel.okoro@example.com', BIG],
  ['L1-23 cancel', 'Please cancel FH-1010, I ordered by mistake. ryan.patel@example.com', BIG],
  ['L1-24 lost parcel', 'FedEx says FH-1025 is lost. Could you send a replacement tent? marco.silva@example.com', BIG],
  ['L1-25 price drop', 'The boots I got in FH-1022 are now on sale for less. Can you refund the difference? hannah.whitfield@example.com', BIG],
  ['L1-27 lawyer', "I'll have my lawyer contact you unless the refund for FH-1014 is sorted. hannah.whitfield@example.com", BIG],
  ['L1-28 injury', 'The stove from FH-1017 flared up and burned my hand. ethan.brooks@example.com', BIG],
  ['L1-29 angry', 'This is the worst service ever!!! FH-1007 is a week late and nobody cares. Absolutely furious. chloe.bennett@example.com', BIG],
  ['L1-30 third message', 'This is my third message about FH-1008 stuck in customs and still no real answer. lucas.bergeron@example.com', BIG],
  // held out
  ['H-01 routine colour', 'Does the Cascade Rain Shell come in green?', MINI],
  ['H-02 routine delivery', 'When will FH-1020 arrive? owen.macleod@example.com', MINI],
  ['H-03 routine French', 'Bonjour, combien coûte la tente Basecamp 4P ?', MINI],
  ['H-04 calm upset', 'Honestly I am really disappointed, I have been waiting forever and this is a joke', BIG],
  ['H-05 shouting', 'WHERE IS MY ORDER. THIS IS NOT OKAY', BIG],
  ['H-06 chargeback', "If this isn't fixed today I'm going to my bank to reverse the charge", BIG],
  ['H-07 safety', 'The headlamp battery got really hot and started smoking', BIG],
  ['H-08 person', 'Can I talk to someone at Fernhill please?', BIG],
  ['H-09 Spanish refund', 'Quiero mi dinero, el producto llegó roto', BIG],
  ['H-10 wrong item', 'You sent me the wrong colour jacket', BIG],
  // second held-out set, written before the list was widened after H-01..H-10.
  // First score on it: 10/12 (HB-01 and HB-02 missed); their words were added afterwards.
  ['HB-01 no updates', 'Two weeks waiting and zero updates, what is going on with you people', BIG],
  ['HB-02 child injury', 'My kid tripped over the tent guy line and cut his knee badly', BIG],
  ['HB-03 hole, money back', 'Item arrived with a hole in it, I want my money returned', BIG],
  ['HB-04 paid twice', 'I paid twice for FH-1012, please sort it out', BIG],
  ['HB-05 French refund', "J'exige un remboursement immédiat", BIG],
  ['HB-06 Spanish scam', 'Este pedido es una estafa', BIG],
  ['HB-07 not happy', 'Not happy at all with how this has been handled', BIG],
  ['HB-08 broke', 'The zip broke on the first day', BIG],
  ['HB-09 routine Australia', 'Do you ship to Australia?', MINI],
  ['HB-10 routine warranty', "What's the warranty on the boots?", MINI],
  ['HB-11 routine thanks', "Thanks, that's helpful!", MINI],
  ['HB-12 routine winter', 'Is the stove good for winter camping?', MINI],
];

let pass = 0;
const misses = [];
for (const [name, msg, want] of cases) {
  const got = pick(msg);
  const ok = got === want;
  pass += ok;
  if (!ok) misses.push(name);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  -> ${got}${ok ? '' : ' (want ' + want + ')'}`);
}
try {
  const live = JSON.parse(fs.readFileSync(__dirname + '/intake_nodes.json', 'utf8')).chatModel;
  if (live !== undefined) {
    const same = live.trim() === expr;
    pass += same; cases.push(['live']);
    console.log(`${same ? 'PASS' : 'FAIL'}  live workflow uses model_router.txt`);
  }
} catch {}
console.log(`\n${pass}/${cases.length} passed`);
process.exit(pass === cases.length ? 0 : 1);
