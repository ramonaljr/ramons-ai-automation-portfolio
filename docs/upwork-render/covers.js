// Builds 4:3 Upwork covers (1000x750 CSS px, saved at 2x) from one template,
// and reports whether the headline block runs into the stat block.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path')

const REPO = "/Users/ramonvallejerajr/Developer/Ramon's AI Automation Portfolio"
const OUT = path.resolve(__dirname, 'out')
const INK = '#1c222b'
const url = p => 'file://' + encodeURI(path.join(REPO, p))

// Single-colour logos: tool files are simple-icons paths; the rest mirror the map's badges.
const logo = slug => {
  const d = [...fs.readFileSync(path.join(REPO, 'public/images/tools', slug + '.svg'), 'utf8').matchAll(/<path[^>]*\sd="([^"]+)"/g)].map(m => m[1])
  return `<svg viewBox="0 0 24 24">${d.map(p => `<path fill="${INK}" d="${p}"/>`).join('')}</svg>`
}
const badge = letter =>
  `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="${INK}"/><text x="12" y="16.8" font-size="13.5" font-weight="700" text-anchor="middle" fill="#fff" font-family="Satoshi">${letter}</text></svg>`
const CALENDAR = `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="#fff" stroke="${INK}" stroke-width="2"/><rect x="3" y="3" width="18" height="5" rx="2" fill="${INK}"/><text x="12" y="18.4" font-size="9" font-weight="700" text-anchor="middle" fill="${INK}" font-family="Satoshi">31</text></svg>`
const TOOLS = {
  n8n: logo('n8n'), gmail: logo('gmail'), openai: logo('openai'), airtable: logo('airtable'),
  slack: logo('slack'), googledrive: logo('googledrive'), whatsapp: logo('whatsapp'), quickbooks: logo('quickbooks'), calendar: CALENDAR, vapi: badge('V'), groq: badge('g')
}

const COVERS = [
  {
    slug: 'ai-customer-support-agent', eyebrow: 'AI WhatsApp Customer Support Agent',
    h1: 'Customers answered <em>on WhatsApp,</em> from the store’s own records.',
    sub: 'An n8n agent on WhatsApp and OpenAI that answers at any hour from the store policies and Airtable, leaves every refund to a person, and hands upset customers to a live chat in Slack.',
    stat: '24/7', statLabel: 'Customers answered, nights and weekends included',
    tools: ['n8n', 'whatsapp', 'openai', 'airtable', 'slack', 'googledrive']
  },
  {
    slug: 'hotel-employee-onboarding', eyebrow: 'New Employee Onboarding',
    h1: 'A new hire set up from one form, <em>followed up for 30 days.</em>',
    sub: 'Folder, records, orientation and IT access set up at once, plus a policy-only HR assistant.',
    stat: '30', statLabel: 'Days of check-ins and reminders after the start date',
    tools: ['n8n', 'openai', 'airtable', 'googledrive', 'calendar', 'gmail']
  }
]

const page = c => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Satoshi;src:url("${url('src/assets/fonts/satoshi/satoshi-500.woff2')}") format("woff2");font-weight:500}
@font-face{font-family:Satoshi;src:url("${url('src/assets/fonts/satoshi/satoshi-700.woff2')}") format("woff2");font-weight:700}
@font-face{font-family:Satoshi;src:url("${url('src/assets/fonts/satoshi/satoshi-900.woff2')}") format("woff2");font-weight:900}
:root{--ground:oklch(0.225 0.018 255);--ink:oklch(0.97 0.006 255);--ink-2:oklch(0.8 0.012 255);--ink-3:oklch(0.66 0.014 255);--accent:oklch(0.66 0.15 38);--line:oklch(1 0 0 / 0.09)}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1000px;height:750px;overflow:hidden}
body{position:relative;font-family:Satoshi,sans-serif;color:var(--ink);background:var(--ground);
  background-image:radial-gradient(620px 420px at 8% 0%,color-mix(in oklab,var(--accent) 22%,transparent),transparent 70%),radial-gradient(700px 500px at 100% 100%,oklch(1 0 0 / 0.05),transparent 70%)}
.top{position:absolute;left:60px;top:58px;width:890px}
.eyebrow{display:flex;align-items:center;gap:12px;font-weight:700;font-size:15px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-2)}
.eyebrow i{width:9px;height:9px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 5px color-mix(in oklab,var(--accent) 22%,transparent)}
h1{margin:24px 0 0 -2px;font-weight:700;font-size:56px;line-height:1.06;letter-spacing:-.025em}
h1 em{font-style:normal;color:var(--accent);white-space:nowrap}
.sub{margin-top:18px;font-weight:500;font-size:21px;line-height:1.4;color:var(--ink-3)}
.stat{position:absolute;left:60px;top:372px}
.stat b{display:block;font-weight:900;font-size:76px;line-height:1;letter-spacing:-.03em;color:var(--accent);white-space:nowrap}
.stat span{display:block;margin-top:10px;width:250px;font-weight:500;font-size:19px;line-height:1.3;color:var(--ink-2)}
.tools{position:absolute;left:60px;top:560px;display:grid;grid-template-columns:repeat(${Math.min(c.tools.length === 4 ? 4 : 3, c.tools.length)},62px);gap:14px}
.tools div{width:62px;height:62px;border-radius:16px;background:oklch(0.99 0.002 255);display:grid;place-items:center;box-shadow:0 1px 0 oklch(1 0 0 / .5) inset,0 8px 20px oklch(0 0 0 / .25)}
.tools svg{width:34px;height:34px}
.shot{position:absolute;left:360px;top:368px;width:760px;border-radius:16px;overflow:hidden;border:1px solid var(--line);background:#1b1b1b;
  box-shadow:0 30px 70px oklch(0 0 0 / .5),0 0 0 6px oklch(1 0 0 / .03);transform:perspective(1400px) rotateY(-9deg) rotateX(4deg) rotateZ(-1.5deg);transform-origin:left center}
.shot .bar{height:30px;display:flex;align-items:center;gap:7px;padding-left:14px;background:#232323;border-bottom:1px solid oklch(1 0 0 / .06)}
.shot .bar i{width:10px;height:10px;border-radius:50%;background:oklch(1 0 0 / .16)}
.shot img{display:block;width:100%}
</style></head><body>
<div class="top"><div class="eyebrow"><i></i>${c.eyebrow}</div><h1>${c.h1}</h1><p class="sub">${c.sub}</p></div>
<div class="stat"><b>${c.stat}</b><span>${c.statLabel}</span></div>
<div class="tools">${c.tools.map(t => `<div>${TOOLS[t]}</div>`).join('')}</div>
<div class="shot"><div class="bar"><i></i><i></i><i></i></div><img src="${url(`public/images/workflows/${c.slug}-build.webp`)}"></div>
</body></html>`

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })
  const b = await chromium.launch({ channel: 'chrome' })
  const p = await b.newPage({ viewport: { width: 1000, height: 750 }, deviceScaleFactor: 2 })
  for (const c of COVERS.filter(c => !process.argv[2] || process.argv.slice(2).includes(c.slug))) {
    const file = path.join(OUT, c.slug + '.html')
    fs.writeFileSync(file, page(c))
    await p.goto('file://' + file); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(400)
    const m = await p.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect()
      return { topBottom: Math.round(r('.top').bottom), statTop: Math.round(r('.stat').top), statBottom: Math.round(r('.stat').bottom),
        toolsTop: Math.round(r('.tools').top), lines: Math.round(r('h1').height / 59.4), statWidth: Math.round(document.querySelector('.stat b').scrollWidth) }
    })
    const ok = m.topBottom < m.statTop - 24 && m.statBottom < m.toolsTop - 16 && m.statWidth < 300
    console.log(c.slug, JSON.stringify(m), ok ? 'OK' : 'OVERLAP')
    await p.screenshot({ path: path.join(OUT, c.slug + '-cover.png') })
  }
  await b.close()
})()
