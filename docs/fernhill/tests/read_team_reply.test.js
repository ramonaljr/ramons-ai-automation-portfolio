// Unit tests for the "Read Team Reply" Code node: runs the node's own code
// against fixed Slack events and checks what it lets through.
const fs = require('fs');
const code = fs.readFileSync(process.argv[2], 'utf8');
const run = events => new Function('$input', code)({ all: () => events.map(e => ({ json: { event: e } })) });
const T = '1794560179.808739';
const msg = (text, extra = {}) => ({ type: 'message', text, user: 'U1', ts: '1794569999.000100', thread_ts: T, ...extra });
const cases = [
  ['U1 plain reply in thread is relayed',      [msg('On its way today')],                        r => r.length === 1 && !r[0].close && r[0].text === 'On its way today'],
  ['U2 bot post (the relay itself) ignored',   [msg('x', { bot_id: 'B0C1ZEF3LSX' })],            r => r.length === 0],
  ['U3 join / edit events ignored',            [msg('joined', { subtype: 'channel_join' }), msg('e', { subtype: 'message_changed' })], r => r.length === 0],
  ['U4 top-level channel message ignored',     [{ ...msg('hi'), thread_ts: undefined }],        r => r.length === 0],
  ['U5 thread parent itself ignored',          [{ ...msg('hi'), ts: T }],                        r => r.length === 0],
  ['U6 "close" alone closes, default text',    [msg('close')],                                   r => r[0]?.close && /marked this as resolved/.test(r[0].closing)],
  ['U7 "Close." closes',                       [msg('Close.')],                                  r => r[0]?.close === true],
  ['U8 "close: words" closes with words',      [msg('close: Sorted, thanks!')],                  r => r[0]?.close && r[0].closing === 'Sorted, thanks!'],
  ['U9 "closing in on it" is NOT a close',     [msg('Closing in on it, one sec')],               r => r[0] && !r[0].close],
  ['U10 "close to done" is NOT a close',       [msg('close to done')],                           r => r[0] && !r[0].close],
  ['U11 Slack link/email markup unwrapped',    [msg('Mail <mailto:a@b.co|a@b.co> or see <https://x.co/t|track> &amp; more')], r => r[0]?.text === 'Mail a@b.co or see https://x.co/t & more'],
  ['U13 app footer stripped, close still works', [msg('close *Sent using* Claude'), msg('On its way *Sent using* SomeApp')], r => r[0]?.close === true && r[1]?.text === 'On its way'],
  ['U12 empty text ignored',                   [msg('   ')],                                     r => r.length === 0],
];
let pass = 0;
for (const [name, ev, ok] of cases) {
  const out = run(ev).map(i => i.json);
  const good = ok(out); pass += good;
  console.log(`${good ? 'PASS' : 'FAIL'}  ${name}${good ? '' : '  -> ' + JSON.stringify(out)}`);
}
console.log(`\n${pass}/${cases.length} passed`);
