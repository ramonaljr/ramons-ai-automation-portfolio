# Handover chat test harness: send a simulated WhatsApp customer message, or
# wait for the run a Slack post triggers, then print the nodes that ran and
# their key outputs so each case can be scored against its pass rule.
import sys, json, time, subprocess, datetime as dt; sys.path.insert(0, '.')
from n8n_api import api
WF = 'WkHI3pEDcVumGg6o'; NUM = '15550001001'
def now(): return dt.datetime.now(dt.timezone.utc).strftime('%Y-%m-%dT%H:%M:%S')
def runs(since, need, timeout=150):
    end = time.time() + timeout
    while time.time() < end:
        out = []
        for e in api('GET', f'/api/v1/executions?workflowId={WF}&limit=8&includeData=true')['data']:
            if (e.get('startedAt') or '')[:19] < since: continue
            rd = e['data']['resultData']['runData']
            if need in rd: out.append(e)
        if out: return out
        time.sleep(4)
    return []
def show(e):
    rd = e['data']['resultData']['runData']
    print('== run', e['id'], e['status'], '| nodes:', ', '.join(rd))
    for k in ('Fernhill Support Agent','Check Reply','Apply Rules','Post Handover To Slack','Log Case','Pass Message To Team','Read Team Reply',
              'What Did They Do?','Send Team Reply','Tick Sent Reply','Alert Team: Reply Not Sent','Close Case','Tell Customer Resolved','Confirm Case Closed','Tell Team: Case Already Closed','Email In Message?','Check Email On Order','Save Email On Case','Note: Email Checked'):
        if k not in rd: continue
        x = rd[k][0]; d = x.get('data', {}).get('main', [])
        j = next((o[0]['json'] for o in d if o), {})
        if isinstance(j.get('message'), dict): j = {'ts': j.get('ts'), 'thread_ts': j['message'].get('thread_ts'), 'text': j['message'].get('text')}
        if 'fields' in j: j = {f: j['fields'].get(f) for f in ('Case ID','Status','Decision','Slack Thread','Resolved')}
        if k == 'Apply Rules': j = {f: j.get(f) for f in ('decision','channel','test','orderNumber')}
        if k == 'Check Reply': j = {f: j.get(f) for f in ('reply','escalation','tools','failed')}
        print(f'   {k} outs={[len(o or []) for o in d]} {json.dumps(j)[:260]}', ('ERR ' + x['error']['message']) if x.get('error') else '')
if __name__ == '__main__':
    mode = sys.argv[1]; t0 = now()
    if mode == 'send':
        body = {'sessionId': NUM, 'message': sys.argv[2], 'channel': 'whatsapp'}
        if len(sys.argv) > 3 and sys.argv[3] == 'test': body['test'] = True
        r = subprocess.run(['python3', 'webhook.py', 'fernhill-support-chat', json.dumps(body)], capture_output=True, text=True, timeout=200)
        print('HTTP:', r.stdout.strip()[:400])
        for e in runs(t0, 'Prepare Message'): show(e)
    elif mode == 'show':  # show runs since argv[2] that ran node argv[3]
        for e in runs(sys.argv[2], sys.argv[3], 30): show(e)
    else:  # wait for a Slack-triggered run after timestamp argv[2]
        for e in runs(sys.argv[2], 'Read Team Reply', 60): show(e)
