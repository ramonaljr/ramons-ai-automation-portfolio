# Deletes the Fernhill Support Cases row(s) for the tester's phone, so the next
# WhatsApp message counts as a new chat (do this before recording the Loom).
# Uses a temporary webhook workflow (the Airtable credential stays inside n8n),
# then removes it. The phone's Case ID is read from the latest WhatsApp run and
# never printed.
# Usage: python3 delete_phone_case.py [--dry]
import json, time, uuid, urllib.request, sys
from n8n_api import api, env

DRY = '--dry' in sys.argv
WF, BASE_ID, TABLE = 'WkHI3pEDcVumGg6o', 'appw1yUrOEX5UPzzV', 'tblgrQcMnm2iHFQJG'
live = api('GET', f'/api/v1/workflows/{WF}')
cred = [n for n in live['nodes'] if n['name'] == 'Find Open Handover'][0]['credentials']

case_id = None
for e in api('GET', f'/api/v1/executions?workflowId={WF}&limit=50')['data']:
    rd = api('GET', f"/api/v1/executions/{e['id']}?includeData=true")['data']['resultData'].get('runData', {})
    for r in rd.get('Prepare Message', []):
        j = r.get('data', {}).get('main', [[{}]])[0][0].get('json', {})
        sid = str(j.get('sessionId', ''))
        if j.get('channel') == 'whatsapp' and sid.startswith('whatsapp:') and sid[9:].isdigit():
            case_id = sid; break
    if case_id: break
assert case_id, 'no WhatsApp run found'

path = 'tmp-del-' + uuid.uuid4().hex[:12]
rl = lambda v: {'__rl': True, 'mode': 'id', 'value': v}
nodes = [
    {'name': 'In', 'type': 'n8n-nodes-base.webhook', 'typeVersion': 2, 'position': [0, 0], 'webhookId': str(uuid.uuid4()),
     'parameters': {'path': path, 'httpMethod': 'POST', 'responseMode': 'lastNode', 'options': {}}},
    {'name': 'Find', 'type': 'n8n-nodes-base.airtable', 'typeVersion': 2.2, 'position': [200, 0], 'credentials': cred, 'alwaysOutputData': True,
     'parameters': {'operation': 'search', 'base': rl(BASE_ID), 'table': rl(TABLE),
                    'filterByFormula': "={{ \"{Case ID}='\" + $json.body.case_id + \"'\" }}", 'returnAll': True, 'options': {}}},
    {'name': 'Delete', 'type': 'n8n-nodes-base.airtable', 'typeVersion': 2.2, 'position': [400, 0], 'credentials': cred,
     'parameters': {'operation': 'deleteRecord', 'base': rl(BASE_ID), 'table': rl(TABLE), 'id': '={{ $json.id }}'}},
]
conn = {'In': {'main': [[{'node': 'Find', 'type': 'main', 'index': 0}]]},
        'Find': {'main': [[{'node': 'Delete', 'type': 'main', 'index': 0}]]}}
if DRY:
    nodes, conn = nodes[:2], {'In': conn['In']}
t = api('POST', '/api/v1/workflows', {'name': 'TEMP delete phone case (auto-removed)', 'nodes': nodes,
                                      'connections': conn, 'settings': {'executionOrder': 'v1'}})
try:
    api('POST', f"/api/v1/workflows/{t['id']}/activate")
    time.sleep(1)
    url = env['N8N_API_URL'].rstrip('/').removesuffix('/api/v1') + '/webhook/' + path
    req = urllib.request.Request(url, data=json.dumps({'case_id': case_id}).encode(), method='POST',
                                 headers={'Content-Type': 'application/json'})
    out = urllib.request.urlopen(req).read().decode()
    rows = json.loads(out) if out.strip() else []
    rows = rows if isinstance(rows, list) else [rows]
    print('found' if DRY else 'deleted', sum(1 for r in rows if r.get('id')), 'row(s)')
finally:
    try: api('POST', f"/api/v1/workflows/{t['id']}/deactivate")
    except Exception: pass
    api('DELETE', f"/api/v1/workflows/{t['id']}")
    print('temp workflow removed')
