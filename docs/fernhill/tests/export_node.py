# Writes the live "Read Team Reply" Code node to read_team_reply.js for the unit test.
from n8n_api import api
wf = api('GET', '/api/v1/workflows/WkHI3pEDcVumGg6o')
code = next(n for n in wf['nodes'] if n['name'] == 'Read Team Reply')['parameters']['jsCode']
open('read_team_reply.js', 'w').write(code); print('wrote read_team_reply.js')
