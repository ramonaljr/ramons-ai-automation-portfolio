# Writes the live new-chat intake logic to intake_nodes.json for the offline
# intake test (layer I): the agent prompt, the detail-saving nodes, the
# handover check and Apply Rules. No OpenAI calls, so it costs nothing.
import json
from n8n_api import api
wf = api('GET', '/api/v1/workflows/WkHI3pEDcVumGg6o')
N = {n['name']: n['parameters'] for n in wf['nodes']}
out = {
    'systemMessage': N['Fernhill Support Agent']['options']['systemMessage'],
    'saveColumns': N['Save Details On Case']['columns']['value'],
    'detailsSaved': N['Details Saved']['assignments']['assignments'][0]['value'],
    'personHasCase': N['Person Has This Case?']['conditions']['conditions'][0]['leftValue'],
    'savedEmailInput': N['Request Team Action']['workflowInputs']['value']['saved_email'],
    'logCaseEmail': N['Log Case']['columns']['value']['Customer Email'],
    'applyRules': N['Apply Rules']['jsCode'],
    'chatModel': N['OpenAI Chat Model']['model']['value'],
}
json.dump(out, open('intake_nodes.json', 'w'), indent=1)
print('wrote intake_nodes.json')
