// Builds each project's process diagram from diagrams.json:
//   public/images/workflows/<slug>-card.svg  compact, on the Selected Work card
//   public/images/workflows/<slug>-map.svg   full, in the case-study dialog
//
// Usage, from the repo root:  node docs/process-diagrams/build.cjs [slug...]
//
// The drawings keep the grammar work-canvas.tsx animates: each box and chip is
// a group holding a `<g filter>` tile (pinned in as a step), each arrow is a
// path stroked #6366f1 (drawn on as an edge), each bullet is its own group, and
// every top-level element carries a `data-t` that sets its place in the run.
// Header text above y=110 stays still.

const fs = require('fs')
const path = require('path')

const ROOT = path.resolve(__dirname, '../..')
const OUT = path.join(ROOT, 'public/images/workflows')
const EDGE = '#6366f1'
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif"
const MONO = "'DejaVu Sans Mono', ui-monospace, monospace"

// One colour family per box, in order. Red is kept for "If something breaks",
// so no ordinary stage can be mistaken for it.
const PALETTE = [
  { bg: '#EBF2FD', border: '#AFCBF2', accent: '#2F6FD6' },
  { bg: '#E8F7F3', border: '#A4DACD', accent: '#13917C' },
  { bg: '#F2EDFB', border: '#C8B6EE', accent: '#7650D6' },
  { bg: '#FFF4E2', border: '#F3CD8E', accent: '#D9820F' },
  { bg: '#EAF6EC', border: '#AAD8B3', accent: '#2E9447' },
  { bg: '#FDEEF6', border: '#F0B8D6', accent: '#C2408A' }
]
const BREAKS = { bg: '#FDECEA', border: '#F1B5AF', accent: '#D6453A' }

// What each stage is about, drawn in the box's own colour. Each stage names
// its concept in diagrams.json.
const CONCEPTS = {
  alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  calendarPlus: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M12 13v6M9 16h6"/>',
  calendarRefresh: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M15.5 15.5a3.5 3.5 0 1 1-1-2.5M15.5 12.5v2.5H13"/>',
  calendarX: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M10 14l4 4M14 14l-4 4"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8M8 13h5"/>',
  checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 12h6M9 16h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  filter: '<path d="M22 3H2l8 9.5V19l4 2v-8.5z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.8 4H7.2a2 2 0 0 0-1.7 1.1z"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
  pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  send: '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  shuffle: '<path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  userPlus: '<circle cx="9" cy="8" r="4"/><path d="M2 21v-1a6 6 0 0 1 12 0v1M19 8v6M16 11h6"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>'
}

const conceptIcon = (stage, colour) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="${colour}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${CONCEPTS[stage.concept] || CONCEPTS.checkCircle}</svg>`

// Tools without a logo file get a letter badge in their own colour.
const BADGES = {
  VAPI: { letter: 'V', color: '#0A6F63' },
  Apollo: { letter: 'A', color: '#1F2A44' },
  Pipedrive: { letter: 'p', color: '#1A1A1A' },
  Groq: { letter: 'g', color: '#F55036' }
}
const CALENDAR =
  '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="3" fill="#fff" stroke="#4285F4" stroke-width="2"/><rect x="3" y="3" width="18" height="5" rx="2" fill="#4285F4"/><text x="12" y="18.2" font-size="9" font-weight="700" text-anchor="middle" fill="#4285F4" font-family="Inter">31</text></svg>'

const esc = s => String(s).replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const plain = s => String(s).replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')

/** Rough Inter advance widths, enough to wrap and fit labels. */
function textWidth(text, size, weight = 400) {
  let units = 0
  for (const ch of plain(text)) {
    if ('iljI.,:;|!\'’ '.includes(ch)) units += 0.28
    else if ('mwMW'.includes(ch)) units += 0.86
    else if (ch === ch.toUpperCase() && /[A-Z]/.test(ch)) units += 0.66
    else units += 0.54
  }
  return units * size * (weight >= 600 ? 1.06 : 1)
}

function wrap(text, maxWidth, size, weight) {
  const lines = []
  let line = ''
  for (const word of text.split(' ')) {
    const next = line ? line + ' ' + word : word
    if (line && textWidth(next, size, weight) > maxWidth) {
      lines.push(line)
      line = word
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}

/** Places a 24-unit icon at (x, y), size s. */
const place = (icon, x, y, s) => icon.replace('<svg ', `<svg x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${s}" height="${s}" `)

const toolColours = Object.fromEntries(
  [...fs.readFileSync(path.join(ROOT, 'src/lib/portfolio.ts'), 'utf8').matchAll(/name: '([^']+)', slug: '([^']+)', color: '(#[0-9A-Fa-f]{6})'/g)].map(
    m => [m[1], { slug: m[2], color: m[3] }]
  )
)

function toolIcon(name) {
  if (name === 'Google Calendar') return CALENDAR
  const known = toolColours[name]
  const file = known && path.join(ROOT, 'public/images/tools', `${known.slug}.svg`)
  if (file && fs.existsSync(file)) {
    const d = [...fs.readFileSync(file, 'utf8').matchAll(/<path[^>]*\sd="([^"]+)"/g)].map(m => m[1])
    return `<svg viewBox="0 0 24 24">${d.map(p => `<path fill="${known.color}" d="${p}"/>`).join('')}</svg>`
  }
  const badge = BADGES[name] || { letter: name[0], color: '#55556a' }
  return `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="${badge.color}"/><text x="12" y="16.6" font-size="13" font-weight="700" text-anchor="middle" fill="#fff" font-family="Inter">${badge.letter}</text></svg>`
}

const paletteOf = (stage, i) => (/something breaks/i.test(plain(stage.title)) ? BREAKS : PALETTE[i % PALETTE.length])

/**
 * Cells on a three-column, two-row grid. Boxes fill row one left to right,
 * then row two; the tools panel takes whatever is left of row two.
 */
function layout(n, W, top, bottom, mx, gx, gy) {
  const w = (W - mx * 2 - gx * 2) / 3
  const h = (bottom - top - gy) / 2
  const cell = (col, row, span = 1) => ({ x: mx + col * (w + gx), y: top + row * (h + gy), w: w * span + gx * (span - 1), h })
  const boxes = Array.from({ length: n }, (_, i) => cell(i % 3, Math.floor(i / 3)))
  const used = n - 3
  return { boxes, tools: cell(used, 1, 3 - used) }
}

/** Arrows from each box to the next, snaking from row one down to row two. */
function arrows(cells, t, r) {
  const out = []
  for (let i = 0; i < cells.length - 1; i++) {
    const a = cells[i]
    const b = cells[i + 1]
    let d
    let head
    if (Math.abs(a.y - b.y) < 1) {
      const y = a.y + a.h / 2
      const x1 = a.x + a.w + 5
      const x2 = b.x - 5
      d = `M${x1},${y} L${x2},${y}`
      head = `M${x2 - 7},${y - 5} L${x2},${y} L${x2 - 7},${y + 5}`
    } else {
      const x1 = a.x + a.w / 2
      const y1 = a.y + a.h + 5
      const x2 = b.x + b.w / 2
      const y2 = b.y - 5
      const ym = (y1 + y2) / 2
      d = `M${x1},${y1} L${x1},${ym - r} Q${x1},${ym} ${x1 - r},${ym} L${x2 + r},${ym} Q${x2},${ym} ${x2},${ym + r} L${x2},${y2}`
      head = `M${x2 - 5},${y2 - 7} L${x2},${y2} L${x2 + 5},${y2 - 7}`
    }
    const at = t(i + 1) - 0.02
    out.push(`<path data-t="${at.toFixed(3)}" d="${d}" fill="none" stroke="${EDGE}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`)
    out.push(`<path data-t="${at.toFixed(3)}" d="${head}" fill="none" stroke="${EDGE}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`)
  }
  return out
}

function svgOpen(W, H, label, span, nodes) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${esc(label)}" data-light="" data-span="${span}" data-nodes="${nodes}">`,
    '<defs><pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#FCFCFD"/><circle cx="1" cy="1" r="1" fill="#d9d9e2"/></pattern><filter id="sh" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity=".08"/></filter></defs>',
    `<rect width="${W}" height="${H}" fill="#F5F5F8"/>`,
    `<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="14" fill="url(#dots)" stroke="#e4e4ea"/>`
  ]
}

const tile = (x, y, s, rx) =>
  `<g filter="url(#sh)"><rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${s}" height="${s}" rx="${rx}" fill="#fff" stroke="#cfcfd8" stroke-width="1.4"/></g>`

const badge = (cx, cy, r, n, colour, size) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colour}"/><text x="${cx}" y="${cy + size * 0.36}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="700" fill="#fff">${n}</text>`

function toolsPanel(cell, tools, t0, t1, o) {
  const out = []
  out.push(
    `<g data-t="${t0.toFixed(3)}"><g filter="url(#sh)"><rect x="${cell.x}" y="${cell.y}" width="${cell.w}" height="${cell.h}" rx="${o.rx}" fill="#fff" stroke="#d9dbe8" stroke-width="1.6"/></g><text x="${cell.x + o.pad}" y="${cell.y + o.pad + o.label * 0.8}" font-family="${MONO}" font-size="${o.label}" letter-spacing="1.6" fill="#55556a">TOOLS USED</text></g>`
  )
  const cols = Math.max(1, Math.min(tools.length, Math.floor((cell.w - o.pad * 2 + o.gap) / (o.size + o.gap))))
  const rows = Math.ceil(tools.length / cols)
  // Names wrap onto a second line rather than run into the next one.
  const nameLines = name => wrap(name, o.size + o.gap - 6, o.name, 500).slice(0, 2)
  const twoLines = o.names && tools.some(name => nameLines(name).length > 1)
  const rowH = o.size + (o.names ? o.name * (twoLines ? 3.1 : 1.9) : 0) + o.rowGap
  const top = cell.y + o.pad + o.label + (cell.h - o.pad * 2 - o.label - rows * rowH + o.rowGap) / 2
  tools.forEach((name, i) => {
    const row = Math.floor(i / cols)
    const inRow = Math.min(cols, tools.length - row * cols)
    const width = inRow * o.size + (inRow - 1) * o.gap
    const x = cell.x + (cell.w - width) / 2 + (i % cols) * (o.size + o.gap)
    const y = top + row * rowH
    const at = t0 + ((t1 - t0) * (i + 1)) / (tools.length + 1)
    const icon = place(toolIcon(name), x + o.size * 0.18, y + o.size * 0.18, Math.round(o.size * 0.64))
    const caption = o.names
      ? nameLines(name)
          .map(
            (line, k) =>
              `<text x="${(x + o.size / 2).toFixed(1)}" y="${(y + o.size + o.name * (1.35 + k * 1.2)).toFixed(1)}" text-anchor="middle" font-family="${FONT}" font-size="${o.name}" font-weight="500" fill="#2a2a33">${esc(line)}</text>`
          )
          .join('')
      : ''
    out.push(`<g data-t="${at.toFixed(3)}">${tile(x, y, o.size, o.size * 0.26)}${icon}${caption}</g>`)
  })
  return out
}

/** Even spacing in the run: box i at t(i), its chips or bullets just after. */
const timing = n => i => (i / (n + 1)) * 0.96

function card(p) {
  const W = 800
  const H = 500
  const n = p.stages.length
  const { boxes, tools } = layout(n, W, 26, H - 26, 26, 44, 44)
  const t = timing(n)
  const out = svgOpen(W, H, `${plain(p.title)}: process diagram`, 3.8, p.nodes)

  p.stages.forEach((stage, i) => {
    const c = boxes[i]
    const pal = paletteOf(stage, i)
    const title = wrap(plain(stage.title), c.w - 66, 16, 700).slice(0, 2)
    const titleSvg = title
      .map((line, k) => `<text x="${c.x + 50}" y="${c.y + 33 + k * 19}" font-family="${FONT}" font-size="16" font-weight="700" fill="#1d1d27">${esc(line)}</text>`)
      .join('')
    const cy = c.y + 104
    const big = place(conceptIcon(stage, pal.accent), c.x + c.w / 2 - 17, cy - 17, 34)
    out.push(
      `<g data-t="${t(i).toFixed(3)}"><g filter="url(#sh)"><rect x="${c.x}" y="${c.y}" width="${c.w.toFixed(1)}" height="${c.h}" rx="16" fill="${pal.bg}" stroke="${pal.border}" stroke-width="1.6"/></g>${badge(c.x + 26, c.y + 28, 15, i + 1, pal.accent, 15)}${titleSvg}<circle cx="${c.x + c.w / 2}" cy="${cy}" r="29" fill="#fff" stroke="${pal.border}" stroke-width="1.6"/>${big}</g>`
    )

    // The stage's own steps, pinned in one by one under it.
    const chips = stage.tiles.slice(0, 5)
    const size = 30
    const gap = 8
    const x0 = c.x + (c.w - (chips.length * size + (chips.length - 1) * gap)) / 2
    chips.forEach((icon, k) => {
      const at = t(i) + ((t(i + 1) - t(i)) * (k + 1)) / (chips.length + 1)
      const x = x0 + k * (size + gap)
      const y = c.y + c.h - size - 18
      out.push(`<g data-t="${at.toFixed(3)}">${tile(x, y, size, 8)}${place(icon, x + 6, y + 6, 18)}</g>`)
    })
  })

  out.push(...arrows([...boxes, tools], t, 12))
  out.push(...toolsPanel(tools, p.tools, t(n), 1, { rx: 16, pad: 16, label: 11, size: 38, gap: 18, rowGap: 12, names: tools.w > 300, name: 11.5 }))
  out.push('</svg>')
  return out.join('\n') + '\n'
}

function dialog(p) {
  const W = 1200
  const H = 750
  const n = p.stages.length
  const { boxes, tools } = layout(n, W, 128, H - 24, 26, 44, 40)
  const t = timing(n)
  const out = svgOpen(W, H, `${plain(p.title)} process map`, 6, p.nodes)

  // Header: still text, so the reader can take in what they are looking at.
  out.push(`<text x="30" y="56" font-family="${FONT}" font-size="30" font-weight="800" fill="#17171c">${esc(p.title)}</text>`)
  wrap(plain(p.caption), 760, 15, 400)
    .slice(0, 2)
    .forEach((line, k) => out.push(`<text x="30" y="${84 + k * 19}" font-family="${FONT}" font-size="15" fill="#55556a">${esc(line)}</text>`))
  const pill = `${p.outcome.value}  ${p.outcome.label}`
  const pw = textWidth(pill, 14, 600) + 40
  out.push(
    `<g data-t="0"><rect x="${(W - 30 - pw).toFixed(1)}" y="34" width="${pw.toFixed(1)}" height="34" rx="17" fill="#fff" stroke="#d9dbe8"/><text x="${(W - 30 - pw / 2).toFixed(1)}" y="56" text-anchor="middle" font-family="${FONT}" font-size="14" fill="#2a2a33"><tspan font-weight="800" fill="#2F6FD6">${esc(p.outcome.value)}</tspan>  ${esc(p.outcome.label)}</text></g>`
  )

  p.stages.forEach((stage, i) => {
    const c = boxes[i]
    const pal = paletteOf(stage, i)
    const title = wrap(plain(stage.title), c.w - 76, 20, 700).slice(0, 2)
    const titleSvg = title
      .map((line, k) => `<text x="${c.x + 60}" y="${c.y + 40 + k * 23}" font-family="${FONT}" font-size="20" font-weight="700" fill="#1d1d27">${esc(line)}</text>`)
      .join('')
    const head = 62 + (title.length - 1) * 23
    const big = place(conceptIcon(stage, pal.accent), c.x + 23, c.y + head + 16, 34)
    out.push(
      `<g data-t="${t(i).toFixed(3)}"><g filter="url(#sh)"><rect x="${c.x}" y="${c.y}" width="${c.w.toFixed(1)}" height="${c.h}" rx="18" fill="${pal.bg}" stroke="${pal.border}" stroke-width="1.8"/></g>${badge(c.x + 32, c.y + 34, 18, i + 1, pal.accent, 18)}${titleSvg}<circle cx="${c.x + 40}" cy="${c.y + head + 33}" r="28" fill="#fff" stroke="${pal.border}" stroke-width="1.6"/>${big}</g>`
    )

    // One bullet per n8n step, written out in order after the box lands.
    const steps = stage.steps
    const room = c.h - head - 16
    const lh = Math.min(26, room / steps.length)
    const bx = c.x + 84
    const maxW = c.x + c.w - 14 - (bx + 26)
    // Boxes pin in a beat after their own time, so bullets wait for it.
    const lead = 0.1
    steps.forEach((step, k) => {
      const at = t(i) + lead + ((t(i + 1) - t(i) - lead) * k) / steps.length
      const y = c.y + head + 6 + k * lh
      let size = 15
      while (size > 12 && textWidth(step.name, size) > maxW) size -= 0.5
      out.push(
        `<g data-t="${at.toFixed(3)}">${place(step.icon, bx, y + lh / 2 - 9, 18)}<text x="${bx + 26}" y="${(y + lh / 2 + size * 0.36).toFixed(1)}" font-family="${FONT}" font-size="${size}" fill="#2f2f3a">${esc(step.name)}</text></g>`
      )
    })
  })

  out.push(...arrows([...boxes, tools], t, 14))
  out.push(...toolsPanel(tools, p.tools, t(n), 1, { rx: 18, pad: 22, label: 13, size: 46, gap: 22, rowGap: 14, names: true, name: 12.5 }))
  out.push('</svg>')
  return out.join('\n') + '\n'
}

const projects = JSON.parse(fs.readFileSync(path.join(__dirname, 'diagrams.json'), 'utf8'))
const only = process.argv.slice(2)
for (const p of projects) {
  if (only.length && !only.includes(p.slug)) continue
  fs.writeFileSync(path.join(OUT, `${p.slug}-card.svg`), card(p))
  fs.writeFileSync(path.join(OUT, `${p.slug}-map.svg`), dialog(p))
  console.log('built', p.slug, p.stages.length, 'stages')
}
