"""One-off: pull each project's stages, steps and icons out of the old card
and map SVGs into diagrams.json, the source the diagram builder reads.

Run from the repo root before the old SVGs are replaced:
    python3 docs/process-diagrams/extract-once.py
"""
import json, re

SLUGS = ['hr-evaluation-assistant', 'ai-appointment-setter', 'ai-prospecting-apollo', 'solar-lead-scoring-follow-up',
         'hotel-employee-onboarding', 'ai-unpaid-invoice-reminders', 'ai-invoice-processing-approval']

# The HR map draws stages 2 to 5 on one row; these are its splits, in order.
HR_ROW2 = [3, 2, 2, 2]

# The appointment setter's voice agent sits across every stage; it is credited
# in the tools strip rather than listed under one stage.
SKIP = {'VAPI voice agent'}


def tops(svg):
    """Top-level elements after <defs>."""
    body = svg.split('</defs>', 1)[1]
    out, depth, start = [], 0, None
    for m in re.finditer(r'<(/?)([a-zA-Z]+)([^>]*?)(/?)>', body):
        close, _, _, selfc = m.groups()
        if close:
            depth -= 1
            if depth == 0:
                out.append(body[start:m.end()])
            continue
        if depth == 0:
            start = m.start()
            if selfc:
                out.append(body[start:m.end()])
                continue
        if not selfc:
            depth += 1
    return out


def icon(seg):
    m = re.search(r'<svg x="[\d.]+" y="[\d.]+" width="\d+" height="\d+" (viewBox="0 0 24 24".*?</svg>)', seg, re.S)
    return '<svg ' + m.group(1) if m else ''


def frontmatter(slug):
    text = open(f'src/content/case-studies/{slug}.mdx').read().split('---')[1]
    get = lambda k: (re.search(rf"^{k}: '(.*)'$", text, re.M) or [None, ''])[1].replace("''", "'")
    tools = re.search(r"^integrations: \[(.*)\]$", text, re.M).group(1)
    outcome = re.search(r"keyOutcome:\n\s+value: '(.*)'\n\s+label: '(.*)'", text)
    return {'title': get('title'), 'tools': re.findall(r"'([^']+)'", tools),
            'outcome': {'value': outcome.group(1), 'label': outcome.group(2)}}


projects = []
for slug in SLUGS:
    card = open(f'public/images/workflows/{slug}-card.svg').read()
    mp = open(f'public/images/workflows/{slug}-map.svg').read()

    stages = []
    for el in tops(card):
        m = re.match(r'<g[^>]*>\s*<rect x="[\d.]+" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"', el)
        if m and float(m.group(2)) > 320:
            title = re.search(r'<text[^>]*>([^<]*)</text>', el).group(1)
            stages.append({'title': title, 'y': float(m.group(1)), 'h': float(m.group(3)), 'tiles': [], 'steps': []})
    for el in tops(card):
        m = re.search(r'<g filter="url\(#sh\)"><rect x="[\d.]+" y="([\d.]+)"', el)
        if m:
            y = float(m.group(1))
            for st in stages:
                if st['y'] - 5 <= y <= st['y'] + st['h']:
                    st['tiles'].append(icon(el))

    rows = {}
    for el in tops(mp):
        m = re.search(r'<g filter="url\(#sh\)"><rect x="([\d.]+)" y="([\d.]+)" width="(\d+)"', el)
        if not m:
            continue
        # The name is every dark label line (long names wrap onto two); the
        # grey line under it is the n8n operation, and white text is a badge.
        name = ' '.join(re.findall(r'<text[^>]*fill="#2a2a33"[^>]*>([^<]*)</text>', el)).strip()
        if not name:
            # The wide AI tiles print their name inside the tile instead.
            texts = re.findall(r'<text([^>]*)>([^<]*)</text>', el)
            first = next(a for a, t in texts if len(t.strip()) > 1 and not t.strip().isdigit())
            style = lambda a: (re.search(r'fill="[^"]*"', a) or [''])[0] + (re.search(r'font-size="[^"]*"', a) or [''])[0]
            name = ' '.join(t.strip() for a, t in texts if style(a) == style(first) and len(t.strip()) > 1)
        if name in SKIP:
            continue
        rows.setdefault(round(float(m.group(2))), []).append((float(m.group(1)), {'name': name, 'icon': icon(el)}))
    # Tiles of different sizes sit a few units apart on the same row.
    merged = []
    for y in sorted(rows):
        if merged and y - merged[-1][0] < 12:
            merged[-1][1].extend(rows[y])
        else:
            merged.append((y, list(rows[y])))
    rows = [[step for _, step in sorted(r, key=lambda t: t[0])] for _, r in merged]
    if slug == 'hr-evaluation-assistant':
        first, rest, split = rows[0], rows[1], []
        for n in HR_ROW2:
            split.append(rest[:n])
            rest = rest[n:]
        rows = [first] + split
    assert len(rows) == len(stages), (slug, len(rows), len(stages))
    for st, row in zip(stages, rows):
        st['steps'] = row
        del st['y'], st['h']

    caption = ''
    i = mp.find('fill="#161c24"')
    if i > -1:
        caption = ' '.join(re.findall(r'<text[^>]*>([^<]*)</text>', mp[i:i + 3000]))
    nodes = int(re.search(r'data-nodes="(\d+)"', card).group(1))

    projects.append({'slug': slug, **frontmatter(slug), 'caption': caption, 'nodes': nodes, 'stages': stages})

json.dump(projects, open('docs/process-diagrams/diagrams.json', 'w'), indent=1, ensure_ascii=False)
for p in projects:
    print(p['slug'], '|', len(p['stages']), 'stages |', [len(s['steps']) for s in p['stages']], '| tiles', [len(s['tiles']) for s in p['stages']])
