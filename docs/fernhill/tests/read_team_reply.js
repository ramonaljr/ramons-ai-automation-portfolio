// Slack sends every message in the channel. Keep only a person's reply inside a
// case thread; skip bot posts (including this workflow's own), edits and joins.
const out = [];
for (const item of $input.all()) {
  const e = item.json.event ?? item.json;
  if (e.type !== 'message' || e.subtype || e.bot_id) continue;
  if (!e.thread_ts || e.thread_ts === e.ts) continue;
  // Slack wraps links and emails as <url|label>; send the customer plain text.
  const text = String(e.text ?? '')
    .replace(/<mailto:[^|>]+\|([^>]+)>/g, '$1')
    .replace(/<(https?:[^|>]+)\|[^>]+>/g, '$1')
    .replace(/<(https?:[^>]+)>/g, '$1')
    // Apps that post for a person (e.g. an AI assistant) add a "*Sent using* <app>"
    // footer; it is not part of the message.
    .replace(/\s*\*Sent using\*\s+[^\n]*$/i, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .trim();
  if (!text) continue;
  // `close` ends the handover; `close: <words>` also sets the customer's closing message.
  // Only `close` on its own or `close:` counts, so a sentence that starts with "Close" is still sent.
  const m = text.match(/^close\.?$|^close\s*:\s*([\s\S]*)$/i);
  const closing = m && (m[1] ?? '').trim() ? m[1].trim()
    : 'Thanks for your patience. Our team has marked this as resolved. If you need anything else, just message us here.';
  out.push({ json: { ts: e.ts, threadTs: e.thread_ts, text, close: Boolean(m), closing, user: e.user } });
}
return out;