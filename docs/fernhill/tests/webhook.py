# Calls a Fernhill n8n webhook with the portfolio key from .env.local.
# Usage: python3 webhook.py <path> '<json body>'
import json,sys,re,urllib.request
env=open("/Users/ramonvallejerajr/Developer/Ramon's AI Automation Portfolio/.env.local").read()
k=re.search(r'^N8N_WEBHOOK_KEY=["\']?([^"\'\n]+)',env,re.M).group(1)
r=urllib.request.Request("https://n8n.ramonvallejera.com/webhook/"+sys.argv[1],data=(sys.argv[2] if len(sys.argv)>2 else "{}").encode(),headers={"Content-Type":"application/json","X-Portfolio-Key":k,"User-Agent":"Mozilla/5.0 Chrome/130"},method="POST")
try:
  with urllib.request.urlopen(r,timeout=180) as x: print(x.status,x.read().decode())
except urllib.error.HTTPError as e: print("HTTP",e.code,e.read().decode())
