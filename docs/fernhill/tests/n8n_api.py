import json,os,urllib.request,sys
c=json.load(open(os.path.expanduser('~/.claude.json')))
env=None
def find(o):
    global env
    if isinstance(o,dict):
        for k,v in o.items():
            if k=='n8n-hosted' and isinstance(v,dict) and 'env' in v: env=v['env']
            else: find(v)
    elif isinstance(o,list):
        for v in o: find(v)
find(c)
URL=env['N8N_API_URL'].rstrip('/'); KEY=env['N8N_API_KEY']
def api(method,p,body=None):
    data=json.dumps(body).encode() if body is not None else None
    r=urllib.request.Request(URL+p,data=data,method=method,headers={'X-N8N-API-KEY':KEY,'Content-Type':'application/json'})
    try: return json.load(urllib.request.urlopen(r))
    except urllib.error.HTTPError as e: print('HTTP',e.code,e.read().decode()[:800]); raise
