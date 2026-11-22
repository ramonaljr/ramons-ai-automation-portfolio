# Removes the Apollo demo's two saved prospects (Lia Fernandez, Marco Villanueva)
# from the Prospecting sheet, so the next form run treats them as new
# (do this before each Loom take of the Apollo workflow).
# Uses a temporary webhook workflow (the Google credential stays inside n8n),
# then removes it. Rows are matched by apolloId, never by row number.
# Usage: python3 reset_apollo_demo.py [--dry]
import json, time, uuid, urllib.request, sys
from n8n_api import api, env

DRY = '--dry' in sys.argv
WF, SHEET_ID, TAB = 'kUDrvFXXoYQ7FUwB', '124rOjxjUNNU1VGFu27fGpKIPPyH9beKItd3sZqYPzmg', 'Prospects'
IDS = ['sample-p103', 'sample-p104']
live = api('GET', f'/api/v1/workflows/{WF}')
cred = [n for n in live['nodes'] if n['name'] == 'Load Known Prospects'][0]['credentials']

doc = {'__rl': True, 'mode': 'id', 'value': SHEET_ID}
tab = {'__rl': True, 'mode': 'name', 'value': TAB}
pick = ("const ids = " + json.dumps(IDS) + ";\n"
        "const rows = $input.all().map(i => i.json).filter(r => ids.includes(String(r.apolloId)));\n"
        "rows.sort((a, b) => b.row_number - a.row_number); // bottom first, so numbers don't shift\n"
        "return rows.map(r => ({ json: { row_number: r.row_number, apolloId: r.apolloId } }));")
path = 'tmp-apollo-reset-' + uuid.uuid4().hex[:12]
nodes = [
    {'name': 'In', 'type': 'n8n-nodes-base.webhook', 'typeVersion': 2, 'position': [0, 0], 'webhookId': str(uuid.uuid4()),
     'parameters': {'path': path, 'httpMethod': 'POST', 'responseMode': 'lastNode', 'options': {}}},
    {'name': 'Read', 'type': 'n8n-nodes-base.googleSheets', 'typeVersion': 4.7, 'position': [200, 0], 'credentials': cred,
     'parameters': {'documentId': doc, 'sheetName': tab, 'options': {}}},
    {'name': 'Pick', 'type': 'n8n-nodes-base.code', 'typeVersion': 2, 'position': [400, 0], 'alwaysOutputData': True,
     'parameters': {'jsCode': pick}},
    {'name': 'Delete', 'type': 'n8n-nodes-base.googleSheets', 'typeVersion': 4.7, 'position': [600, 0], 'credentials': cred,
     'parameters': {'operation': 'delete', 'documentId': doc, 'sheetName': tab,
                    'toDelete': 'rows', 'startIndex': '={{ $json.row_number }}', 'numberToDelete': 1}},
]
conn = {'In': {'main': [[{'node': 'Read', 'type': 'main', 'index': 0}]]},
        'Read': {'main': [[{'node': 'Pick', 'type': 'main', 'index': 0}]]},
        'Pick': {'main': [[{'node': 'Delete', 'type': 'main', 'index': 0}]]}}
if DRY:
    nodes, conn = nodes[:3], {k: conn[k] for k in ('In', 'Read')}
t = api('POST', '/api/v1/workflows', {'name': 'TEMP reset Apollo demo rows (auto-removed)', 'nodes': nodes,
                                      'connections': conn, 'settings': {'executionOrder': 'v1'}})
try:
    api('POST', f"/api/v1/workflows/{t['id']}/activate")
    time.sleep(1)
    url = env['N8N_API_URL'].rstrip('/').removesuffix('/api/v1') + '/webhook/' + path
    req = urllib.request.Request(url, data=b'{}', method='POST', headers={'Content-Type': 'application/json'})
    out = urllib.request.urlopen(req).read().decode()
    print('response:', out[:300] or '(empty)')
    if DRY:
        rows = json.loads(out) if out.strip() else []
        rows = rows if isinstance(rows, list) else [rows]
        print('would delete:', [(r.get('apolloId'), r.get('row_number')) for r in rows if r.get('apolloId')])
finally:
    try: api('POST', f"/api/v1/workflows/{t['id']}/deactivate")
    except Exception: pass
    api('DELETE', f"/api/v1/workflows/{t['id']}")
    print('temp workflow removed')
