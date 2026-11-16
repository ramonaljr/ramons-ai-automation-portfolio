// Offline tests for the new-chat intake (layer I). Runs the live workflow's own
// expressions (exported by export_intake.py) against fake Support Cases rows,
// so no OpenAI credits are used. Needs luxon: NODE_PATH=<dir with luxon> node intake.test.js
const fs = require('fs');
const { DateTime } = require('luxon');
const X = JSON.parse(fs.readFileSync(process.argv[2] || 'intake_nodes.json', 'utf8'));
const NOW = DateTime.fromISO('2026-11-15T16:00:00Z');
const ago = (h) => NOW.minus({ hours: h }).toISO();

// n8n's $('Node') helper over a map of node outputs; a missing node "did not run".
const shim = (data) => (name) => ({
  first: () => ({ json: data[name] ?? {} }),
  all: () => [{ json: data[name] ?? {} }],
  isExecuted: name in data,
});
const evalExpr = (expr, data) =>
  new Function('$', '$now', 'DateTime', `return (${expr});`)(shim(data), NOW, DateTime);
const body = (e) => e.replace(/^=\{\{\s*/, '').replace(/\s*\}\}$/, '');

// The CUSTOMER DETAILS block is the {{ }} expression that opens with the channel check.
const sm = X.systemMessage;
const start = sm.indexOf("{{ $('Prepare Message').first().json.channel !== 'whatsapp'");
const end = sm.lastIndexOf(' }}', sm.indexOf('STYLE\n'));
const promptExpr = sm.slice(start + 3, end);
const prompt = (channel, row, test = false) => evalExpr(promptExpr, {
  'Prepare Message': { channel, test },
  'Find Open Handover': row ? { fields: row } : {},
});

const save = (req, verified) => {
  const data = { 'Team Request In': req, 'Verify Order': verified ? { id: 'recORDER' } : {} };
  const cols = {};
  for (const k of ['Customer Name', 'Order Number', 'Customer Email']) cols[k] = evalExpr(body(X.saveColumns[k]), data);
  data['Save Details On Case'] = { fields: { 'Customer Email': cols['Customer Email'] } };
  return { cols, said: evalExpr(body(X.detailsSaved), data) };
};
const WA = 'WhatsApp';

const applyRules = (req, order) => new Function('$', '$input', X.applyRules)(
  shim({ 'Team Request In': req }),
  { all: () => [{ json: order ? { id: 'recO', fields: order } : {} }] },
)[0].json;

const cases = [
  // --- when is it a new chat, and what does the bot ask for
  ['I1 first message ever: new chat, asks for all three', () => prompt('whatsapp', null),
    (p) => p.includes('THIS MESSAGE STARTS A NEW CHAT') && p.includes('your name, your email address and your order number (if you have one)')],
  ['I2 last message 2 hours ago: same chat, no question', () => prompt('whatsapp', { 'Last Activity': ago(2) }),
    (p) => p.includes('already under way') && !p.includes('NEW CHAT')],
  ['I3 last message 13 hours ago: new chat', () => prompt('whatsapp', { 'Last Activity': ago(13) }),
    (p) => p.includes('THIS MESSAGE STARTS A NEW CHAT')],
  ['I4 first message after a close: new chat, asks only for what is missing', () => prompt('whatsapp', {
      Status: 'Closed', Resolved: ago(1), 'Last Activity': ago(1), 'Customer Email': 'maya.thornton@example.com', 'Order Number': 'FH-1001' }),
    (p) => p.includes('NEW CHAT') && p.includes('"Could you share your name?"')],
  ['I5 second message after a close: same chat', () => prompt('whatsapp', {
      Status: 'Closed', Resolved: ago(1), 'Last Activity': ago(0.9) }),
    (p) => p.includes('already under way')],
  ['I6 new chat with all three on file: greet by name, ask nothing', () => prompt('whatsapp', {
      'Last Activity': ago(30), 'Customer Name': 'Maya', 'Customer Email': 'maya.thornton@example.com', 'Order Number': 'FH-1001' }),
    (p) => p.includes('using their name') && p.includes('Do not ask for any details') && !p.includes('Could you share')],
  ['I7 two missing: "x and y" wording', () => prompt('whatsapp', { 'Last Activity': ago(20), 'Customer Name': 'Maya' }),
    (p) => p.includes('"Could you share your email address and your order number (if you have one)?"')],
  ['I8 website chat: no intake section at all', () => prompt('web', null),
    (p) => p === ''],
  ['I9 handover still wins over the question', () => prompt('whatsapp', null),
    (p) => p.includes('if you call "Request Team Action" in this turn, reply only as its result says')],
  // --- what Save Customer Details writes on the case
  ['S1 matching order: name, order and email saved', () => save({ channel: WA, customer_name: '  Maya Thornton ', customer_email: 'Maya.Thornton@Example.com', order_number: 'fh-1001' }, true),
    (r) => r.cols['Customer Name'] === 'Maya Thornton' && r.cols['Order Number'] === 'FH-1001' && r.cols['Customer Email'] === 'maya.thornton@example.com' && !/not saved/.test(r.said)],
  ['S2 email does not match the order: email not saved, agent told', () => save({ channel: WA, customer_email: 'sam@example.com', order_number: 'FH-1001' }, false),
    (r) => r.cols['Customer Email'] === undefined && r.cols['Order Number'] === 'FH-1001' && /not saved/.test(r.said)],
  ['S3 pre-sale (no order): email saved as given', () => save({ channel: WA, customer_email: 'alex@example.com' }, false),
    (r) => r.cols['Customer Email'] === 'alex@example.com' && r.cols['Order Number'] === undefined],
  ['S4 digits only: saved as FH-1001', () => save({ channel: WA, order_number: '1001' }, false),
    (r) => r.cols['Order Number'] === 'FH-1001'],
  ['S5 name only: email and order left as they are', () => save({ channel: WA, customer_name: 'Samuel' }, false),
    (r) => r.cols['Customer Name'] === 'Samuel' && r.cols['Order Number'] === undefined && r.cols['Customer Email'] === undefined],
  ['S6 not an email: not saved', () => save({ channel: WA, customer_email: 'maya@' }, false),
    (r) => r.cols['Customer Email'] === undefined],
  ['S7 website chat: nothing saved', () => save({ channel: 'Web Chat', customer_name: 'Web Visitor', customer_email: 'v@example.com', order_number: 'FH-1001' }, true),
    (r) => Object.values(r.cols).every((v) => v === undefined)],
  // --- who gets the live chat, and the handover email question
  ['R1 open handover: message goes to the team', () => evalExpr(body(X.personHasCase), { 'Prepare Message': { test: false } , $json: 0 }),
    null],
  ['A1 handover with an email on file: no email question, email kept', () => applyRules({ request_type: 'handover', channel: WA, session_id: 'whatsapp:1', saved_email: 'Alex@Example.com' }, null),
    (j) => !/what is the email address/.test(j.toAgent) && j.customerEmail === 'alex@example.com'],
  ['A2 handover, no email anywhere: asks once for the order email', () => applyRules({ request_type: 'handover', channel: WA, session_id: 'whatsapp:1' }, null),
    (j) => /what is the email address on their order/.test(j.toAgent) && j.customerEmail === ''],
  ['A3 Log Case never blanks a saved email', () => evalExpr(body(X.logCaseEmail), { 'Apply Rules': { customerEmail: '' } }),
    (v) => v === undefined],
];

// Person Has This Case? reads $json (the case row) directly, so run it per row.
const hasCase = (row, test = false) => new Function('$', '$json', `return (${body(X.personHasCase)});`)(shim({ 'Prepare Message': { test } }), row);
cases.splice(cases.findIndex((c) => c[0].startsWith('R1')), 1,
  ['R1 open handover: message goes to the team', () => hasCase({ fields: { Decision: 'Handed Over', Status: 'Open' } }), (v) => v === true],
  ['R2 closed handover: the bot answers', () => hasCase({ fields: { Decision: 'Handed Over', Status: 'Closed' } }), (v) => v === false],
  ['R3 test mode (site demo): never to the team', () => hasCase({ fields: { Decision: 'Handed Over', Status: 'Open' } }, true), (v) => v === false],
  ['R4 no case row yet: the bot answers', () => hasCase({}), (v) => v === false],
);

let pass = 0;
for (const [name, run, ok] of cases) {
  let out, good;
  try { out = run(); good = ok(out); } catch (e) { out = 'ERROR ' + e.message; good = false; }
  pass += good;
  console.log(`${good ? 'PASS' : 'FAIL'}  ${name}${good ? '' : '  -> ' + JSON.stringify(out).slice(0, 400)}`);
}
console.log(`\n${pass}/${cases.length} passed`);
process.exit(pass === cases.length ? 0 : 1);
