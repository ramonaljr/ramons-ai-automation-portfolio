# Turns a live n8n workflow export into the public-repo workflow.json
# (rules from memory/workflow-repos-publishing.md).
# Usage: python3 sanitize_export.py <workflow-id> <out.json>
#        python3 sanitize_export.py --file <export.json> <out.json>
import json, re, sys

def clean(wf):
    wid = wf.get('id')
    host_re = re.compile(r'https://n8n\.ramonvallejera\.com')
    email_re = re.compile(r'[A-Za-z0-9._%+-]+@(?!example\.com)[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
    RL = {'base': 'YOUR_AIRTABLE_BASE_ID', 'table': 'YOUR_AIRTABLE_TABLE_ID', 'calendar': 'YOUR_CALENDAR_ID',
          'driveId': 'YOUR_DRIVE_ID', 'folderId': 'YOUR_DRIVE_FOLDER_ID', 'channelId': 'YOUR_SLACK_CHANNEL_ID',
          'documentId': 'YOUR_GOOGLE_SHEET_ID', 'fileId': 'YOUR_DRIVE_FILE_ID', 'dataTableId': 'YOUR_DATA_TABLE_ID'}

    def walk(v, key=None):
        if isinstance(v, dict):
            if v.get('__rl'):
                v = dict(v); v.pop('cachedResultUrl', None)
                if key in RL: v['value'] = RL[key]
                if key == 'calendar' and v.get('cachedResultName', '').lower() != 'primary calendar':
                    v['cachedResultName'] = 'you@example.com'
                if key == 'workflowId' and str(v.get('value')) == str(wid): v['value'] = 'THIS_WORKFLOW_ID'
                return {k: walk(x, k) for k, x in v.items()}
            return {k: walk(x, k) for k, x in v.items() if k != 'cachedResultUrl'}
        if isinstance(v, list): return [walk(x, key) for x in v]
        if isinstance(v, str):
            v = host_re.sub('https://your-n8n-instance.example.com', v)
            return email_re.sub('you@example.com', v)
        return v

    nodes = []
    for n in wf['nodes']:
        n = {k: x for k, x in n.items() if k not in ('credentials', 'webhookId')}
        nodes.append(walk(n))
    settings = {'executionOrder': 'v1', 'binaryMode': 'separate'}
    if wf.get('settings', {}).get('timezone'): settings['timezone'] = wf['settings']['timezone']
    return {'name': wf['name'], 'nodes': nodes, 'connections': wf['connections'], 'settings': settings, 'pinData': {}}

if __name__ == '__main__':
    if sys.argv[1] == '--file':
        wf = json.load(open(sys.argv[2])); out = sys.argv[3]
    else:
        sys.path.insert(0, __file__.rsplit('/', 1)[0])
        from n8n_api import api
        wf = api('GET', f'/api/v1/workflows/{sys.argv[1]}'); out = sys.argv[2]
    with open(out, 'w') as f:
        json.dump(clean(wf), f, indent=2, ensure_ascii=False); f.write('\n')
    print('wrote', out)
