import requests, time

base = 'http://localhost:8000/api/v1'
headers = {'X-Session-Id': 'debug-session-2'}

# Create conversation
conv = requests.post(f'{base}/conversations', json={'title': 'Resume Test', 'mode': 'resume_analysis'}, headers=headers).json()
print('Created:', conv['id'])

# Check initial scores
health1 = requests.get(f'{base}/career/health', headers=headers).json()
print('Before:', health1)

# Stream chat
resp = requests.get(f'{base}/conversations/{conv["id"]}/stream?content=My+resume%3A+John+Doe%2C+Software+Engineer%2C+5+years%2C+skills%3A+Python%2C+React%2C+AWS&mode=resume_analysis', headers=headers, stream=True, timeout=30)
print('Stream status:', resp.status_code)
chunks = []
for line in resp.iter_lines():
    if line:
        chunks.append(line.decode())
        if len(chunks) >= 5:
            break
print('First chunks:', chunks[:3])

# Wait for DB commit
time.sleep(2)

# Check scores after
health2 = requests.get(f'{base}/career/health', headers=headers).json()
print('After:', health2)

# Check messages
msgs = requests.get(f'{base}/conversations/{conv["id"]}/messages', headers=headers).json()
print('Messages:', len(msgs))
if msgs:
    print('Last msg role:', msgs[-1]['role'])
    print('Last msg content:', msgs[-1]['content'][:100])